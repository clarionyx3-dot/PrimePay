const { admin, db } = require('../config/firebase');

const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });

  try {
    const token = header.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    
    // Seedha Firestore se fetch karein
    const userSnap = await db.collection('users').doc(decoded.uid).get();
    if (!userSnap.exists) return res.status(403).json({ error: 'No profile' });

    const userData = userSnap.data();
    req.user = { uid: decoded.uid, email: decoded.email, ...userData };
    
    next();
  } catch (e) {
    return res.status(403).json({ error: 'Auth failed' });
  }
};

auth.requireRole = (...roles) => (req, res, next) => {
  // Danish bhai, check karein ke database mein role 'superadmin' hi likha hai na?
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: Insufficient role' });
  }
  next();
};

module.exports = auth;
