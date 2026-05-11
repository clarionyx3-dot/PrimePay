// backend/routes/payments.js
const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const ts = () => new Date().toISOString();

router.get('/', async (req, res) => {
  try {
    const s = await db.collection('payments').where('businessId', '==', req.user.uid).orderBy('createdAt', 'desc').limit(50).get();
    res.json(s.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { amount, recipient, method, note } = req.body;
    if (!amount || !recipient) return res.status(400).json({ error: 'amount and recipient required' });
    const d = await db.collection('payments').add({ businessId: req.user.uid, amount: +amount, recipient, method: method || 'bank_transfer', note: note || '', status: 'pending', createdAt: ts() });
    res.status(201).json({ id: d.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', async (req, res) => {
  try { await db.collection('payments').doc(req.params.id).update({ ...req.body, updatedAt: ts() }); res.json({ message: 'Updated' }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
