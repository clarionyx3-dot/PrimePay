require('dotenv').config();
const express = require('express');
const app = express();

// Danish bhai, ye block har request par headers thonp dega (Forcefully)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// Basic Route for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Master Bypass Active!' });
});

// Main Routes
try {
  const auth = require('./middleware/auth');
  const restaurantRoutes = require('./routes/restaurant');
  // Isay direct use karein
  app.use('/api/superadmin/restaurants', auth, auth.requireRole('superadmin'), restaurantRoutes);
} catch (e) {
  console.log("Error:", e.message);
}

module.exports = app;
