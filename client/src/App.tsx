import './App.css'
import Chat from './components/Chat'
import { styled } from '@mui/system'
import { SocketProvider } from './services/SocketContext'

function App() {
  return (
    <StyledApp>
      <SocketProvider>
        <Chat />
      </SocketProvider>
    </StyledApp>
  )
}

export default App

const StyledApp = styled('div')({
  padding: '1rem',
})
