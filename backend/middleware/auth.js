const { admin, db } = require('../config/firebase');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = header.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Danish bhai, yahan 'users' collection se aapka profile data uthaya ja raha hai
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(403).json({ error: 'Forbidden: Profile not found in Firestore' });
    }

    const userData = userDoc.data();
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.role // Ye line 'superadmin' check karegi
    };
    
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
};

// Role verify karne ka function
auth.requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  }
  next();
};

module.exports = auth;
