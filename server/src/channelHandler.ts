import { Socket } from 'socket.io';
import { IMessage } from './interface';
import { getCompletion } from './aiHandler';

export const handleChannel = (socket: Socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('message', async (message: string) => {
    console.log(message);

    // Here, you send the received message to OpenAI and wait for the response
    const openAIResponse = await getCompletion(message);

    // Construct the response message with the OpenAI response
    const responseMessage: IMessage = {
      sender: 'Nova',
      timestamp: new Date().toLocaleTimeString(),
      content: openAIResponse, // Use the response from OpenAI
      avatar: 'https://bookwiz-media.s3.amazonaws.com/Nova.png',
    };

    // Emit the response back to the client
    socket.emit('message', responseMessage);
  });
};