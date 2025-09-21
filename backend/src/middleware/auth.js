import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Normalize: some tokens have `id`, others `_id`
    req.user = {
      ...payload,
      _id: payload._id || payload.id,
    };
    if (!req.user._id) {
      return res.status(401).json({ message: 'Invalid token (no user id)' });
    }
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const adminOnly = (req, res, next) => {
  const role = req.user?.role;
  if (role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
};
