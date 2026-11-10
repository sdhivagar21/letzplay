import { Router } from 'express';
import User from '../models/User.js';
import { sign } from '../utils/jwt.js';

const r = Router();

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

r.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    if (String(password).length < 6) return res.status(400).json({ message: 'Use a password with at least 6 characters' });
    const u = await User.create({ name, email, password, role: 'customer' });
    res.json({ token: sign(u), user: publicUser(u) });
  } catch (e) {
    // 11000 = duplicate key: the email is already registered
    if (e?.code === 11000) return res.status(409).json({ message: 'That email already has an account. Try signing in.' });
    console.error('signup_error:', e?.message);
    res.status(400).json({ message: 'Could not create the account' });
  }
});

r.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const u = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
    if (!u || !(await u.compare(password))) return res.status(401).json({ message: 'Bad creds' });
    res.json({ token: sign(u), user: publicUser(u) });
  } catch (e) {
    console.error('login_error:', e?.message);
    res.status(500).json({ message: 'Could not sign in' });
  }
});

export default r;
