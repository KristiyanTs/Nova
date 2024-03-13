import 'dotenv/config'
import express from 'express'
import { Server as SocketIOServer } from 'socket.io'
import http from 'http'
import cors from 'cors'
import { handleChannel } from './channelHandler.js'

const app = express()
app.use(cors())

const server = http.createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', handleChannel)

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
