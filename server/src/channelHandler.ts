// channelHandler.ts
import { Socket } from 'socket.io'
import { IMessage } from './interface' // Import the interface

export const handleChannel = (socket: Socket) => {
  console.log('A user connected')

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('message', (message: string) => {
    console.log(message)
    const responseMessage: IMessage = {
      sender: 'Nova',
      timestamp: new Date().toLocaleTimeString(),
      content: 'Hello to you!',
      avatar: 'https://bookwiz-media.s3.amazonaws.com/Nova.png',
    }
    socket.emit('message', responseMessage)
  })
}
