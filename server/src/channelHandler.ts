import { Socket } from 'socket.io'
import { IMessage } from './interface'
import { getCompletion } from './aiHandler.js'

export const handleChannel = (socket: Socket) => {
  console.log('A user connected')

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('message', async (props: {
    message: IMessage[],
    requirements: string
  }) => {
    console.log(props)

    const openAIResponse = await getCompletion(props)

    const responseMessage: IMessage = {
      sender: 'Nova',
      timestamp: new Date().toLocaleTimeString(),
      content: openAIResponse,
      avatar: 'https://bookwiz-media.s3.amazonaws.com/Nova.png',
    }

    socket.emit('message', responseMessage)
  })
}
