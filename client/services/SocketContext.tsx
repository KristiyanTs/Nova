import React, { createContext, useContext, useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'

const SOCKET_SERVER_URL = 'http://localhost:3000'

const SocketContext = createContext<Socket | null>(null)

export const SocketProvider: React.FC = ({ children }: any) => {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const socketConnection: Socket = io(SOCKET_SERVER_URL)
    setSocket(socketConnection)

    return () => {
      socketConnection.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
