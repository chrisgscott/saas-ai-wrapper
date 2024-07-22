import { Configuration, OpenAIApi } from 'openai';
import dbConnect from '../../../lib/mongodb';
import Strategy from '../../../models/Strategy';
import config from '../../../config';
import { ERROR_MESSAGES } from '../../../constants';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await dbConnect();

      const { strategyId } = req.query;

      console.log('Fetching strategy with ID:', strategyId);
      const strategy = await Strategy.findById(strategyId);
      if (!strategy) {
        console.log('Strategy not found');
        return res.status(404).json({ success: false, error: 'Strategy not found' });
      }

      console.log('Strategy found:', JSON.stringify(strategy, null, 2));

      // Check if ideal client data already exists and is not empty
      if (strategy.strategy && 
          strategy.strategy.idealClient && 
          strategy.strategy.idealClient.CustomerPersonas && 
          strategy.strategy.idealClient.CustomerPersonas.length > 0) {
        console.log('Returning existing ideal client data');
        return res.status(200).json({ success: true, idealClient: strategy.strategy.idealClient });
      }

      console.log('Generating new ideal client data');

      const prompt = `Based on the following SaaS idea, generate an Ideal Client profile:

Industry: ${strategy.industry}
Idea Description: ${strategy.ideaDescription}
Target Market: ${strategy.targetMarket}
Problem Solved: ${strategy.problemDescription}

Please provide a detailed Ideal Client profile including:
1. Customer Personas (2-3 personas)
   - Name
   - Demographics (Age, Occupation, etc.)
   - Behaviors
   - Pain Points
2. Insights about the ideal client

Format the response as JSON, following this structure:
{
  "IdealClient": {
    "CustomerPersonas": [
      {
        "Name": "Persona Name",
        "Demographics": {
          "Age": "Age range",
          "Occupation": "Occupation"
        },
        "Behaviors": ["Behavior 1", "Behavior 2"],
        "PainPoints": ["Pain Point 1", "Pain Point 2"]
      }
    ],
    "Insights": ["Insight 1", "Insight 2"]
  }
}`;

      const response = await openai.createChatCompletion({
        model: config.openai.model,
        messages: [
          { role: "system", content: "You are a helpful assistant that generates ideal client profiles for SaaS products." },
          { role: "user", content: prompt }
        ],
        max_tokens: config.openai.maxTokens,
        n: 1,
        stop: null,
        temperature: config.openai.temperature,
      });

      let content = response.data.choices[0].message.content;
      
      // Remove any markdown formatting
      content = content.replace(/```json\n?|\n?```/g, '');

      console.log('OpenAI response:', content);

      // Parse the cleaned JSON
      const idealClientData = JSON.parse(content);

      // Update the strategy with the new ideal client data
      if (!strategy.strategy) {
        strategy.strategy = {};
      }
      strategy.strategy.idealClient = idealClientData.IdealClient;
      
      console.log('Saving strategy with new ideal client data:', JSON.stringify(strategy, null, 2));
      
      await strategy.save();

      console.log('New ideal client data saved');
      res.status(200).json({ success: true, idealClient: idealClientData.IdealClient });
    } catch (error) {
      console.error('Error in ideal-client:', error);
      res.status(500).json({ success: false, error: ERROR_MESSAGES.GENERAL_ERROR });
    }
  } else {
    res.status(405).json({ success: false, error: ERROR_MESSAGES.METHOD_NOT_ALLOWED });
  }
}