const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// 1. Naya Menu Item Add Karna (With Image URL)
router.post('/add', async (req, res) => {
    try {
        const { name, price, category, restaurantId, imageUrl } = req.body;
        
        const newItem = {
            name,
            price: parseFloat(price),
            category,
            restaurantId,
            imageUrl: imageUrl || "", // Agar photo na ho toh khali chhor dega
            available: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('menu_items').add(newItem);
        res.status(201).json({ id: docRef.id, message: "Item added successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Kisi khas restaurant ka poora menu mangwana
router.get('/:restaurantId', async (req, res) => {
    try {
        const snapshot = await db.collection('menu_items')
            .where('restaurantId', '==', req.params.restaurantId)
            .get();
        
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;