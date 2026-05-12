require('dotenv').config();
const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth');
const restaurantRoutes = require('./routes/restaurantRoutes');

const app = express();

// 1. CORS Settings (Frontend ko ijazat)
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// 2. Health Check (Check karne ke liye: prime-pay-one.vercel.app/api/health)
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Backend is Live' }));

// 3. MAIN ROUTES (Danish bhai, yahan /api lagana zaroori hai frontend ke liye)
app.use('/api/superadmin/restaurants', auth, auth.requireRole('superadmin'), restaurantRoutes);

// Error handling agar rasta na mile
app.use((req, res) => {
    res.status(404).json({ error: `Rasta nahi mila: ${req.originalUrl}` });
});

module.exports = app;
