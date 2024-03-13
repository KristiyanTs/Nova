import express from 'express';
import { Server as SocketIOServer } from "socket.io";
import http from 'http';
import cors from 'cors';

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173", // Allow your React app domain
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  
  socket.on('message', (message) => {
    console.log(message);
    socket.emit('message', {
      sender: 'Nova',
      timestamp: new Date().toLocaleTimeString(),
      content: 'Hello to you!',
      avatar: '', 
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

