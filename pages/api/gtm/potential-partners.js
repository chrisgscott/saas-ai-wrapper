import { Configuration, OpenAIApi } from 'openai';
import dbConnect from '../../../lib/mongodb';
import Strategy from '../../../models/Strategy';
import config from '../../config';
import { ERROR_MESSAGES } from '../../constants';

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

      const prompt = `Based on the following SaaS idea, suggest potential partners:

Industry: ${strategy.industry}
Idea Description: ${strategy.ideaDescription}
Target Market: ${strategy.targetMarket}
Problem Solved: ${strategy.problemDescription}

Please provide 5-7 potential partners or types of partners that could help amplify the reach of this SaaS product. Include a brief explanation for each.

Format the response as JSON, following this structure:
{
  "PotentialPartners": [
    {
      "name": "Partner Name",
      "explanation": "Brief explanation of why this partner is a good fit"
    }
  ]
}`;

      const response = await openai.createChatCompletion({
        model: config.openai.model,
        messages: [
          { role: "system", content: "You are a helpful assistant that suggests potential partners for SaaS products." },
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

      // Parse the cleaned JSON
      const partnerData = JSON.parse(content);

      // Update the strategy with the new potential partners
      strategy.strategy.potentialPartners = partnerData.PotentialPartners;
      await strategy.save();

      res.status(200).json({ success: true, potentialPartners: partnerData.PotentialPartners });
    } catch (error) {
      console.error('Error in potential-partners:', error);
      res.status(500).json({ success: false, error: ERROR_MESSAGES.GENERAL_ERROR });
    }
  } else {
    res.status(405).json({ success: false, error: ERROR_MESSAGES.METHOD_NOT_ALLOWED });
  }
}