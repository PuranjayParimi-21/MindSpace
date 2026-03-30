const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB
connectDB().then(async () => {
  const User = require('./models/User');
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'changeme',
        role: 'admin',
        anonymousId: 'admin_sys_' + Math.random().toString(36).substr(2, 9),
        streakCount: 0
      });
      console.log('Default admin user created. username: admin, password: changeme');
    }
  } catch (err) {
    console.error('Failed to seed admin user:', err.message);
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api', apiRoutes);

// Socket.io for Real-time Chat
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join anonymous chat room
  socket.on('join_chat', () => {
    socket.join('anonymous_room');
    socket.emit('message', { user: 'System', text: 'Welcome to the anonymous chat! It is a safe space.' });
    socket.to('anonymous_room').emit('message', { user: 'System', text: 'A new user joined the chat.' });
  });

  // Handle incoming messages
  socket.on('send_message', (data) => {
    // data should contain { text: '...', emoji: '...' }
    io.to('anonymous_room').emit('message', { user: 'Anonymous', text: data.text, emoji: data.emoji });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    socket.to('anonymous_room').emit('message', { user: 'System', text: 'A user left the chat.' });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
