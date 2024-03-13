import { Octokit } from 'octokit'
import * as dotenv from 'dotenv'
import { decode } from 'base-64'

dotenv.config()

const githubToken = process.env.GITHUB_TOKEN

if (!githubToken) {
  throw new Error('GITHUB_TOKEN is not defined in the environment variables')
}

const octokit = new Octokit({ auth: githubToken })

export const listRepoContents = async (
  owner: string,
  repo: string,
  path: string = ''
): Promise<any> => {
  try {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    })
    return response.data
  } catch (error) {
    console.error('Error fetching repository contents:', error)
    throw error
  }
}

export const fetchFileContent = async (
  owner: string,
  repo: string,
  filePath: string
): Promise<string> => {
  const content = await listRepoContents(owner, repo, filePath)
  if (content && 'content' in content && content.content) {
    return decode(content.content)
  } else {
    throw new Error('File content not found or empty')
  }
}

export default octokit
