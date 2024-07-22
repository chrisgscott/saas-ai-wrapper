import { Configuration, OpenAIApi } from 'openai';
import dbConnect from '../../lib/mongodb';
import Strategy from '../../models/Strategy';
import config from '../../config';
import { ERROR_MESSAGES } from '../../constants';

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

      let content = response.data.choices[0].message.content;
      
      // Remove any markdown formatting
      content = content.replace(/```json\n?|\n?```/g, '');

      // Parse the cleaned JSON
      const strategyData = JSON.parse(content);

      const strategy = new Strategy({
        industry,
        ideaDescription,
        targetMarket,
        problemDescription,
        strategy: {
          mvpFeatures: strategyData.MVPFeatures  // Store the entire MVPFeatures object
        }
      });
      
      await strategy.save();
      
      res.status(200).json({ success: true, strategyId: strategy._id, mvpFeatures: strategyData.MVPFeatures });
    } catch (error) {
      console.error('Error in submit-form:', error);
      res.status(500).json({ success: false, error: ERROR_MESSAGES.GENERAL_ERROR });
    }
  } else {
    res.status(405).json({ success: false, error: ERROR_MESSAGES.METHOD_NOT_ALLOWED });
  }
}