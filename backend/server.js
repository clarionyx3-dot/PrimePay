require('dotenv').config();
const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth');
const restaurantRoutes = require('./routes/restaurantRoutes');

const app = express();

// 1. Permissions (CORS)
app.use(cors({ origin: "*" })); 
app.use(express.json());

// 2. Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 3. MAIN ROUTES
// Danish bhai, yahan rasta check karein
app.use('/api/superadmin/restaurants', auth, auth.requireRole('superadmin'), restaurantRoutes);

// Agar koi ghalat rasta kholay toh ye error dega
app.use('*', (req, res) => {
    res.status(404).json({ error: `Rasta nahi mila: ${req.originalUrl}` });
});

module.exports = app;
