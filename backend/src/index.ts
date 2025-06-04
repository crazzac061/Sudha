import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import userRoutes from './routes/userRoutes';
import wasteRoutes from './routes/wasteRoutes';
import { errorHandler } from './middleware/errorHandler';
import helmet from 'helmet';
import path from 'path';

dotenv.config();

const app = express();

// CORS configuration for development
app.use(cors({
  origin: '*', // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Security middleware
app.use(helmet());

// Parse JSON bodies
app.use(express.json());

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/waste', wasteRoutes);

// Error handling
app.use(errorHandler);

const PORT =  3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

// Setup MongoDB
const startServer = async () => {
  try {
    const mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    app.listen(PORT, HOST, () => {
      console.log(`Server is running on http://${HOST}:${PORT}`);
      console.log(`Server is also accessible at http://192.168.1.80:${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

startServer();
