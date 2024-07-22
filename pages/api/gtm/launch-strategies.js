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

      // Check if launch strategies already exist
      if (strategy.strategy.launchStrategies && strategy.strategy.launchStrategies.length > 0) {
        return res.status(200).json({ success: true, launchStrategies: strategy.strategy.launchStrategies });
      }

      const prompt = `Based on the following SaaS idea, generate launch strategies:

Industry: ${strategy.industry}
Idea Description: ${strategy.ideaDescription}
Target Market: ${strategy.targetMarket}
Problem Solved: ${strategy.problemDescription}

Please provide 5-7 detailed launch strategies for this SaaS product. Include a mix of marketing, PR, and product-focused strategies.

Format the response as JSON, following this structure:
{
  "LaunchStrategies": [
    {
      "strategy": "Strategy name",
      "explanation": "Detailed explanation of the strategy"
    }
  ]
}`;

      const response = await openai.createChatCompletion({
        model: config.openai.model,
        messages: [
          { role: "system", content: "You are a helpful assistant that generates launch strategies for SaaS products." },
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

      // Attempt to fix unterminated strings
      content = content.replace(/([^\\])"([^"]*)$/, '$1"$2"');

      // Parse the cleaned JSON
      let launchData;
      try {
        launchData = JSON.parse(content);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        console.log('Raw content:', content);
        
        // Attempt to salvage partial data
        const partialMatch = content.match(/^\s*{\s*"LaunchStrategies"\s*:\s*\[([\s\S]*?)\]\s*}/);
        if (partialMatch) {
          const partialContent = `{"LaunchStrategies": [${partialMatch[1]}]}`;
          try {
            launchData = JSON.parse(partialContent);
          } catch (secondParseError) {
            console.error('Error parsing partial JSON:', secondParseError);
            throw new Error('Failed to parse OpenAI response as JSON');
          }
        } else {
          throw new Error('Failed to parse OpenAI response as JSON');
        }
      }

      // Ensure each strategy has a complete explanation
      launchData.LaunchStrategies = launchData.LaunchStrategies.map(strategy => ({
        ...strategy,
        explanation: strategy.explanation.replace(/([^.!?])$/, '$1...')
      }));

      // Update the strategy with the new launch strategies
      strategy.strategy.launchStrategies = launchData.LaunchStrategies;
      await strategy.save();

      res.status(200).json({ success: true, launchStrategies: launchData.LaunchStrategies });
    } catch (error) {
      console.error('Error in launch-strategies:', error);
      res.status(500).json({ success: false, error: ERROR_MESSAGES.GENERAL_ERROR });
    }
  } else {
    res.status(405).json({ success: false, error: ERROR_MESSAGES.METHOD_NOT_ALLOWED });
  }
}