import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import './utils/firebase.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';

// Initialize Firebase
initializeFirebase();

dotenv.config();

const app = express();
const server = createServer(app); // Create HTTP server
const PORT = process.env.PORT || 5000

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || [
      'http://localhost:5173', 
      'http://127.0.0.1:5173',
      'https://rukkoo.in',
      'https://www.rukkoo.in',
      'https://rukkoo-project.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('🔌 New Client Connected:', socket.id);

  // User joins a tracking room (e.g., their booking ID or just a hotel room)
  socket.on('join_tracking', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  // User emits location updates
  socket.on('update_location', (data) => {
    const { room, location } = data;
    // Broadcast to others in the room (e.g., Hotel Dashboard)
    socket.to(room).emit('live_location_update', location);
    // console.log(`Location update from ${socket.id} in ${room}:`, location);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Dynamic CORS to allow local network IPs (192.168.x.x) and localhost
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is localhost or local network IP
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://rukkoo.in',
      'https://www.rukkoo.in',
      'https://rukkoo-project.vercel.app'
    ];
    const isLocalNetwork = origin.startsWith('http://192.168.') || origin.startsWith('http://10.');

    if (allowedOrigins.indexOf(origin) !== -1 || isLocalNetwork) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import infoRoutes from './routes/infoRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/info', infoRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/hotels', hotelRoutes);


// Basic Route
app.get('/', (req, res) => {
  res.send({ message: 'Rukkoin API is running successfully' });
});

// Database Connection & Server Start
mongoose.connect(process.env.MONGODB_URL || "mongodb+srv://rukkooin:rukkooin@cluster0.6mzfrnp.mongodb.net/?appName=Cluster0")
  .then(async () => {
    console.log('✅ MongoDB connected successfully');

    // Debug: Check Admin counts
    const adminCount = await mongoose.connection.db.collection('admins').countDocuments();
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`📊 DB Status - Admins: ${adminCount}, Users: ${userCount}`);

    server.listen(PORT, () => { // Use server.listen instead of app.listen
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
