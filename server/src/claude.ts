import Anthropic from '@anthropic-ai/sdk'
import { IMessage } from './interface.js'

const apiKey = process.env.CLAUDE_API_KEY
const client = new Anthropic({ apiKey })
const defaultModel = 'claude-3-opus-20240229'

export const getCompletion = async (
  props: {
    model?: string
    message: IMessage[]
    requirements: string
  },
  callback: (text: string) => void
) => {
  let messageBuffer = ''
  let bufferSize = 5 // Threshold for the number of messages to aggregate or time interval
  let bufferCounter = bufferSize

  // Function to send buffer and reset
  const sendBuffer = () => {
    if (messageBuffer.length > 0) {
      callback(messageBuffer) // Send the buffered text
      messageBuffer = '' // Reset buffer
      bufferCounter = bufferSize // Reset counter
    }
  }

  // Setup a simple inactivity timer to flush the buffer
  let inactivityTimer: NodeJS.Timeout
  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer)
    inactivityTimer = setTimeout(() => {
      sendBuffer() // Send remaining messages in buffer if any
    }, 500) // Adjust the timeout based on expected inactivity period, e.g., 1 second
  }

  await client.messages
    .stream({
      messages: props.message.map((msg) => ({
        role: 'user',
        content: msg.content,
      })),
      model: props.model || defaultModel,
      max_tokens: 1024,
    })
    .on('text', (text) => {
      messageBuffer += text // Append incoming text to buffer
      bufferCounter-- // Decrement counter

      if (bufferCounter <= 0) {
        sendBuffer() // Send when buffer size is reached
      }

      resetInactivityTimer() // Reset the timer on each received message
    })

  // Ensure the timer is cleared when the component is unmounted or stream ends
  return () => {
    clearTimeout(inactivityTimer)
    sendBuffer() // Ensure any remaining buffered text is sent
  }
}
