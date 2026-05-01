// src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
      socketRef.current = io('https://smartq-backend-1.onrender.com', {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected');
      setConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    return () => socketRef.current.disconnect();
  }, []);

  const joinDomain = (domain) => {
    if (socketRef.current) socketRef.current.emit('join_domain', domain);
  };

  const callNext = (domain, counterId) => {
    if (socketRef.current) socketRef.current.emit('call_next', { domain, counterId });
  };

  const onEvent = (event, cb) => {
    if (socketRef.current) socketRef.current.on(event, cb);
  };

  const offEvent = (event, cb) => {
    if (socketRef.current) socketRef.current.off(event, cb);
  };

  return (
    <SocketContext.Provider value={{ connected, joinDomain, callNext, onEvent, offEvent }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
