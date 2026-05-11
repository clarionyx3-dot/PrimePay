// backend/routes/superadmin/index.js
const express = require('express');
const router  = express.Router();
const { admin, db } = require('../../config/firebase');
const { requireRole } = require('../../middleware/auth');
const SA = requireRole('superadmin');
const ts = () => new Date().toISOString();

// Fee config
router.get('/fee-config', SA, async (req, res) => {
  try {
    const s = await db.collection('platformConfig').doc('fees').get();
    res.json(s.exists ? s.data() : { perOrderFee: 0.70, enabled: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/fee-config', SA, async (req, res) => {
  try {
    await db.collection('platformConfig').doc('fees').set({
      perOrderFee: parseFloat(req.body.perOrderFee) || 0.70,
      enabled: req.body.enabled !== false,
      updatedAt: ts(), updatedBy: req.user.uid,
    });
    res.json({ message: 'Fee config updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Restaurants CRUD
router.get('/restaurants', SA, async (req, res) => {
  try {
    const s = await db.collection('restaurants').orderBy('createdAt', 'desc').get();
    res.json(s.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/restaurants', SA, async (req, res) => {
  try {
    const { name, address, phone, adminEmail, adminPassword, adminName } = req.body;
    if (!name || !adminEmail || !adminPassword)
      return res.status(400).json({ error: 'name, adminEmail, adminPassword required' });
    const user = await admin.auth().createUser({ email: adminEmail, password: adminPassword, displayName: adminName || name });
    const ref  = await db.collection('restaurants').add({ name, address: address||'', phone: phone||'', adminUid: user.uid, adminEmail, status: 'active', totalOrders: 0, totalFeesPaid: 0, createdAt: ts() });
    await db.collection('users').doc(user.uid).set({ uid: user.uid, email: adminEmail, name: adminName||'', role: 'admin', restaurantId: ref.id, createdAt: ts() });
    res.status(201).json({ restaurantId: ref.id, adminUid: user.uid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/restaurants/:id', SA, async (req, res) => {
  try { await db.collection('restaurants').doc(req.params.id).update({ ...req.body, updatedAt: ts() }); res.json({ message: 'Updated' }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/restaurants/:id', SA, async (req, res) => {
  try { await db.collection('restaurants').doc(req.params.id).update({ status: 'suspended' }); res.json({ message: 'Suspended' }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Revenue
router.get('/revenue', SA, async (req, res) => {
  try {
    const s = await db.collection('platformFeeTransactions').orderBy('createdAt', 'desc').limit(500).get();
    const txns = s.docs.map(d => ({ id: d.id, ...d.data() }));
    const totalFees = txns.reduce((a, t) => a + (t.feeAmount || 0), 0);
    const byRest = {};
    txns.forEach(t => {
      if (!byRest[t.restaurantId]) byRest[t.restaurantId] = { restaurantName: t.restaurantName, orders: 0, fees: 0 };
      byRest[t.restaurantId].orders++;
      byRest[t.restaurantId].fees += t.feeAmount || 0;
    });
    res.json({ totalFees: +totalFees.toFixed(2), totalOrders: txns.length, byRestaurant: byRest, recentTxns: txns.slice(0, 100) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/users', SA, async (req, res) => {
  try { const s = await db.collection('users').get(); res.json(s.docs.map(d => ({ id: d.id, ...d.data() }))); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
