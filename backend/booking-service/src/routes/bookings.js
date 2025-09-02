'use strict';
const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const { ensureAuth } = require('../middleware/auth');
const { ensurePlayer } = require('../middleware/roles');
const { Booking } = require('../db/models');
const Stripe = require('stripe');
const { Op } = require('sequelize');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

const COACH_SERVICE_URL = process.env.COACH_SERVICE_URL || 'http://coach-service:5000';
const PLATFORM_FEE_BPS = parseInt(process.env.PLATFORM_FEE_BPS || '1000', 10);

async function isWithinAvailability(coach_profile_id, start_at, end_at) {
  const params = new URLSearchParams({ from: start_at, to: end_at }).toString();
  const url = `${COACH_SERVICE_URL}/coachs/${coach_profile_id}/availabilities?${params}`;
  const { data: avails } = await axios.get(url);
  const s = new Date(start_at), e = new Date(end_at);
  return avails.some(a => new Date(a.start_at) <= s && new Date(a.end_at) >= e);
}

// GET /bookings/me?as=player|coach&coach_profile_id=UUID
router.get('/me', ensureAuth, async (req, res) => {
  const as = (req.query.as || 'player').toLowerCase();

  const where = {};
  if (as === 'player') {
    where.player_id = req.user.sub;
  } else if (as === 'coach') {
    if (!req.query.coach_profile_id) {
      return res.status(400).json({ error: 'coach_profile_id requis pour as=coach' });
    }
    where.coach_profile_id = req.query.coach_profile_id;
  } else {
    return res.status(400).json({ error: 'Paramètre as invalide (player|coach)' });
  }

  const bookings = await Booking.findAll({
    where,
    order: [['created_at', 'DESC']]
  });
  res.json(bookings);
});

// DELETE /bookings/:id  (MVP: suppression si non payé)
router.delete('/:id', ensureAuth, async (req, res) => {
  const b = await Booking.findByPk(req.params.id);
  if (!b) return res.status(404).json({ error: 'Booking introuvable' });

  const isPlayer = b.player_id === req.user.sub;
  const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN';
  if (!isPlayer && !isAdmin) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  if (['PAID', 'CONFIRMED', 'DONE'].includes(b.status)) {
    return res.status(409).json({ error: 'Impossible de supprimer un booking déjà payé/confirmé' });
  }

  await b.destroy();
  res.json({ message: 'Booking supprimé' });
});


// POST /bookings/sweep
router.post('/sweep', ensureAuth, async (req, res) => {
  if (!['ADMIN', 'SUPERADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Réservé aux admins' });
  }

  const now = new Date();

  const [cancelledCount] = await Booking.update(
    { status: 'CANCELLED' },
    {
      where: {
        status: 'PENDING',
        start_at: { [Op.lte]: now }
      }
    }
  );

  const [doneCount] = await Booking.update(
    { status: 'DONE' },
    {
      where: {
        status: 'CONFIRMED',
        end_at: { [Op.lte]: now }
      }
    }
  );

  return res.json({
    now: now.toISOString(),
    cancelledPending: cancelledCount,
    doneConfirmed: doneCount
  });
});


// POST /bookings/:id/cancel
router.post('/:id/cancel', ensureAuth, async (req, res) => {
  const b = await Booking.findByPk(req.params.id);
  if (!b) return res.status(404).json({ error: 'Booking introuvable' });

  const now = new Date();

  const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN';
  let isPlayer = false;
  let isCoachOfThisBooking = false;

  if (req.user.role === 'JOUEUR') {
    isPlayer = (b.player_id === req.user.sub);
  }

  if (req.user.role === 'COACH') {
    try {
      const { data: myCoachProfile } = await axios.get(
        `${COACH_SERVICE_URL}/coach/profile`,
        { headers: { Authorization: req.headers.authorization } }
      );
      if (myCoachProfile && myCoachProfile.id === b.coach_profile_id) {
        isCoachOfThisBooking = true;
      }
    } catch {
    }
  }

  if (!isPlayer && !isCoachOfThisBooking && !isAdmin) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  if (b.status === 'CANCELLED') {
    return res.json({ message: 'Déjà annulé', booking: b });
  }
  if (b.status === 'DONE' || b.status === 'DISPUTED') {
    return res.status(409).json({ error: 'Impossible d’annuler dans cet état' });
  }

  if (isPlayer && now >= new Date(b.start_at)) {
    return res.status(409).json({ error: 'Trop tard pour annuler (séance commencée)' });
  }

  await b.update({ status: 'CANCELLED' });
  return res.json({ message: 'Booking annulé', booking: b });
});


