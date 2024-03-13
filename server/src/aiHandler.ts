import * as dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not defined in the environment variables');
}

const openai = new OpenAI({
  apiKey: apiKey,
});

export const getCompletion = async (userMessage: string) => {
  let responseContent = '';
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: userMessage }],
    stream: true,
  });

  for await (const chunk of stream) {
    responseContent += chunk.choices[0]?.delta?.content || '';
  }

  return responseContent;
};
