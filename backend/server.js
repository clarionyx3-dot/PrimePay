require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Danish bhai, ye Universal Jumper hai jo har rasta khol dega
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  
  // Browser jab pehle "haath milane" (Preflight) aata hai toh usay OK kehna zaroori hai
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// Health Checks
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'PrimePay Live!' }));
app.get('/api', (req, res) => res.json({ status: 'ok' }));

// Main Routes
try {
  const auth = require('./middleware/auth');
  const restaurantRoutes = require('./routes/restaurant');
  
  // Dashboard ke liye rasta
  app.use('/api/superadmin/restaurants', auth, auth.requireRole('superadmin'), restaurantRoutes);
} catch (error) {
  console.error("❌ Route Loading Error:", error.message);
}

// Catch-all
app.use('*', (req, res) => {
  res.status(404).json({ error: `Backend live hai, lekin rasta ghalat hai: ${req.originalUrl}` });
});

module.exports = app;
