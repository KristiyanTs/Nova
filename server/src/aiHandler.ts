import * as dotenv from 'dotenv'
import OpenAI from 'openai'

dotenv.config()

type Message = {
  sender: string
  timestamp: string
  content: string
  avatar: string
}

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not defined in the environment variables')
}

const openai = new OpenAI({
  apiKey: apiKey,
})

export const getCompletion = async (props: {
  message: Message[]
  requirements: string
}) => {
  let responseContent = ''

  const allMessages = [
    {
      role: 'system',
      content: `
      You are the best fiction writer there is.
      - You will narrate the next 200 words of the story.
      - You will write a story that is engaging and interesting.

      ${props.requirements}
    `,
    },
    {
      role: 'user',
      content: props.message.map((message) => message.content).join('\n'),
    },
  ] as any

  console.log(allMessages)

  const stream = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-0125',
    // model: 'gpt-4-0125-preview',
    messages: allMessages,
    stream: true,
  })

  for await (const chunk of stream) {
    responseContent += chunk.choices[0]?.delta?.content || ''
  }

  return responseContent
}
