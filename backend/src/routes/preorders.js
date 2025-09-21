// backend/src/routes/preorders.js
import { Router } from 'express';
import Preorder from '../models/Preorder.js';
import Product from '../models/Product.js';
import { auth } from '../middleware/auth.js';
import { appendPreorderToCSV } from '../utils/csv.js';

const router = Router();

// POST /api/preorders  (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { sku, size, color, quantity = 1 } = req.body;
    if (!sku) return res.status(400).json({ message: 'sku required' });

    const product =
      (await Product.findOne({ sku })) ||
      (await Product.findOne({ ProductID: sku })) ||
      (await Product.findById(sku));

    if (!product) return res.status(404).json({ message: 'Product not found' });

    const userId = req.user._id || req.user.id;
    if (!userId) return res.status(401).json({ message: 'Invalid token (no user id)' });
    if (!req.user.email) return res.status(400).json({ message: 'User email missing on token' });

    const doc = await Preorder.create({
      user:  userId,
      email: req.user.email,
      sku,
      name:  product.name,
      price: product.price,
      size,
      color,
      qty: Number(quantity) || 1
    });

    // 🔽 Append to CSV (don’t fail the whole request if CSV write fails)
    try {
      await appendPreorderToCSV(doc, req.user);
    } catch (csvErr) {
      console.warn('CSV append failed:', csvErr?.message);
      // You can also include a flag for the client if you want:
      return res.status(201).json({ ...doc.toObject(), csvAppended: false });
    }

    res.status(201).json({ ...doc.toObject(), csvAppended: true });
  } catch (e) {
    console.error('preorder_create_error:', e?.message, e?.errors || '');
    if (e?.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(e.errors)[0]?.message || 'Validation failed' });
    }
    res.status(400).json({ message: 'Could not save preorder' });
  }
});

// GET /api/preorders/mine  (auth required)
router.get('/mine', auth, async (req, res) => {
  const userId = req.user._id || req.user.id;
  const list = await Preorder.find({ user: userId }).sort({ createdAt: -1 });
  res.json(list);
});

export default router;
