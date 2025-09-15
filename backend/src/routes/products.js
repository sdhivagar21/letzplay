import { Router } from 'express';
import Product from '../models/Product.js';

const r = Router();

r.get('/', async (req, res) => {
  const items = await Product.find();
  res.json(items);
});

r.get('/:sku', async (req, res) => {
  const p = await Product.findOne({ sku: req.params.sku });
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});

export default r;
