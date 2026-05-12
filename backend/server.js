require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Danish bhai, ye bilkul safe CORS setting hai
app.use(cors()); 
app.use(express.json());

// 1. Health Check (Sabse pehle ye chalna chahiye)
app.get('/', (req, res) => {
    res.send("PrimePay Backend is Live!");
});

// 2. Routes (Try-Catch mein taaki crash na ho)
try {
    const auth = require('./middleware/auth');
    const restaurantRoutes = require('./routes/restaurantRoutes');
    
    app.use('/api/superadmin/restaurants', auth, auth.requireRole('superadmin'), restaurantRoutes);
} catch (error) {
    console.error("Module loading error:", error.message);
}

module.exports = app;
