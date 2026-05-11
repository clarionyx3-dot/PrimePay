const { admin, db } = require('../config/firebase');

const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    
    // Firestore se user ka data nikalna
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    
    if (!userDoc.exists) {
      return res.status(403).json({ error: 'User profile not found in database' });
    }

    const userData = userDoc.data();

    // req.user ko sahi se populate karna
    req.user = { 
      uid: decoded.uid, 
      email: decoded.email, 
      role: userData.role, // Direct role assign karein
      ...userData 
    };

    next();
  } catch (e) {
    console.error("Auth Middleware Error:", e.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Role check karne wala helper
auth.requireRole = (...roles) => (req, res, next) => {
  // Danish bhai, yahan hum console mein print kar rahe hain check karne ke liye
  console.log("Checking Role. User Role:", req.user?.role, "Required:", roles);

  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ 
      error: `Access denied. Your role is ${req.user?.role || 'none'}. Required: ${roles.join(' or ')}` 
    });
  }
  next();
};

module.exports = auth;
