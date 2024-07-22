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

      const strategy = await Strategy.findById(strategyId);
      if (!strategy) {
        return res.status(404).json({ success: false, error: 'Strategy not found' });
      }

      // Check if post-launch strategies already exist
      if (strategy.strategy.postLaunchStrategies && strategy.strategy.postLaunchStrategies.length > 0) {
        return res.status(200).json({ success: true, postLaunchStrategies: strategy.strategy.postLaunchStrategies });
      }

      const prompt = `Based on the following SaaS idea, create post-launch strategies:

Industry: ${strategy.industry}
Idea Description: ${strategy.ideaDescription}
Target Market: ${strategy.targetMarket}
Problem Solved: ${strategy.problemDescription}

Please provide 5-7 detailed post-launch strategies for this SaaS product. Include strategies for user retention, growth, feature expansion, and customer feedback incorporation.

Format the response as JSON, following this structure:
{
  "PostLaunchStrategies": [
    {
      "strategy": "Strategy name",
      "explanation": "Detailed explanation of the strategy"
    }
  ]
}`;

      const response = await openai.createChatCompletion({
        model: config.openai.model,
        messages: [
          { role: "system", content: "You are a helpful assistant that creates post-launch strategies for SaaS products." },
          { role: "user", content: prompt }
        ],
        max_tokens: config.openai.maxTokens,
        n: 1,
        stop: null,
        temperature: config.openai.temperature,
      });

      let content = response.data.choices[0].message.content;
      
      // Remove any markdown formatting and clean the JSON
      content = content.replace(/```json\n?|\n?```/g, '');
      content = content.replace(/\\n/g, '\\n')
                       .replace(/\\'/g, "\\'")
                       .replace(/\\"/g, '\\"')
                       .replace(/\\&/g, '\\&')
                       .replace(/\\r/g, '\\r')
                       .replace(/\\t/g, '\\t')
                       .replace(/\\b/g, '\\b')
                       .replace(/\\f/g, '\\f');

      // Parse the cleaned JSON
      let postLaunchData;
      try {
        postLaunchData = JSON.parse(content);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        console.log('Raw content:', content);
        throw new Error('Failed to parse OpenAI response as JSON');
      }

      // Update the strategy with the new post-launch strategies
      strategy.strategy.postLaunchStrategies = postLaunchData.PostLaunchStrategies;
      await strategy.save();

      res.status(200).json({ success: true, postLaunchStrategies: postLaunchData.PostLaunchStrategies });
    } catch (error) {
      console.error('Error in post-launch-strategies:', error);
      res.status(500).json({ success: false, error: ERROR_MESSAGES.GENERAL_ERROR });
    }
  } else {
    res.status(405).json({ success: false, error: ERROR_MESSAGES.METHOD_NOT_ALLOWED });
  }
}