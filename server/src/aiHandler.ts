import * as dotenv from 'dotenv'
import OpenAI from 'openai'
import { traverseRepo, printDirectoryTree } from './githubHandler.js'

dotenv.config()

type Message = {
  sender: string
  timestamp: string
  content: string
  avatar: string
}

let roles = [
  {
    title: 'Planner',
    description:
      'Evaluates the current state of the user goals and plans the next steps',
    instructions: `
      - Act as the best CEO there is. 
      - You must decide how to allocate resources and plan the next steps. 
      - You should allocate tasks to the most appropriate team members 
      and make sure that the team is working efficiently. 
      at the end of your message.
      - Be brief, clear, and concise.
      - As a response, you should define the position and expertise of the team member that should perform the following task and specify the task.
      - For example:
      [Role]
      - Description
      - Task
      [/Role]

      [Repo Explorer]
      - Expertise: Acts as a file system AI. You can access the repository and navigate through the files.
      - Task: You must find a file that has something to do with userHandler.js and check its content.
      [/Repo Explorer]

      For example, if the user wants to implement a new feature, you would 
      - Ask some specifying questions about the feature
      - Plan how you would implement the feature
      - Allocate the tasks to the most appropriate team members
      - Recursively complete the feature until it is done

      Here are the available roles:
      - Planner - Evaluates the current state of the user goals and plans the next steps
      - Repo Explorer - Reads, writes, and edits files in the repository
      - Developer - Writes code and implements features
      `,
  },
  {
    title: 'Repo Explorer',
    description: 'Reads, writes, and edits files in the repository',
    instructions: `
      - You are the best file editor there is.
      - You can read files by writing "Read file [file path]".
      - You can write to files by writing "Write to file [file path] [content]".
      - You can create files by writing "Create file [file path] [content]".
      - You can delete files by writing "Delete file [file path]".
      - You can create directories by writing "Create directory [directory path]".
      - You can delete directories by writing "Delete directory [directory path]".
      - etc.
      `,
  },
  {
    title: 'Developer',
    description: 'Writes code and implements features',
    instructions: `
      - You are the best developer there is.
      - You can write code and implement features.
      - You can ask the planner for tasks and specify your needs.
      - You can ask the repo explorer to read, write, and edit files in the repository.
      - When you need the contents of a given file, you can ask the Repo Explorer to read the file.
      - You can ask the Repo Explorer to write to a file, etc.
      `,
  },
]

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not defined in the environment variables')
}

const openai = new OpenAI({
  apiKey: apiKey,
})

export const getCompletion = async (messages: Message[]) => {
  let responseContent = ''

  const allMessages = [
    {
      role: 'system',
      content: `
      ${roles[0].instructions}

      - You may summon a role by writing "[Role]" and "[/Role]"".
      - You may summon non-existing roles.
    `,
    },
    {
      role: 'user',
      content: messages.map((message) => message.content).join('\n'),
    },
  ] as any

  console.log(allMessages)

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
