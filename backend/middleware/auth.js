// backend/middleware/auth.js
const { admin, db } = require('../config/firebase');

const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = await admin.auth().verifyIdToken(header.split(' ')[1]);
    const snap = await db.collection('users').doc(decoded.uid).get();
    if (!snap.exists) return res.status(403).json({ error: 'User profile not found' });
    req.user = { uid: decoded.uid, email: decoded.email, ...snap.data() };
    next();
  } catch (e) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

auth.requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({ error: `Access denied. Required: ${roles.join(' or ')}` });
  next();
};

module.exports = auth;
