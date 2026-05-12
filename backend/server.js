require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// 1. CORS Settings (Permission pakki karein)
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// 2. HEALTH CHECK (Browser mein check karein: /api/health)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PrimePay Backend Connected!' });
});

// 3. MAIN ROUTES
try {
  const auth = require('./middleware/auth');
  // Danish bhai, aapke GitHub ke mutabiq file ka naam 'restaurant.js' hai
  const restaurantRoutes = require('./routes/restaurant');

  // Ye rasta frontend ke '/api' se bilkul match karega
  app.use('/api/superadmin/restaurants', auth, auth.requireRole('superadmin'), restaurantRoutes);
  
} catch (error) {
  console.error("❌ Module Connection Error:", error.message);
}

// 4. CATCH ALL (Jo aapko screenshot mein nazar aa raha hai)
app.use('*', (req, res) => {
  res.status(404).json({ error: `Backend live hai, lekin ye rasta ghalat hai: ${req.originalUrl}` });
});

module.exports = app;
