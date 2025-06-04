import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import compression from 'compression';

// Security Middleware
import { securityMiddleware } from './middleware/security';
import { apiLimiter, loginLimiter, createAccountLimiter } from './middleware/rateLimiter';

// Routes
import userRoutes from './routes/userRoutes';
import wasteRoutes from './routes/wasteRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Apply security middleware
app.use(securityMiddleware);

// Basic middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(cookieParser());
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Static files with cache control
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1d',
  etag: true
}));

// Apply rate limiters
app.use('/api/', apiLimiter);
app.use('/api/users/login', loginLimiter);
app.use('/api/users/register', createAccountLimiter);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/waste', wasteRoutes);

// Error handling
app.use(errorHandler);

// Database connection
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
