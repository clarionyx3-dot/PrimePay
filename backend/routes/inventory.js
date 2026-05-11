// backend/routes/inventory.js
const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const ts = () => new Date().toISOString();

router.get('/', async (req, res) => {
  try {
    const s = await db.collection('inventory').where('businessId', '==', req.user.uid).get();
    res.json(s.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const d = await db.collection('inventory').add({ businessId: req.user.uid, ...req.body, createdAt: ts() });
    res.status(201).json({ id: d.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', async (req, res) => {
  try { await db.collection('inventory').doc(req.params.id).update({ ...req.body, updatedAt: ts() }); res.json({ message: 'Updated' }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try { await db.collection('inventory').doc(req.params.id).delete(); res.json({ message: 'Deleted' }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
