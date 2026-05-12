require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Danish bhai, ye CORS ki setting aapke frontend ko ijazat degi
app.use(cors({
  origin: [
    "https://prime-pay-3hbm-p8bqcfo4f-danish122.vercel.app",
    "https://prime-pay-3hbm.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Health Checks
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api', (req, res) => res.json({ status: 'ok' }));

// Routes
try {
  const auth = require('./middleware/auth');
  const restaurantRoutes = require('./routes/restaurant');
  app.use('/api/superadmin/restaurants', auth, auth.requireRole('superadmin'), restaurantRoutes);
} catch (error) {
  console.error("❌ Connection Error:", error.message);
}

module.exports = app;
