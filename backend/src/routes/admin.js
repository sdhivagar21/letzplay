// backend/src/routes/admin.js
import { Router } from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import { CSV_PATH } from '../utils/csv.js';
import fs from 'fs';

const router = Router();

// All admin routes require auth + admin
router.use(auth, adminOnly);

// Download preorders CSV
router.get('/preorders/export', (req, res) => {
  if (!fs.existsSync(CSV_PATH)) {
    return res.status(404).json({ message: 'No CSV file yet' });
  }
  res.download(CSV_PATH, 'preorders.csv');
});

export default router;
