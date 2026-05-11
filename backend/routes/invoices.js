// backend/routes/invoices.js
const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const ts = () => new Date().toISOString();

router.get('/', async (req, res) => {
  try {
    const s = await db.collection('invoices').where('businessId', '==', req.user.uid).orderBy('createdAt', 'desc').get();
    res.json(s.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { clientName, amount, dueDate, note } = req.body;
    if (!clientName || !amount) return res.status(400).json({ error: 'clientName and amount required' });
    const count = (await db.collection('invoices').where('businessId', '==', req.user.uid).get()).size;
    const d = await db.collection('invoices').add({ businessId: req.user.uid, clientName, amount: +amount, dueDate: dueDate || '', note: note || '', invoiceNumber: 'INV-' + String(count + 1).padStart(4, '0'), status: 'pending', createdAt: ts() });
    res.status(201).json({ id: d.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', async (req, res) => {
  try { await db.collection('invoices').doc(req.params.id).update({ ...req.body, updatedAt: ts() }); res.json({ message: 'Updated' }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
