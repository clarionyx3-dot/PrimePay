require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());

// CORS Fix
app.use(cors({
  origin: '*', 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Health Check - Pehle ye check karega ke backend zinda hai ya nahi
app.get('/', (req, res) => res.send("PrimePay Backend is Live and Running!"));

// Danish bhai, yahan hum files ko "Safe" tareeqe se bula rahe hain
try {
  const auth = require('./middleware/auth');
  const restaurantRoutes = require('./routes/restaurantRoutes');
  
  app.use('/api/superadmin/restaurants', auth, auth.requireRole('superadmin'), restaurantRoutes);
} catch (error) {
  console.error("❌ File Load Error:", error.message);
}

module.exports = app;
