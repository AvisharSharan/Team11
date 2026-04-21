const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

connectDB();

const app = express();
const server = http.createServer(app);

const isDev = process.env.NODE_ENV !== 'production';
const configuredOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const normalizeOrigin = (origin) => {
  if (!origin) return origin;
  return origin.replace(/\/$/, '');
};

const defaultDevOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
];
const allowedOrigins = new Set(
  (isDev ? [...defaultDevOrigins, ...configuredOrigins] : configuredOrigins).map(normalizeOrigin)
);

const isLanOrigin = (origin) => {
  if (!origin) return false;
  return /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)\d+\.\d+:\d+$/.test(origin);
};

const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  const normalizedOrigin = normalizeOrigin(origin);
  if (allowedOrigins.has(normalizedOrigin)) return callback(null, true);
  if (isDev && isLanOrigin(normalizedOrigin)) return callback(null, true);
  return callback(new Error(`CORS blocked for origin: ${origin}`));
};

const jwt = require('jsonwebtoken');

const io = new Server(server, {
  pingTimeout: 60000,
  pingInterval: 25000,
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

// Socket.io Middleware for Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id; // Attach userId to socket for O(1) access
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => res.send('SyncSphere API is running'));

// ─── Socket.io ────────────────────────────────────────────────────────────────
// maps userId (string) -> socketId
const onlineUsers = new Map();

io.on('connection', (socket) => {
  const userId = socket.userId;
  console.log(`User ${userId} connected (socket: ${socket.id})`);

  // Track online user
  onlineUsers.set(userId, socket.id);
  socket.join(userId); // personal room
  socket.emit('connected');

  // Join the room for a specific conversation
  socket.on('join conversation', (conversationId) => {
    socket.join(conversationId);
  });

  // Leave a conversation room
  socket.on('leave conversation', (conversationId) => {
    socket.leave(conversationId);
  });

  // Broadcast a new message to everyone in the conversation room
  socket.on('new message', (messageData) => {
    const { conversationId } = messageData;
    // Emit to all sockets in the conversation room (sender receives it too via REST)
    socket.to(conversationId).emit('message received', messageData);
  });

  // Typing indicators
  socket.on('typing', ({ conversationId, senderName }) => {
    socket.to(conversationId).emit('typing', { conversationId, senderName });
  });

  socket.on('stop typing', ({ conversationId }) => {
    socket.to(conversationId).emit('stop typing', { conversationId });
  });

  socket.on('delete conversation', ({ conversationId, participants }) => {
    if (participants && Array.isArray(participants)) {
      participants.forEach((userId) => {
        socket.to(userId).emit('conversation deleted', { conversationId });
      });
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId && onlineUsers.get(socket.userId) === socket.id) {
      onlineUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
