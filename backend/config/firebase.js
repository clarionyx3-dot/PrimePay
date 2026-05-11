const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin SDK Initialized!");
} else {
  admin.app(); // Pehle se chalne wala app istemal karein
}

module.exports = admin;
