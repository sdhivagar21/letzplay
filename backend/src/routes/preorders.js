import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import Product from '../models/Product.js';
import Preorder from '../models/Preorder.js';
import { appendPreorderCsv } from '../utils/csv.js';
import { notifyAdminPreorder } from '../utils/mailer.js';

const r = Router();

r.post('/', auth, async (req, res) => {
  const { sku, size, color, quantity } = req.body;
  const p = await Product.findOne({ sku });
  if (!p) return res.status(404).json({ message: 'No product' });

  const po = await Preorder.create({
    userId: req.user.id,
    userName: req.user.name,
    userEmail: req.user.email,
    productId: p._id,
    productSKU: p.sku,
    productName: p.name,
    size, color, quantity, price: p.price
  });

  await appendPreorderCsv(po);
  await notifyAdminPreorder(po);

  res.json(po);
});

r.get('/mine', auth, async (req, res) => {
  const orders = await Preorder.find({ userId: req.user.id });
  res.json(orders);
});

export default r;
