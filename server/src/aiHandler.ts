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

const commonMessages = `
  Today is ${new Date().toDateString()}.
  User name is Kristiyan. User is a software engineer.
  user is based in Sofia, Bulgaria. 
  
  In your response be:
  - intelligent and creative
  - helpful and informative
  - brief and concise
  - sarcastic and use satire
`

export const getCompletion = async (props: {
  message: Message[]
  requirements: string
}) => {
  let responseContent = ''

  const allMessages = [
    {
      role: 'system',
      content: `
      You are the best AI assistant in the world.
      You are given a task. You need to solve it using your reasoning and planning skills.
      You will devise a plan and respond with your plan in the following markdown format:
      - [] <Your plan here>
      - [] <Your plan here>

      Consider that the task will be solved using code - py, sh, js.
      Use as few steps as possible.

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

  const tasks = extractTasks(responseContent)
  if (tasks.length > 0) {
    console.log('Tasks:')
    tasks.forEach((task) => console.log(`- ${task}`))
  }

  for (const task of tasks) {
    const codeCompletion = await getCodeCompletion({
      message: props.message,
      requirements: task,
    })
    console.log('Code completion:')
    console.log(codeCompletion)
  }

  return responseContent
}

export const getCodeCompletion = async (props: {
  message: Message[]
  requirements: string
}) => {
  let responseContent = ''

  const allMessages = [
    {
      role: 'system',
      content: `
      Today is ${new Date().toDateString()}.

      You are given a task. You need to solve it using code only.
      You can run code in py, sh, js.
      Use the most appropriate language for the task.

      You will respond with the code that solves the task in the following format:
      \`\`\`py/sh/js (choose one)
      \`\`\`
      // Your code here
      \`\`\`

      [Interface]
      Fetch google events:
      curl localhost:3000/api/events?startDate=2021-09-01T00:00:00Z&endDate=2021-09-30T23:59:59Z
      Create a new google event:
      curl -X POST http://localhost:3000/api/events \
        -H "Content-Type: application/json" \
        -d '{
          "calendarId": "primary",
          "summary": "Example Event",
          "location": "Sofia, Bulgaria",
          "description": "This is a test event created via API.",
          "start": {
            "dateTime": "2024-03-25T10:00:00",
            "timeZone": "Europe/Sofia"
          },
          "end": {
            "dateTime": "2024-03-26T17:00:00-07:00",
            "timeZone": "Europe/Sofia"
          }
        }'
      Update a google event:
      curl -X PATCH http://localhost:3000/api/events/:eventId \
        -H "Content-Type: application/json" \
        -d '{
          "summary": "Updated Event"
        }'
      Delete a google event:
      curl -X DELETE http://localhost:3000/api/events/:eventId
      [/Interface]

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

  const { language, code } = extractCodeAndLanguage(responseContent)

  if (language && code) {
    console.log('Code:')
    console.log(code)
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

export const extractTasks = (codeString: string) => {
  const taskRegex = /- \[\] (.*)/g
  const tasks = codeString.matchAll(taskRegex)
  return Array.from(tasks).map((match) => match[1])
}