// GET /bookings/:id
router.get('/:id', ensureAuth, async (req, res) => {
  const b = await Booking.findByPk(req.params.id);
  if (!b) return res.status(404).json({ error: 'Booking introuvable' });

  const isPlayer = b.player_id === req.user.sub;
  const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN';
  const isCoach = req.user.role === 'COACH';
  if (!isPlayer && !isAdmin && !isCoach) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  res.json(b);
});

// POST /bookings -> crée le booking + PaymentIntent
router.post(
  '/',
  ensureAuth,
  ensurePlayer,
  body('coach_profile_id').isUUID(),
  body('offer_id').isUUID(),
  body('start_at').isISO8601(),
  body('end_at').isISO8601(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { coach_profile_id, offer_id, start_at, end_at } = req.body;

    const s = new Date(start_at), e = new Date(end_at);
    if (!(s < e)) return res.status(400).json({ error: 'start_at doit être < end_at' });

    const coachUrl = `${COACH_SERVICE_URL}/coachs/${coach_profile_id}`;
    const { data: coach } = await axios.get(coachUrl);
    const offer = (coach.offers || []).find(o => o.id === offer_id && o.actif);
    if (!offer) return res.status(400).json({ error: 'Offre invalide ou inactive pour ce coach' });

    const okWindow = await isWithinAvailability(coach_profile_id, start_at, end_at);
    if (!okWindow) {
      return res.status(400).json({ error: 'Créneau en dehors des disponibilités du coach' });
    }

    const minutes = Math.round((e - s) / 60000);
    const expected = offer.duree_min || 60;
    if (minutes !== expected) {
      return res.status(400).json({ error: `Durée invalide: ${minutes} min (attendu ${expected} min)` });
    }

    const overlaps = await Booking.findOne({
      where: {
        coach_profile_id,
        status: { [Op.in]: ['PENDING', 'PAID', 'CONFIRMED', 'DONE'] },
        [Op.and]: [
          { start_at: { [Op.lt]: e } },
          { end_at: { [Op.gt]: s } }
        ]
      }
    });
    if (overlaps) return res.status(409).json({ error: 'Créneau indisponible' });

    const price = offer.prix_centimes;
    const currency = (offer.devise || 'EUR').toLowerCase();
    const booking = await Booking.create({
      offer_id,
      coach_profile_id,
      player_id: req.user.sub,
      start_at,
      end_at,
      price_centimes: price,
      currency
    });

    const pi = await stripe.paymentIntents.create({
      amount: price,
      currency,
      description: `Booking ${booking.id} - Offer ${offer_id}`,
      transfer_group: `booking_${booking.id}`,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      metadata: {
        booking_id: booking.id,
        coach_profile_id,
        offer_id,
        player_id: req.user.sub
      }
    });

    await booking.update({ stripe_payment_intent_id: pi.id, stripe_payment_status: pi.status });

    res.status(201).json({
      message: 'Booking créé, confirmer le paiement côté client',
      booking,
      stripe: { client_secret: pi.client_secret }
    });
  }
);

