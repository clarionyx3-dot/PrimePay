require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// 1. CORS Settings (Frontend Permission)
// Danish bhai, humne origin '*' rakha hai taaki frontend ko block na kare
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// 2. HEALTH CHECK (Browser mein check karne ke liye)
// Isay test karein: prime-rlnv9sfsk-danish122.vercel.app/api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PrimePay Backend Connected!' });
});

// Ye /api par bhi "ok" dega
app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'API is working!' });
});

// 3. MAIN ROUTES
try {
  const auth = require('./middleware/auth');
  
  // Danish bhai, aapke GitHub par file ka naam 'restaurant.js' hai
  const restaurantRoutes = require('./routes/restaurant');

  // Frontend ke /api/superadmin/restaurants se match karne ke liye:
  app.use('/api/superadmin/restaurants', auth, auth.requireRole('superadmin'), restaurantRoutes);
  
  console.log("✅ Routes Loaded Successfully");
} catch (error) {
  console.error("❌ Module Load Error:", error.message);
}

// 4. CATCH ALL ERROR (Jo screenshot mein aa raha tha)
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: `Backend live hai, lekin ye rasta ghalat hai: ${req.originalUrl}` 
  });
});

module.exports = app;
