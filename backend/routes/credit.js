// backend/routes/credit.js
const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const ts = () => new Date().toISOString();

router.get('/', async (req, res) => {
  try { const s = await db.collection('creditLines').doc(req.user.uid).get(); if (!s.exists) return res.status(404).json({ error: 'No credit line' }); res.json({ id: s.id, ...s.data() }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/apply', async (req, res) => {
  try {
    const { businessName, monthlyRevenue, requestedAmount } = req.body;
    await db.collection('creditLines').doc(req.user.uid).set({ businessId: req.user.uid, businessName, monthlyRevenue: +monthlyRevenue, requestedAmount: +requestedAmount, approvedAmount: 0, usedAmount: 0, status: 'under_review', interestRate: 8.5, createdAt: ts() });
    res.status(201).json({ message: 'Application submitted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/draw', async (req, res) => {
  try {
    const s = await db.collection('creditLines').doc(req.user.uid).get();
    if (!s.exists) return res.status(404).json({ error: 'No credit line' });
    const cl = s.data();
    if (cl.status !== 'approved') return res.status(400).json({ error: 'Not approved' });
    const amt = +req.body.amount;
    const avail = cl.approvedAmount - cl.usedAmount;
    if (amt > avail) return res.status(400).json({ error: `Only $${avail} available` });
    await db.collection('creditLines').doc(req.user.uid).update({ usedAmount: cl.usedAmount + amt });
    await db.collection('creditTransactions').add({ businessId: req.user.uid, type: 'draw', amount: amt, createdAt: ts() });
    res.json({ message: `$${amt} drawn`, newBalance: cl.usedAmount + amt });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/repay', async (req, res) => {
  try {
    const s = await db.collection('creditLines').doc(req.user.uid).get();
    if (!s.exists) return res.status(404).json({ error: 'No credit line' });
    const cl = s.data();
    const repay = Math.min(+req.body.amount, cl.usedAmount);
    await db.collection('creditLines').doc(req.user.uid).update({ usedAmount: cl.usedAmount - repay });
    await db.collection('creditTransactions').add({ businessId: req.user.uid, type: 'repayment', amount: repay, createdAt: ts() });
    res.json({ message: `$${repay} repaid`, newBalance: cl.usedAmount - repay });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/transactions', async (req, res) => {
  try {
    const s = await db.collection('creditTransactions').where('businessId', '==', req.user.uid).orderBy('createdAt', 'desc').get();
    res.json(s.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
