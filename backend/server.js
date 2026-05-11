require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const auth = require('./middleware/auth');
const restaurantRoutes = require('./routes/restaurantRoutes'); // Check karein path sahi ho

const app = express();

// 1. MIDDLEWARES
app.use(morgan('dev'));
app.use(express.json());

// CORS Settings
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// 2. ROUTES
app.get('/health', (req, res) => res.json({ status: 'ok', message: 'PrimePay API is Live' }));

// Protected Routes (Yahan auth check hoga)
app.use('/api/superadmin/restaurants', auth, auth.requireRole('superadmin'), restaurantRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
