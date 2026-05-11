// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Hum direct values use kar rahe hain kyunki .env load nahi ho rahi
const firebaseConfig = {
  apiKey: "AIzaSyBt3pb-YF0ooEtsH2203x1kcrTh0ojH_Ak",
  authDomain: "primepay-1.firebaseapp.com",
  projectId: "primepay-1",
  storageBucket: "primepay-1.firebasestorage.app",
  messagingSenderId: "456334170124",
  appId: "1:456334170124:web:22d310fd59f61e258ff629"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;