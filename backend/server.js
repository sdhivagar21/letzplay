import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import './src/db.js';
import authRoutes from './src/routes/auth.js';
import productRoutes from './src/routes/products.js';
import preorderRoutes from './src/routes/preorders.js';
import adminRoutes from './src/routes/admin.js';
import uploadRoutes from './src/routes/upload.js';
import Preorder from './src/models/Preorder.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limit
app.use('/api/', rateLimit({ windowMs: 60 * 1000, max: 240 }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/preorders', preorderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Live counter
app.get('/api/stats/preorders/count', async (_req, res) => {
  const count = await Preorder.countDocuments({ status: { $ne: 'cancelled' } });
  res.json({ count });
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
