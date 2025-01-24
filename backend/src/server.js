const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');

// Routes
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const messagesRoutes = require('./routes/messages.routes');
const groupsRoutes = require('./routes/groups.routes');

// Environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app')
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/groups', groupsRoutes);

// Socket.IO işlemleri
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('Yeni kullanıcı bağlandı:', socket.id);

  socket.on('user_connected', (userId) => {
    connectedUsers.set(userId, socket.id);
    io.emit('user_status_change', { userId, status: 'online' });
  });

  socket.on('private_message', async (data) => {
    const recipientSocket = connectedUsers.get(data.recipientId);
    if (recipientSocket) {
      io.to(recipientSocket).emit('new_private_message', data);
    }
  });

  socket.on('group_message', (data) => {
    socket.to(data.groupId).emit('new_group_message', data);
  });

  socket.on('join_group', (groupId) => {
    socket.join(groupId);
  });

  socket.on('leave_group', (groupId) => {
    socket.leave(groupId);
  });

  socket.on('disconnect', () => {
    let userId;
    for (const [key, value] of connectedUsers.entries()) {
      if (value === socket.id) {
        userId = key;
        break;
      }
    }
    if (userId) {
      connectedUsers.delete(userId);
      io.emit('user_status_change', { userId, status: 'offline' });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
}); 