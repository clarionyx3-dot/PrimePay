require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Danish bhai, yahan hum error check laga rahe hain
let restaurantRoutes;
try {
  restaurantRoutes = require('./routes/restaurantRoutes');
} catch (e) {
  console.error("❌ Rasta nahi mila! Check karein file kahan hai:", e.message);
}

const app = express();
app.use(express.json());
app.use(cors());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

if (restaurantRoutes) {
  app.use('/api/superadmin/restaurants', restaurantRoutes);
}

module.exports = app;
