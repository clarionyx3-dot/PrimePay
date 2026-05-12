require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Danish bhai, ye setting har naye frontend link ko ijazat degi
app.use(cors({
  origin: true, // Ye automatically aane wali request ko allow karega
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Health Checks
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'PrimePay Live!' }));
app.get('/api', (req, res) => res.json({ status: 'ok' }));

// MAIN ROUTES
try {
  const auth = require('./middleware/auth');
  const restaurantRoutes = require('./routes/restaurant');
  
  // Frontend ke /api/superadmin/restaurants se match karne ke liye
  app.use('/api/superadmin/restaurants', auth, auth.requireRole('superadmin'), restaurantRoutes);
  
} catch (error) {
  console.error("❌ Connection Error:", error.message);
}

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ error: `Backend live hai, rasta check karein: ${req.originalUrl}` });
});

module.exports = app;
