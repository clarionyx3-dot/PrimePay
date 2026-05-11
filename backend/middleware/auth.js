const { admin, db } = require('../config/firebase');

const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    
    // Danish bhai, yahan hum UID ke zariye direct Firestore check kar rahe hain
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    
    if (!userDoc.exists) {
      console.log("User doc not found in Firestore for UID:", decoded.uid);
      return res.status(403).json({ error: 'Forbidden: No profile found' });
    }

    const userData = userDoc.data();
    // Request object mein user ka sara data (including role) save kar rahe hain
    req.user = { uid: decoded.uid, email: decoded.email, ...userData };
    
    next();
  } catch (e) {
    console.error("Auth Middleware Error:", e.message);
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
};

// Role check karne ka function
auth.requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  }
  next();
};

module.exports = auth;
