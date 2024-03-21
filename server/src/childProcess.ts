import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export const executeCode = (code: string, language: string) => {
  const workDir = path.join(__dirname, 'work', uuidv4())
  fs.mkdirSync(workDir, { recursive: true })
  const tmpFile = path.join(workDir, `tmp.${language}`)

  fs.writeFileSync(tmpFile, code)

  let command = ''
  switch (language) {
    case 'py':
      command = `python ${tmpFile}`
      break
    case 'js':
      command = `node ${tmpFile}`
      break
    case 'html':
      console.log("Opening HTML files isn't supported in this context. 😅")
      cleanUp(workDir)
      return
    case 'css':
      console.log("CSS files can't be executed directly. 😅")
      cleanUp(workDir)
      return
    case 'sh':
      const shebang = '#!/bin/bash\n'
      fs.writeFileSync(tmpFile, shebang + code, { mode: 0o755 })
      command = `bash ${tmpFile}`
      break
    default:
      console.log(`Unsupported language: ${language}. 😞`)
      cleanUp(workDir)
      return
  }

  try {
    const output = execSync(command, { encoding: 'utf-8' })
    console.log('Code execution output:')
    console.log(output)
  } catch (error: any) {
    console.error('Code execution failed:')
    console.error(error.message)
  } finally {
    cleanUp(workDir)
  }
}

const cleanUp = (workDir: string) => {
  fs.rmSync(workDir, { recursive: true, force: true })
}
