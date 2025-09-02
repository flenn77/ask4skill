'use strict';
const express = require('express');
const Stripe = require('stripe');
const { Booking } = require('../db/models');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        const booking = await Booking.findOne({ where: { stripe_payment_intent_id: pi.id } });
        if (booking && booking.status === 'PENDING') {
          await booking.update({ status: 'PAID', stripe_payment_status: pi.status });
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        const booking = await Booking.findOne({ where: { stripe_payment_intent_id: pi.id } });
        if (booking) await booking.update({ stripe_payment_status: pi.status });
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error('Webhook handler error:', e);
    return res.status(500).end();
  }
  res.json({ received: true });
});

module.exports = router;
