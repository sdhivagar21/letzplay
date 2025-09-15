import { Router } from 'express';
import User from '../models/User.js';
import { sign } from '../utils/jwt.js';

const r = Router();

r.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const u = await User.create({ name, email, password, role: 'customer' });
  res.json({ token: sign(u), user: { id: u._id, name: u.name, email: u.email, role: u.role } });
});

r.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const u = await User.findOne({ email }).select('+password');
  if (!u || !(await u.compare(password))) return res.status(401).json({ message: 'Bad creds' });
  res.json({ token: sign(u), user: { id: u._id, name: u.name, email: u.email, role: u.role } });
});

export default r;
