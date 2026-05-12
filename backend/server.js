require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// 1. CORS Settings (Frontend ko connect karne ke liye)
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// 2. Health Check (Browser mein check karein: /api/health)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PrimePay Backend is Running!' });
});

// Root URL Check
app.get('/', (req, res) => {
  res.send("PrimePay Backend is Live and Running!");
});

// 3. MAIN ROUTES (Safe Loading)
try {
  // Danish bhai, check kijiyega ke folder aur file ka naam bilkul yahi ho
  const auth = require('./middleware/auth');
  const restaurantRoutes = require('./routes/restaurantRoutes');

  // Frontend ke mutabiq /api/superadmin/restaurants
  app.use('/api/superadmin/restaurants', auth, auth.requireRole('superadmin'), restaurantRoutes);
  
  console.log("✅ Routes Loaded Successfully");
} catch (error) {
  // Agar koi module nahi mil raha toh server crash nahi hoga, sirf yahan error dikhayega
  console.error("❌ Module Loading Error:", error.message);
}

// 4. VERCEL EXPORT
module.exports = app;
