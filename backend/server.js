require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// 1. CORS Settings (Frontend Permission)
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// 2. HEALTH CHECK (Taaki hum verify kar sakein backend zinda hai)
// Isay check karein: prime-pay-one.vercel.app/api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PrimePay Backend Connected!' });
});

// 3. MAIN ROUTES
try {
  const auth = require('./middleware/auth');
  const restaurantRoutes = require('./routes/restaurantRoutes');

  // Danish bhai, ye rasta frontend ke `/api` se bilkul match karega
  app.use('/api/superadmin/restaurants', auth, auth.requireRole('superadmin'), restaurantRoutes);
  
  // Agar revenue ka route hai toh wo bhi yahan add kar dein
  // const revenueRoutes = require('./routes/revenueRoutes');
  // app.use('/api/superadmin/revenue', auth, auth.requireRole('superadmin'), revenueRoutes);

} catch (error) {
  console.error("❌ Module Load Error:", error.message);
}

// 4. CATCH ALL (Agar rasta ghalat ho toh crash na ho)
app.use('*', (req, res) => {
  res.status(404).json({ error: `Rasta nahi mila: ${req.originalUrl}` });
});

module.exports = app;
