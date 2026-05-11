require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const auth = require('./middleware/auth');
const restaurantRoutes = require('./routes/restaurantRoutes');

const app = express();

// 1. MIDDLEWARES
app.use(morgan('dev'));
app.use(express.json());

// CORS Settings - Vercel ke liye optimized
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// 2. ROUTES
// Health check route
app.get('/health', (req, res) => res.json({ status: 'ok', message: 'PrimePay API is Live' }));

// Main API Route (Yahan auth check hoga)
// Danish bhai, check kijiyega ke routes/restaurantRoutes.js file ka naam sahi hai
app.use('/api/superadmin/restaurants', auth, auth.requireRole('superadmin'), restaurantRoutes);

// 3. ERROR HANDLING
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 4. VERCEL EXPORT (Sabse zaroori step)
// Vercel par app.listen nahi likhte, bas app ko export karte hain
module.exports = app;
