import { Configuration, OpenAIApi } from 'openai';
import dbConnect from '../../lib/mongodb';
import Strategy from '../../models/Strategy';
import config from '../../config';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await dbConnect();

      const { industry, ideaDescription, targetMarket, problemDescription } = req.body;

      const prompt = `You are a highly experienced SaaS consultant. A non-technical founder has approached you with an idea for a SaaS product. Their goal is to get a comprehensive go-to-market strategy tailored to their specific needs. Please generate MVP Features based on the following information:

SaaS Idea Information:
- Industry: ${industry}
- Idea Description: ${ideaDescription}
- Target Market: ${targetMarket}
- Problem Solved: ${problemDescription}

Please generate MVP Features for this SaaS idea, including the following:

1. Core Features (3-5 key features)
2. User Feedback Tools (2-3 tools)

Please format and structure the response as JSON, following this example structure:

{
  "MVPFeatures": {
    "CoreFeatures": ["feature1", "feature2", "feature3"],
    "UserFeedbackTools": ["tool1", "tool2"]
  }
}

Ensure that the features are comprehensive, detailed, and tailored to the specific SaaS idea and information provided. Do not include any markdown formatting in your response, just pure JSON.`;

      console.log('Sending request to OpenAI API with prompt:', prompt);

      const response = await openai.createChatCompletion({
        model: config.openai.model,
        messages: [
          { role: "system", content: "You are a helpful assistant that generates MVP features for SaaS products." },
          { role: "user", content: prompt }
        ],
        max_tokens: config.openai.maxTokens,
        n: 1,
        stop: null,
        temperature: config.openai.temperature,
      });

      console.log('Raw OpenAI API response:', JSON.stringify(response.data, null, 2));

      let content = response.data.choices[0].message.content;
      console.log('Extracted content from OpenAI response:', content);
      
      // Remove any markdown formatting
      content = content.replace(/```json\n?|\n?```/g, '');
      console.log('Content after removing markdown:', content);

      // Parse the cleaned JSON
      let strategyData;
      try {
        strategyData = JSON.parse(content);
        console.log('Parsed strategy data:', JSON.stringify(strategyData, null, 2));
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        throw new Error('Failed to parse OpenAI response as JSON');
      }

      const strategy = new Strategy({
        industry,
        ideaDescription,
        targetMarket,
        problemDescription,
        strategy: {
          mvpFeatures: {
            coreFeatures: strategyData.MVPFeatures.CoreFeatures,
            userFeedbackTools: strategyData.MVPFeatures.UserFeedbackTools
          }
        }
      });

      await strategy.save();
      console.log('Saved strategy to database:', JSON.stringify(strategy, null, 2));

      res.status(200).json({ success: true, strategyId: strategy._id, mvpFeatures: strategyData.MVPFeatures });
    } catch (error) {
      console.error('Error in submit-form:', error);
      res.status(500).json({ success: false, error: error.message || 'An error occurred while processing your request.' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}