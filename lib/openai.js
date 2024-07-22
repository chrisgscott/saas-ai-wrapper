import { Configuration, OpenAIApi } from 'openai';
import config from '../config';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function getOpenAIResponse(prompt, systemMessage) {
  const response = await openai.createChatCompletion({
    model: config.openai.model,
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: prompt }
    ],
    max_tokens: config.openai.maxTokens,
    n: 1,
    stop: null,
    temperature: config.openai.temperature,
  });

  let content = response.data.choices[0].message.content;
  content = content.replace(/```json\n?|\n?```/g, '');
  return JSON.parse(content);
}