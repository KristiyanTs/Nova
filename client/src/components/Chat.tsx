import React, { useState, useEffect } from 'react'
import { Button, TextField, InputAdornment } from '@mui/material'
import Spacer from './Spacer'
import { styled } from '@mui/system'
import SendIcon from '@mui/icons-material/Send'
import { useSocket } from '../services/SocketContext'
import ReactMarkdown from 'react-markdown'
import { IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import RetryIcon from '@mui/icons-material/Replay'
import ContinueIcon from '@mui/icons-material/Send'

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
  const [requirements, setRequirements] = useState('')

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
    sendMessage([...messages, newMessage])
    setMessages([...messages, newMessage])
    setMessage('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
  }

  const sendMessage = (message: Message[]) => {
    if (socket) {
      socket.emit('message', {
        message,
        requirements,
      })
    }
  }

  const deleteMessage = (indexToRemove: number) => {
    setMessages(messages.filter((_, index) => index !== indexToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e)
    }
  }

  const handleRetry = () => {
    const newMessages = messages.slice(0, -1) // Remove the last message
    setMessages(newMessages) // Update the state
    sendMessage(newMessages) // Resend messages
  }

  const handleContinue = () => {
    sendMessage(messages) // Just resend all messages
  }

  return (
    <StyledChat>
      <TextField
        label='Requirements'
        variant='outlined'
        value={requirements}
        onChange={(e) => setRequirements(e.target.value)}
        fullWidth
        multiline
      />
      <Spacer y={1} />
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
              <div className='timestamp'>
                {message.timestamp.split(':').slice(0, 2).join(':')}
              </div>
              <IconButton
                aria-label='delete'
                onClick={() => deleteMessage(index)}
                size='small'
                style={{ marginLeft: 'auto' }}
              >
                <DeleteIcon fontSize='small' />
              </IconButton>
            </MessageHeader>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </MessageBubble>
        ))}
        {messages.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '10px',
            }}
          >
            <IconButton aria-label='retry' onClick={handleRetry} size='large'>
              <RetryIcon />
            </IconButton>
            <IconButton
              aria-label='continue'
              onClick={handleContinue}
              size='large'
            >
              <ContinueIcon />
            </IconButton>
          </div>
        )}
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
  width: '60vw',
})

const MessagesContainer = styled('div')({
  overflowY: 'auto',
  flex: 1,
  position: 'relative',
})

const MessageBubble = styled('div')(() => ({
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  padding: '8px',
  borderRadius: '4px',
  margin: '4px 0',
  wordWrap: 'break-word',
  '&:hover': {
    '& .MuiIconButton-root': {
      visibility: 'visible',
      opacity: 1,
      transition: 'opacity 0.5s',
    },
  },
}))

const MessageHeader = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '4px',
  '& .timestamp': {
    fontSize: '0.8rem',
    color: 'grey',
  },
  '& .MuiIconButton-root': {
    visibility: 'hidden',
    marginLeft: 'auto',
    opacity: 0.5,
  },
}))
