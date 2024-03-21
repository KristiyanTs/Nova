import * as dotenv from 'dotenv'
import OpenAI from 'openai'
import { executeCode } from './childProcess.js'

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
      You are given a task. You need to solve it using code only.
      You are an expert in the following technologies:
      - py
      - js
      - html
      - css
      - sh

      You will respond with the code that solves the task in the following format:
      \`\`\`py/js/html/css/sh (choose one)
      \`\`\`
      // Your code here
      \`\`\`

      ${props.requirements}
    `,
    },
    {
      role: 'user',
      content: props.message.map((message) => message.content).join('\n'),
    },
  ] as any

  const stream = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-0125',
    // model: 'gpt-4-0125-preview',
    messages: allMessages,
    stream: true,
  })

  for await (const chunk of stream) {
    responseContent += chunk.choices[0]?.delta?.content || ''
  }

  const { language, code } = extractCodeAndLanguage(responseContent);

  if (language && code) {
    executeCode(code, language)
  }


  return responseContent
}

export const extractCodeAndLanguage = (codeString: string) => {
  const languageRegex = /```(\w+)/
  const languageMatch = codeString.match(languageRegex)
  const language = languageMatch ? languageMatch[1] : ''

  const codeRegex = /```[\w\s]*\n([\s\S]*)\n```/
  const codeMatch = codeString.match(codeRegex)
  const code = codeMatch ? codeMatch[1] : ''

  return { language, code }
}
