import express from 'express';
import dotenvFlow from 'dotenv-flow';
import { loadEnv } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
// import walletRoutes from './routes/walletRoutes.js';
import { requestLogger } from './middleware/logger.js';
import tripRoutes from './routes/tripRoute.js'
import cors from 'cors';

dotenvFlow.config();
loadEnv();

const app = express();

app.use(express.json());
app.use(cors());
app.use(requestLogger);
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

// Health
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/trips', tripRoutes);

app.use('/api/bookings', bookingRoutes);

// app.use('/api/wallet', walletRoutes);

// Not found
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Server error' });
});

export default app;

