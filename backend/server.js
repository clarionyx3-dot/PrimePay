require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Danish bhai, ye line har kism ke "lock" ko bypass kar degi
app.use(cors({
    origin: (origin, callback) => callback(null, true), 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json());

// Health Check (Verify karne ke liye)
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'PrimePay Live!' }));

// MAIN ROUTES
try {
  const auth = require('./middleware/auth');
  const restaurantRoutes = require('./routes/restaurant');
  // Aapke screenshot ke mutabiq stats aur orders ke routes bhi yahan add honay chahiye
  app.use('/api/restaurant', auth, restaurantRoutes);
} catch (error) {
  console.error("❌ Route Error:", error.message);
}

module.exports = app;
