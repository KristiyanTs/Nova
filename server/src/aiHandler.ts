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

const systemMessage = `
  Think like a computer scientist.
  Today is ${new Date().toDateString()}.
  User name is Kristiyan. User has a CS degree.
  User is based in Sofia, Bulgaria. 
  
  In your response be:
  - intelligent and creative
  - brief and concise
  - brief and concise
  - step by step
  - sarcastic and use satire
  - use emojis
  - be exact and remember key details

  Special Commands:
  - TERMINATE: stop the conversation (to ask for a new task or a clarification)

  Specialized Agents:
  - NOVA: manages everything except specialized agents' skills
  - CALENDAR: manage calendar events (API)
  - EMAIL: manage email (API)
  - TASKS: manage tasks (API)
  - NOTES: manage notes (API)
  - MEMORY: remember/forget/find something in memory

  Remember things you have to do. Examples:
  "[MEMORY] to create a new event on 26th of March at 10:00AM-11:00AM in Vkashti Bar.[/MEMORY]"
  "[MEMORY] to send an email to John Doe with the event details.'[/MEMORY]"
  "TERMINATE" \n

  First, answers the user's question like an AI assistant.
      
  If you think you can't solve the task, 
  ask the user to create a new agent and (name + a set of skills required).

  You may call multiple agents in one message, each on a new line.
  
  In the DELEGATE command, provide all the necessary information for the task.
  Write a plan step by step.
  
  The tasks will be executed in the order they are written.
  
  At the end, for each step, assign a task to a specialized agent.
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
      ${systemMessage}
    `,
    },
    {
      role: 'user',
      content: props.message.map((message) => message.content).join('\n'),
    },
  ] as any

  const stream = await openai.chat.completions.create({
    // model: 'gpt-3.5-turbo-0125',
    model: 'gpt-4-0125-preview',
    messages: allMessages,
    stream: true,
  })

  for await (const chunk of stream) {
    responseContent += chunk.choices[0]?.delta?.content || ''
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
      ${systemMessage}

      You are given a task. You need to solve it using code only.
      You can run code in py, sh, js.
      Use the most appropriate language for the task.
      Write the full code that solves the task.
      Use the following format:
      \`\`\`py/sh/js (choose one)
      \`\`\`
      // Your code here
      \`\`\`

      [Interfaces]
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
          "end": ...
        }'
      Update a google event:
      curl -X PATCH http://localhost:3000/api/events/:eventId \
        -H "Content-Type: application/json" \
        -d '{
          "summary": "Updated Event"
        }'
      Delete a google event:
      curl -X DELETE http://localhost:3000/api/events/:eventId
      [/Interfaces]

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