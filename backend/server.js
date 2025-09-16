import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Init env first
dotenv.config();

// Connect DB (uses MONGO_URL)
import './src/db.js';

import authRoutes from './src/routes/auth.js';
import productRoutes from './src/routes/products.js';
import preorderRoutes from './src/routes/preorders.js';
import adminRoutes from './src/routes/admin.js';
import uploadRoutes from './src/routes/upload.js';
import Preorder from './src/models/Preorder.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Render/Netlify sit behind a proxy → needed for express-rate-limit to identify ip correctly
app.set('trust proxy', 1);

// Simple “version” to verify we’re on the right build
const BUILD_TAG = 'letzplay-api v1.1 (trust-proxy + health)';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security & core middleware
app.use(helmet({ contentSecurityPolicy: false })); // keep CSP simple to avoid favicon warnings
app.use(cors({
  origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : '*',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route (avoid 404s on "/")
app.get('/', (_req, res) => {
  res.status(200).json({ ok: true, service: 'letzplay-api', build: BUILD_TAG });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', build: BUILD_TAG });
});

// Light rate limit for API
app.use('/api/', rateLimit({
  windowMs: 60 * 1000,
  max: 240,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/preorders', preorderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Live counter
app.get('/api/stats/preorders/count', async (_req, res) => {
  try {
    const count = await Preorder.countDocuments({ status: { $ne: 'cancelled' } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'count_failed' });
  }
});

// API 404 fallback
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

app.listen(PORT, () => {
  // Mask the URI for safety, but confirm it’s NOT localhost
  const uri = process.env.MONGO_URL || '';
  const isLocal = uri.includes('127.0.0.1') || uri.includes('localhost');
  console.log(`✅ ${BUILD_TAG} running on port ${PORT}`);
  console.log(`DB: ${isLocal ? '❌ Using localhost (fix MONGO_URL in Render)' : '✅ Using Atlas/remote'}`);
});
