const express = require('express');
const router = express.Router();
const stripe = require('stripe')('sk_test_51TVOOmJxWje8BCVwlSZANUxonR4jUvkNYqeaaWaYSvVWguJR2fNdxL4ElD4CJ3KlEGIOgEz8zDBltnqNJMqfMbst00UJp4wBcK'); // Stripe dashboard se Secret Key yahan dalein

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { email, restaurantId, amount } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PrimePay Registration Fee',
              description: 'Initial setup fee for restaurant portal',
            },
            unit_amount: amount * 100, // $50.00 (Stripe cents mein leta hai)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      // Payment ke baad user kahan jaye (Localhost testing ke liye)
      success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}&resId=${restaurantId}`,
      cancel_url: 'http://localhost:3000/register',
      metadata: {
        restaurantId: restaurantId,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;