// PATCH /bookings/:id/approve  (coach ou player selon le JWT.role)
router.patch('/:id/approve', ensureAuth, async (req, res) => {
  const CONNECT_ENABLED = String(process.env.STRIPE_CONNECT_ENABLED).toLowerCase() === 'true';
  const b = await Booking.findByPk(req.params.id);
  if (!b) return res.status(404).json({ error: 'Booking introuvable' });

  if (req.user.role === 'COACH') {
    await b.update({ coach_approved: true });
  } else if (req.user.role === 'JOUEUR') {
    if (b.player_id !== req.user.sub) return res.status(403).json({ error: 'Accès refusé' });
    await b.update({ player_approved: true });
  } else if (req.user.role === 'ADMIN' || req.user.role === 'SUPERADMIN') {
    await b.update({ coach_approved: true, player_approved: true });
  } else {
    return res.status(403).json({ error: 'Rôle non autorisé' });
  }

  if (b.status === 'PAID' && b.coach_approved && b.player_approved && !b.stripe_transfer_id) {
    if (CONNECT_ENABLED) {
      const coachUrl = `${COACH_SERVICE_URL}/coachs/${b.coach_profile_id}`;
      const { data: coach } = await axios.get(coachUrl);
      const dest = coach.stripe_account_id;
      if (!dest) return res.status(409).json({ error: 'Coach non onboardé Stripe' });

      const amountToCoach = Math.floor(b.price_centimes * (10000 - PLATFORM_FEE_BPS) / 10000);
      const tr = await stripe.transfers.create({
        amount: amountToCoach,
        currency: b.currency.toLowerCase(),
        destination: dest,
        transfer_group: `booking_${b.id}`,
        metadata: { booking_id: b.id }
      });

      await b.update({ stripe_transfer_id: tr.id, transfer_released_at: new Date(), status: 'DONE' });
    } else {
      await b.update({ status: 'CONFIRMED' });
    }
  }

  res.json(b);
});


// POST /bookings/:id/dispute
router.post('/:id/dispute', ensureAuth, async (req, res) => {
  const b = await Booking.findByPk(req.params.id);
  if (!b) return res.status(404).json({ error: 'Booking introuvable' });
  if (b.player_id !== req.user.sub && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
    return res.status(403).json({ error: 'Accès refusé' });
  await b.update({ status: 'DISPUTED' });
  res.json({ message: 'Litige ouvert', booking: b });
});

router.post('/:id/pay-test', ensureAuth, async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Interdit en production' });
  try {
    const b = await Booking.findByPk(req.params.id);
    if (!b) return res.status(404).json({ error: 'Booking introuvable' });
    if (!b.stripe_payment_intent_id) {
      return res.status(409).json({ error: 'PaymentIntent absent sur ce booking' });
    }

    const pi = await stripe.paymentIntents.confirm(b.stripe_payment_intent_id, {
      payment_method: 'pm_card_visa'
    });

    await b.update({ stripe_payment_status: pi.status });

    if (pi.status === 'succeeded' && b.status === 'PENDING') {
      await b.update({ status: 'PAID' });
    }

    return res.json({
      message: 'Paiement de test exécuté',
      status: pi.status,
      booking_status: b.status,
      pi_id: pi.id
    });
  } catch (err) {
    console.error('pay-test error:', err?.raw || err);
    const msg = err?.raw?.message || err?.message || 'Stripe error';
    return res.status(400).json({ error: msg });
  }
});

// POST /bookings/:id/refresh-payment -> pull l'état Stripe et maj le booking (bypass webhook)
router.post('/:id/refresh-payment', ensureAuth, async (req, res) => {
  try {
    const b = await Booking.findByPk(req.params.id);
    if (!b) return res.status(404).json({ error: 'Booking introuvable' });
    if (!b.stripe_payment_intent_id) {
      return res.status(409).json({ error: 'PaymentIntent absent sur ce booking' });
    }

    const pi = await stripe.paymentIntents.retrieve(b.stripe_payment_intent_id);
    const updates = { stripe_payment_status: pi.status };
    if (pi.status === 'succeeded' && b.status === 'PENDING') {
      updates.status = 'PAID';
    }
    await b.update(updates);

    res.json({ booking_status: b.status, pi_status: pi.status, pi_id: pi.id });
  } catch (err) {
    console.error('refresh-payment error:', err?.raw || err);
    const msg = err?.raw?.message || err?.message || 'Stripe error';
    return res.status(400).json({ error: msg });
  }
});

module.exports = router;
