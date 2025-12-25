// src/server.js

require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const logger = require('./utils/logger');
const app = require('./app');
const { db } = require('./config/firebase.config');
const MessageService = require('./services/messageService');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Active users map
const activeUsers = new Map();

io.on('connection', (socket) => {
  logger.info('New client connected', { socketId: socket.id });

  socket.on('user:join', async (userId) => {
    try {
      if (!userId) return;

      activeUsers.set(userId, socket.id);
      socket.userId = userId;

      await db.collection('users').doc(userId).update({
        online: true,
        lastSeen: new Date(),
        socketId: socket.id,
      });

      io.emit('user:online', { userId, online: true });
      logger.info('User online', { userId });
    } catch (error) {
      logger.error('Error in user:join', { error: error.message, userId });
    }
  });

  // ===== Real-time Messaging =====
  socket.on('message:send', async (data) => {
    try {
      const message = await MessageService.sendMessage(data);

      // Confirm to sender
      socket.emit('message:sent', message);

      // Send to receiver if online
      const receiverSocketId = activeUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message:receive', message);
      }
    } catch (error) {
      logger.warn('Failed to send message', { error: error.message });
      socket.emit('message:error', { error: 'Failed to send message' });
    }
  });

  // Typing indicators
  socket.on('typing:start', (data) => {
    const { receiverId, senderId } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing:indicator', { userId: senderId, typing: true });
    }
  });

  socket.on('typing:stop', (data) => {
    const { receiverId, senderId } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing:indicator', { userId: senderId, typing: false });
    }
  });

  // Mark as read
  socket.on('messages:read', async (data) => {
    try {
      await MessageService.markAsRead(data);
      socket.emit('messages:read:success', { conversationId: data.conversationId });
    } catch (error) {
      logger.warn('Failed to mark messages as read', { error: error.message });
    }
  });

  // Disconnect
  socket.on('disconnect', async () => {
    if (socket.userId) {
      activeUsers.delete(socket.userId);

      try {
        await db.collection('users').doc(socket.userId).update({
          online: false,
          lastSeen: new Date(),
        });

        io.emit('user:offline', { userId: socket.userId });
        logger.info('User offline', { userId: socket.userId });
      } catch (error) {
        logger.error('Error updating offline status', { error: error.message });
      }
    }

    logger.info('Client disconnected', { socketId: socket.id });
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});