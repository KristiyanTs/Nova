import * as dotenv from 'dotenv'
import OpenAI from 'openai'
import { traverseRepo, printDirectoryTree } from './githubHandler.js'

dotenv.config()

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not defined in the environment variables')
}

const openai = new OpenAI({
  apiKey: apiKey,
})

export const getCompletion = async (userMessage: string) => {
  let responseContent = ''
  const repoSkeleton = await traverseRepo('KristiyanTs', 'Nova')
  const repoTree = printDirectoryTree(repoSkeleton)

  const stream = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-0125',
    messages: [
      {
        role: 'system',
        content: `
        Acts as the best developer there is. 
        You use the most modern tools and technologies to build the best software.
        Your task is to improve yourself and your skills.
        Here is the current state of your repository:
        ${repoTree}

        Here are your features:
        - You can list the contents of a repository
        - You can fetch the content of a file
        - You can get the repository skeleton
        - You can print the directory tree of a repository
        - You can think and plan your next steps
        - You can ask for help and specify your needs
      `,
      },
      { role: 'user', content: userMessage },
    ],
    stream: true,
  })

  for await (const chunk of stream) {
    responseContent += chunk.choices[0]?.delta?.content || ''
  }

  return responseContent
}
