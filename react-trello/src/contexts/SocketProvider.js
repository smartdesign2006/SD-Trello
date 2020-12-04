import React, { useContext, useEffect, useState } from 'react'
import io from 'socket.io-client'

const SocketContext = React.createContext()

export function useSocket() {
  return useContext(SocketContext)
}

export function SocketProvider({ user, children }) {
  const [socket, setSocket] = useState()
  const username = user.username
  const teams = [...user.teams]
  const teamsId = teams.map( t => t._id)
  const teamsStr = JSON.stringify(teamsId)

  useEffect(() => {
    const newSocket = io(
      'http://localhost:4000', {
        query: { teamsStr, username },
        transports: ['websocket']
      }
    )
    setSocket(newSocket)

    return () => newSocket.close()
  }, [user])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}
