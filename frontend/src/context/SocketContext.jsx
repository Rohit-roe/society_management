import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const getNormalizedSocketUrl = () => {
  let url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
  if (url && !/^https?:\/\//i.test(url) && !url.startsWith('/')) {
    if (url.startsWith('localhost') || url.startsWith('127.0.0.1')) {
      return `http://${url}`;
    }
    return `https://${url}`;
  }
  return url;
};

const SOCKET_URL = getNormalizedSocketUrl();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user || (!user.societyId && user.role !== 'app_admin')) {
      setSocket(null);
      return undefined;
    }

    const instance = io(SOCKET_URL);
    socketRef.current = instance;
    if (user.societyId) {
      instance.emit('join_society', user.societyId);
    }
    instance.emit('join_user', user._id);
    setSocket(instance);

    return () => {
      instance.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [user?.societyId]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
