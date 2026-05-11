const admin = require('firebase-admin');

// Danish bhai, ye check karega ke variable mojud hai ya nahi
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (e) {
  console.error("Firebase Key Parse Error:", e.message);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
module.exports = { admin, db };
