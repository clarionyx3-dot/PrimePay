const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountVar) {
      // Danish bhai, ye line extra spaces aur kachray ko saaf karegi taake crash na ho
      const serviceAccount = JSON.parse(serviceAccountVar.trim());
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("✅ Firebase Initialized");
    } else {
      console.error("❌ Error: FIREBASE_SERVICE_ACCOUNT variable nahi mila!");
    }
  } catch (error) {
    // Agar JSON ghalat bhi ho, toh ye error dikhayega lekin server crash nahi karega
    console.error("❌ Firebase Parse Error:", error.message);
  }
}

const db = admin.firestore();
module.exports = { admin, db };
