require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Danish bhai, ye block har link ko allow karega taaki CORS error na aaye
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

// Verification Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'PrimePay Master Bypass Active!' });
});

// MAIN ROUTES
try {
  const auth = require('./middleware/auth');
  const restaurantRoutes = require('./routes/restaurant');
  
  // Dashboard ke raste (Stats, Orders, Restaurants sab isi mein handle honge)
  app.use('/api/superadmin/restaurants', auth, auth.requireRole('superadmin'), restaurantRoutes);
  app.use('/api/restaurant', auth, restaurantRoutes);
  
} catch (error) {
  console.error("❌ Component Loading Error:", error.message);
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Vercel ke liye Port ki setting
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
