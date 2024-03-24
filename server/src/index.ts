import 'dotenv/config'
import express from 'express'
import { Server as SocketIOServer } from 'socket.io'
import http from 'http'
import cors from 'cors'
import { handleChannel } from './channelHandler.js'
import eventsRoutes from './routes/eventsRoutes.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api', eventsRoutes)

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
