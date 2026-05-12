require('dotenv').config();
const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth');
const restaurantRoutes = require('./routes/restaurantRoutes');

const app = express();

// Danish bhai, ye line aapke frontend ko ijazat degi
app.use(cors({
  origin: [
    "https://prime-pay-3hbm-fyy53txqe-danish122.vercel.app",
    "https://prime-pay-3hbm.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Health Check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/superadmin/restaurants', auth, auth.requireRole('superadmin'), restaurantRoutes);

module.exports = app;
