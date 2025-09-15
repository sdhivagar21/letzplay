import { Router } from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import { getCsvPath } from '../utils/csv.js';
import fs from 'fs';

const r = Router();
r.use(auth, adminOnly);

r.get('/preorders/export', (req, res) => {
  const p = getCsvPath();
  if (!fs.existsSync(p)) return res.status(404).json({ message: 'No file yet' });
  res.download(p, 'preorders.csv');
});

export default r;
