import { Octokit } from 'octokit'
import * as dotenv from 'dotenv'
import pkg from 'base-64'
const { decode } = pkg

dotenv.config()

const githubToken = process.env.GITHUB_TOKEN

interface DirectoryNode {
  name: string
  type: 'file' | 'dir'
  path: string
  children?: DirectoryNode[]
}

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

export const traverseRepo = async (
  owner: string,
  repo: string,
  path: string = '',
  prefix: string = ''
): Promise<DirectoryNode[]> => {
  let result: DirectoryNode[] = []
  const contents = await listRepoContents(owner, repo, path)

  for (const content of contents) {
    const node: DirectoryNode = {
      name: content.name,
      type: content.type,
      path: content.path,
      children: [],
    }

    if (content.type === 'dir') {
      const children = await traverseRepo(
        owner,
        repo,
        content.path,
        prefix + '--'
      )
      node.children = children
    }

    result.push(node)
  }

  return result
}

export const printDirectoryTree = (
  nodes: DirectoryNode[],
  prefix: string = ''
): string => {
  let treeString = ''

  nodes.forEach((node, index) => {
    treeString += `${prefix}- ${node.name}\n`
    if (node.children && node.children.length > 0) {
      treeString += printDirectoryTree(node.children, prefix + '--')
    }
  })

  return treeString
}

export default octokit
