import React, { useState, useEffect } from 'react'
import { Button, TextField, InputAdornment } from '@mui/material'
import Spacer from './Spacer'
import { styled } from '@mui/system'
import SendIcon from '@mui/icons-material/Send'
import { useSocket } from '../services/SocketContext'

type Message = {
  sender: string
  timestamp: string
  content: string
  avatar: string
}

function Chat() {
  const socket = useSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (socket) {
      console.log('Socket connected')
      socket.on('message', (message) => {
        console.log(message)
        setMessages((prevMessages) => [...prevMessages, message])
      })

      return () => {
        socket.off('message')
      }
    }
  }, [socket])

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent
  ) => {
    e.preventDefault()
    if (!message.trim()) return
    const newMessage = {
      sender: 'Kris',
      timestamp: new Date().toLocaleTimeString(),
      content: message,
      avatar: 'https://bookwiz-media.s3.amazonaws.com/Kristiyan.png',
    }
    sendMessage(newMessage)
    setMessages([...messages, newMessage])
    setMessage('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
  }

  const sendMessage = (message: Message) => {
    if (socket) {
      socket.emit('message', message)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e)
    }
  }

  return (
    <StyledChat>
      <MessagesContainer>
        {messages.map((message, index) => (
          <MessageBubble key={index}>
            <MessageHeader>
              <img
                src={message.avatar}
                alt={`${message.sender}'s avatar`}
                style={{ width: 30, borderRadius: '50%', marginRight: '8px' }}
              />
              <b>{message.sender}</b> <Spacer x={1} />
              <div className='timestampt'>
                {message.timestamp.split(':').slice(0, 2).join(':')}
              </div>
            </MessageHeader>
            <p>{message.content}</p>
          </MessageBubble>
        ))}
      </MessagesContainer>
      <Spacer y={1} />
      <form onSubmit={handleSubmit}>
        <TextField
          label='Message'
          variant='outlined'
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          fullWidth
          multiline
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Button type='submit'>
                  <SendIcon />
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </form>
    </StyledChat>
  )
}

export default Chat

const StyledChat = styled('div')({
  background: 'rgba(0, 0, 0, 0.1)',
  padding: '1rem',
  borderRadius: '5px',
  display: 'flex',
  flexDirection: 'column',
  height: '80vh',
  width: '30vw',
})

const MessagesContainer = styled('div')({
  overflowY: 'auto',
  flex: 1,
})

const MessageBubble = styled('div')({
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  padding: '8px',
  borderRadius: '4px',
  margin: '4px 0',
  wordWrap: 'break-word',
})

const MessageHeader = styled('div')({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '4px',
  '& .timestampt': {
    fontSize: '0.8rem',
    color: 'grey',
  },
})
