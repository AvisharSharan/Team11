import { io } from 'socket.io-client';

// Singleton socket instance — connect once, reuse everywhere
let socket = null;

const getSocketServerUrl = () => {
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }

  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const host = window.location.hostname;
  const port = process.env.REACT_APP_SOCKET_PORT || '5000';

  return `${protocol}://${host}:${port}`;
};

export const getSocket = (token) => {
  if (!socket) {
    socket = io(getSocketServerUrl(), {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token },
    });
  } else if (token) {
    socket.auth = { token };
  }
  return socket;
};

export const connectSocket = (token) => {
  const s = getSocket(token);

  if (s.connected) {
    return s;
  }

  if (!s.active) {
    s.connect();
  }
  
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    // Optional: socket = null; if you want to completely recreate the instance
  }
};
