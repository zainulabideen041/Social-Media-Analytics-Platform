import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import { connectDatabase } from '@/config/database';
import { errorHandler } from '@/middleware/errorHandler';
import { startEngagementSimulation } from '@/jobs/engagementSimulator';
import { startPostScheduler } from '@/jobs/postScheduler';

// Import routes
import authRoutes from '@/routes/authRoutes';
import postRoutes from '@/routes/postRoutes';
import analyticsRoutes from '@/routes/analyticsRoutes';
import postAnalyticsRoutes from '@/routes/postAnalyticsRoutes';

// Load environment variables
dotenv.config();

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection flag
let isConnected = false;

// Middleware to ensure database connection
const ensureDbConnection = async (_req: Request, res: Response, next: Function): Promise<void> => {
  if (!isConnected) {
    try {
      await connectDatabase();
      isConnected = true;

      // Start cron jobs only once
      if (process.env.NODE_ENV === 'production') {
        startEngagementSimulation();
        startPostScheduler();
      }
    } catch (error) {
      console.error('Database connection failed:', error);
      res.status(500).json({ error: 'Database connection failed' });
      return;
    }
  }
  next();
};

// Apply database middleware to all routes
app.use(ensureDbConnection);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to Social Media Analytics API' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', postAnalyticsRoutes); // Post-specific analytics
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Export for Vercel serverless
export default app;
