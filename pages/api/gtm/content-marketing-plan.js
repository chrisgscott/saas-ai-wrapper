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

      // Check if contentMarketingPlan already exists
      if (strategy.strategy.contentMarketingPlan && strategy.strategy.contentMarketingPlan.length > 0) {
        return res.status(200).json({ success: true, contentMarketingPlan: strategy.strategy.contentMarketingPlan });
      }

      const prompt = `Based on the following SaaS idea, create a content marketing plan:

Industry: ${strategy.industry}
Idea Description: ${strategy.ideaDescription}
Target Market: ${strategy.targetMarket}
Problem Solved: ${strategy.problemDescription}

Please provide a detailed content marketing plan with 5-7 key strategies or content types. For each, include the type of content, target audience, and expected outcome.

Format the response as JSON, following this structure:
{
  "ContentMarketingPlan": [
    {
      "contentType": "Type of content",
      "targetAudience": "Specific audience for this content",
      "expectedOutcome": "Expected result or benefit of this content"
    }
  ]
}`;

      const response = await openai.createChatCompletion({
        model: config.openai.model,
        messages: [
          { role: "system", content: "You are a helpful assistant that creates content marketing plans for SaaS products." },
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
      const contentMarketingData = JSON.parse(content);

      // Update the strategy with the new content marketing plan
      strategy.strategy.contentMarketingPlan = contentMarketingData.ContentMarketingPlan;
      await strategy.save();

      res.status(200).json({ success: true, contentMarketingPlan: contentMarketingData.ContentMarketingPlan });
    } catch (error) {
      console.error('Error in content-marketing-plan:', error);
      res.status(500).json({ success: false, error: ERROR_MESSAGES.GENERAL_ERROR });
    }
  } else {
    res.status(405).json({ success: false, error: ERROR_MESSAGES.METHOD_NOT_ALLOWED });
  }
}