require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// socket.io setup
const io = new Server(server, { cors: { origin: '*' } });
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('join', (room) => {
    socket.join(room);
  });
  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});


app.use(cors());
app.use(express.json());

// routes
const authRoutes = require('./routes/auth');
const donationRoutes = require('./routes/donation');
const uploadRoutes = require('./routes/uploads');

// use routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/uploads', uploadRoutes);

//error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
  });
});

// start server
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // connect mongo
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err);
  }
});



module.exports.io = io;
