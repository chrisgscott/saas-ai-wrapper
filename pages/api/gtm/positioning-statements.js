import { Configuration, OpenAIApi } from 'openai';
import dbConnect from '../../../lib/mongodb';
import Strategy from '../../../models/Strategy';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await dbConnect();

      const { strategyId } = req.query;

      const strategy = await Strategy.findById(strategyId);
      if (!strategy) {
        return res.status(404).json({ success: false, error: 'Strategy not found' });
      }

      const prompt = `Based on the following SaaS idea, generate Positioning Statements:

Industry: ${strategy.industry}
Idea Description: ${strategy.ideaDescription}
Target Market: ${strategy.targetMarket}
Problem Solved: ${strategy.problemDescription}

Please provide 3-5 compelling positioning statements that highlight the unique value proposition of the SaaS product.

Format the response as JSON, following this structure:
{
  "PositioningStatements": [
    "Statement 1",
    "Statement 2",
    "Statement 3"
  ]
}`;

      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that generates positioning statements for SaaS products." },
          { role: "user", content: prompt }
        ],
        max_tokens: 500,
        n: 1,
        stop: null,
        temperature: 0.7,
      });

      let content = response.data.choices[0].message.content;
      
      // Remove any markdown formatting
      content = content.replace(/```json\n?|\n?```/g, '');

      // Parse the cleaned JSON
      const positioningData = JSON.parse(content);

      // Update the strategy with the new positioning statements
      strategy.strategy.positioningStatements = positioningData.PositioningStatements;
      await strategy.save();

      res.status(200).json({ success: true, positioningStatements: positioningData.PositioningStatements });
    } catch (error) {
      console.error('Error in positioning-statements:', error);
      res.status(500).json({ success: false, error: error.message || 'An error occurred while processing your request.' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}