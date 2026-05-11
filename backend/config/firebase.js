// backend/config/firebase.js
const admin = require('firebase-admin');

let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
  console.error('❌ serviceAccountKey.json missing from backend/config/');
  console.error('   Download from Firebase Console → Project Settings → Service Accounts');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();
module.exports = { admin, db };
