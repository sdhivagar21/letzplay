import { Router } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import Product from '../models/Product.js';
import { auth, adminOnly } from '../middleware/auth.js';

const upload = multer({ dest: 'uploads/' });
const r = Router();

r.post('/products', auth, adminOnly, upload.single('file'), async (req, res) => {
  const wb = xlsx.readFile(req.file.path);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws);
  for (const row of rows) {
    await Product.findOneAndUpdate({ sku: row.ProductID }, {
      sku: row.ProductID,
      name: row.Name,
      collection: row.Collection,
      price: row.Price,
      description: row.Description,
      sizes: (row.Sizes || '').split(','),
      colors: (row.Colors || '').split(','),
      images: (row.ImageURLs || '').split(','),
      stock: row.Stock
    }, { upsert: true });
  }
  res.json({ ok: true });
});

export default r;
