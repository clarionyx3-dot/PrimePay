require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const admin   = require('firebase-admin');
const path    = require('path');
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Firebase Admin Initialization
// Danish bhai, check karein ke ye file 'config' folder mein isi naam se hai na?
const serviceAccount = require('./config/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("🚀 Firebase Admin SDK Initialized!");
}

const auth = require('./middleware/auth');
const app = express();

// ── 1. MIDDLEWARES (CORS Fix Yahan Hai) ───────────────────────────

// Danish bhai, humne yahan Vercel aur Localhost dono ko allow kar diya hai
app.use(cors({ 
  origin: [
    "https://prime-pay-3hbm.vercel.app", // Aapka Live Frontend
    "http://localhost:3000"              // Aapka Local Testing
  ], 
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ── 2. WEBHOOK ROUTE (Body parser se pehle hona chahiye) ──────
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = "whsec_28977c7a263e82c6ade913e2378ab7149fca243afa30da98dabceb72dab7bd86"; 

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`❌ Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { restaurantId } = session.metadata;

    console.log(`🔔 Payment Confirmed! Activating: ${restaurantId}`);

    try {
      await admin.firestore().collection('restaurants').doc(restaurantId).update({
        status: 'active',
        isPaid: true,
        activatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Restaurant ${restaurantId} is now LIVE!`);
    } catch (dbErr) {
      console.error("❌ Firestore Update Error:", dbErr);
    }
  }

  res.json({ received: true });
});

// Baqi parse rules
app.use(express.json()); 
app.use(morgan('dev'));

// ── 3. ROUTES ───────────────────────────────────────────────────

// Health Check (Dashboard test karne ke liye)
app.get('/health', (req, res) => res.json({ ok: true, app: 'PrimePay v2' }));

// Payment Routes
app.use('/api/payments', require('./routes/paymentRoutes'));

// Menu Routes
app.use('/api/menu', require('./routes/menuRoutes'));

// Protected Routes
app.use('/api/superadmin', auth, require('./routes/superadmin/index'));
app.use('/api/restaurant', auth, require('./routes/restaurant'));
app.use('/api/payments-protected', auth, require('./routes/payments'));
app.use('/api/invoices',   auth, require('./routes/invoices'));
app.use('/api/credit',      auth, require('./routes/credit'));
app.use('/api/payroll',    auth, require('./routes/payroll'));
app.use('/api/inventory',  auth, require('./routes/inventory'));
app.use('/api/employees',  auth, require('./routes/employees'));

// Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ PrimePay API → http://localhost:${PORT}`));
