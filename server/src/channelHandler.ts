import { Socket } from 'socket.io'
import { IMessage } from './interface'
// import { getCompletion } from './aiHandler.js'
import { getCompletion } from './claude.js'

export const handleChannel = (socket: Socket) => {
  console.log('A user connected')

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on(
    'message',
    async (props: { message: IMessage[]; requirements: string }) => {
      console.log(props)

      const messageId = `${props.message.length}`

      // Call getCompletion with props and a callback function
      await getCompletion(props, (openAIResponse) => {
        const responseMessage: IMessage = {
          id: messageId,
          sender: 'Nova',
          timestamp: new Date().toLocaleTimeString(),
          content: openAIResponse,
          avatar: 'https://bookwiz-media.s3.amazonaws.com/Nova.png',
        }

        socket.emit('message', responseMessage)
      })
    }
  )
}
