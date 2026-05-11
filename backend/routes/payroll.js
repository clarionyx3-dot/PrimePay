// backend/routes/payroll.js
const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const ts = () => new Date().toISOString();

router.get('/', async (req, res) => {
  try {
    const s = await db.collection('payroll').where('businessId', '==', req.user.uid).orderBy('payDate', 'desc').limit(100).get();
    res.json(s.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { employeeName, amount, payDate, role } = req.body;
    const d = await db.collection('payroll').add({ businessId: req.user.uid, employeeName, amount: +amount, payDate, role: role || 'Staff', status: 'paid', createdAt: ts() });
    res.status(201).json({ id: d.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
