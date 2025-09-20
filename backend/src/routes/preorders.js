import { Router } from 'express';
import Preorder from '../models/Preorder.js';
import Product from '../models/Product.js'; // adjust path/name to your product model
import jwt from 'jsonwebtoken';

const router = Router();

/** optional auth (don’t fail if there is no token) */
function authOptional(req, _res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {}
  next();
}

/** POST /api/preorders  (no hard auth requirement) */
router.post('/', authOptional, async (req, res) => {
  try {
    const { sku, size, color, quantity = 1, email } = req.body;

    const product =
      (await Product.findOne({ sku })) ||
      (await Product.findOne({ ProductID: sku })) ||
      (await Product.findById(sku)); // fallback if you sent _id

    if (!product) return res.status(404).json({ message: 'Product not found' });

    const doc = await Preorder.create({
      user: req.user?._id,
      email,
      sku,
      name: product.name,
      price: product.price,
      size,
      color,
      qty: Number(quantity) || 1
    });

    res.status(201).json(doc);
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: 'Could not save preorder' });
  }
});

/** GET /api/preorders/mine  (returns only if logged-in) */
router.get('/mine', authOptional, async (req, res) => {
  if (!req.user?._id) return res.json([]); // not logged in → empty list
  const list = await Preorder.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(list);
});

export default router;
