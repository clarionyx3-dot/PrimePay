// backend/routes/restaurant.js
const express = require('express');
const router  = express.Router();
const { admin, db } = require('../config/firebase');
const { requireRole } = require('../middleware/auth');
const AC = requireRole('admin', 'client', 'superadmin');
const AO = requireRole('admin', 'superadmin');
const ts = () => new Date().toISOString();

async function getPlatformFee() {
  try { const s = await db.collection('platformConfig').doc('fees').get(); return s.exists ? s.data() : { perOrderFee: 0.70, enabled: true }; }
  catch { return { perOrderFee: 0.70, enabled: true }; }
}

// ── MENU ─────────────────────────────────────────────────────
router.get('/menu', AC, async (req, res) => {
  try {
    const s = await db.collection('menuItems').where('restaurantId', '==', req.user.restaurantId).where('available', '==', true).get();
    res.json(s.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/menu/all', AO, async (req, res) => {
  try {
    const s = await db.collection('menuItems').where('restaurantId', '==', req.user.restaurantId).get();
    res.json(s.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/menu', AO, async (req, res) => {
  try {
    const { name, price, category, description, emoji } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'name and price required' });
    const d = await db.collection('menuItems').add({ restaurantId: req.user.restaurantId, name, price: parseFloat(price), category: category || 'Main', description: description || '', emoji: emoji || '🍽️', available: true, createdAt: ts() });
    res.status(201).json({ id: d.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/menu/:id', AO, async (req, res) => {
  try { await db.collection('menuItems').doc(req.params.id).update({ ...req.body, updatedAt: ts() }); res.json({ message: 'Updated' }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/menu/:id', AO, async (req, res) => {
  try { await db.collection('menuItems').doc(req.params.id).update({ available: false }); res.json({ message: 'Hidden' }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ── TABLES ───────────────────────────────────────────────────
router.get('/tables', AC, async (req, res) => {
  try {
    const s = await db.collection('tables').where('restaurantId', '==', req.user.restaurantId).get();
    res.json(s.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/tables', AO, async (req, res) => {
  try {
    const d = await db.collection('tables').add({ restaurantId: req.user.restaurantId, tableNumber: +req.body.tableNumber, capacity: +req.body.capacity || 4, status: 'available', createdAt: ts() });
    res.status(201).json({ id: d.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/tables/:id', AC, async (req, res) => {
  try { await db.collection('tables').doc(req.params.id).update(req.body); res.json({ message: 'Updated' }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ORDERS (with $0.70 platform fee) ─────────────────────────
router.post('/orders', AC, async (req, res) => {
  try {
    const { tableId, tableNumber, items, note } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'No items' });

    const fee    = await getPlatformFee();
    const sub    = items.reduce((s, i) => s + i.price * i.qty, 0);
    const feeAmt = fee.enabled ? (fee.perOrderFee || 0.70) : 0;
    const total  = parseFloat((sub + feeAmt).toFixed(2));

    const restSnap   = await db.collection('restaurants').doc(req.user.restaurantId).get();
    const restName   = restSnap.exists ? restSnap.data().name : 'Unknown';
    const restData   = restSnap.exists ? restSnap.data() : {};

    const orderRef = await db.collection('restaurantOrders').add({
      restaurantId: req.user.restaurantId, restaurantName: restName,
      tableId: tableId || null, tableNumber: tableNumber || 0,
      items, subtotal: parseFloat(sub.toFixed(2)), platformFee: feeAmt, total,
      note: note || '', status: 'open',
      placedBy: req.user.uid, placedByName: req.user.name || req.user.email,
      createdAt: ts(),
    });

    if (tableId) await db.collection('tables').doc(tableId).update({ status: 'occupied', currentOrderId: orderRef.id });

    if (fee.enabled && feeAmt > 0) {
      await db.collection('platformFeeTransactions').add({ orderId: orderRef.id, restaurantId: req.user.restaurantId, restaurantName: restName, feeAmount: feeAmt, orderTotal: total, createdAt: ts() });
      await db.collection('restaurants').doc(req.user.restaurantId).update({
        totalOrders: (restData.totalOrders || 0) + 1,
        totalFeesPaid: parseFloat(((restData.totalFeesPaid || 0) + feeAmt).toFixed(2)),
      });
    }

    res.status(201).json({ orderId: orderRef.id, subtotal: parseFloat(sub.toFixed(2)), platformFee: feeAmt, total });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/orders', AC, async (req, res) => {
  try {
    let q = db.collection('restaurantOrders').where('restaurantId', '==', req.user.restaurantId);
    if (req.query.status) q = q.where('status', '==', req.query.status);
    const s = await q.orderBy('createdAt', 'desc').limit(100).get();
    res.json(s.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/orders/today', AC, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const s = await db.collection('restaurantOrders')
      .where('restaurantId', '==', req.user.restaurantId)
      .where('createdAt', '>=', today.toISOString())
      .orderBy('createdAt', 'desc').get();
    const orders = s.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({
      orders,
      summary: {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((a, o) => a + (o.total || 0), 0).toFixed(2),
        totalFees: orders.reduce((a, o) => a + (o.platformFee || 0), 0).toFixed(2),
        openOrders: orders.filter(o => o.status === 'open').length,
        paidOrders: orders.filter(o => o.status === 'paid').length,
      },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/orders/:id/status', AC, async (req, res) => {
  try {
    const { status } = req.body;
    await db.collection('restaurantOrders').doc(req.params.id).update({ status, updatedAt: ts(), updatedBy: req.user.uid });
    if (status === 'paid') {
      const snap = await db.collection('restaurantOrders').doc(req.params.id).get();
      const o = snap.data();
      if (o.tableId) await db.collection('tables').doc(o.tableId).update({ status: 'available', currentOrderId: null });
    }
    res.json({ message: 'Updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── STAFF ────────────────────────────────────────────────────
router.get('/staff', AO, async (req, res) => {
  try {
    const s = await db.collection('users').where('restaurantId', '==', req.user.restaurantId).where('role', '==', 'client').get();
    res.json(s.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/staff', AO, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const user = await admin.auth().createUser({ email, password, displayName: name });
    await db.collection('users').doc(user.uid).set({ uid: user.uid, email, name, role: 'client', restaurantId: req.user.restaurantId, createdAt: ts() });
    res.status(201).json({ uid: user.uid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── STATS ────────────────────────────────────────────────────
router.get('/stats', AO, async (req, res) => {
  try {
    const restSnap = await db.collection('restaurants').doc(req.user.restaurantId).get();
    const rest = restSnap.data();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todaySnap = await db.collection('restaurantOrders')
      .where('restaurantId', '==', req.user.restaurantId)
      .where('createdAt', '>=', today.toISOString()).get();
    const todayOrders = todaySnap.docs.map(d => d.data());
    res.json({
      restaurant: { ...rest, id: req.user.restaurantId },
      today: {
        orders: todayOrders.length,
        revenue: todayOrders.reduce((a, o) => a + (o.total || 0), 0).toFixed(2),
        fees: todayOrders.reduce((a, o) => a + (o.platformFee || 0), 0).toFixed(2),
      },
      allTime: { totalOrders: rest.totalOrders || 0, totalFeesPaid: rest.totalFeesPaid || 0 },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
