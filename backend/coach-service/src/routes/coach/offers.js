'use strict';
const express = require('express');
const { ensureAuth } = require('../../middleware/auth');
const { ensureCoach } = require('../../middleware/roles');
const { Offer, CoachProfile } = require('../../db/models');

const router = express.Router();

router.get('/', ensureAuth, ensureCoach, async (req, res) => {
  const coach = await CoachProfile.findOne({ where: { user_id: req.user.sub } });
  if (!coach) return res.status(404).json({ error: 'Profil coach introuvable' });
  const offers = await Offer.findAll({ where: { coach_id: coach.id }, order: [['created_at','DESC']] });
  res.json(offers);
});

router.post('/', ensureAuth, ensureCoach, async (req, res) => {
  const coach = await CoachProfile.findOne({ where: { user_id: req.user.sub } });
  if (!coach) return res.status(404).json({ error: 'Profil coach introuvable' });
  const { type, titre, description, duree_min, prix_centimes, devise, actif } = req.body;
  const offer = await Offer.create({ coach_id: coach.id, type, titre, description, duree_min, prix_centimes, devise, actif });
  res.status(201).json(offer);
});

router.patch('/:id', ensureAuth, ensureCoach, async (req, res) => {
  const coach = await CoachProfile.findOne({ where: { user_id: req.user.sub } });
  if (!coach) return res.status(404).json({ error: 'Profil coach introuvable' });
  const offer = await Offer.findByPk(req.params.id);
  if (!offer || offer.coach_id !== coach.id) return res.status(404).json({ error: 'Offre introuvable' });
  const fields = ['type','titre','description','duree_min','prix_centimes','devise','actif'];
  const data = {};
  fields.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k]; });
  await offer.update(data);
  res.json(offer);
});

router.delete('/:id', ensureAuth, ensureCoach, async (req, res) => {
  const coach = await CoachProfile.findOne({ where: { user_id: req.user.sub } });
  if (!coach) return res.status(404).json({ error: 'Profil coach introuvable' });
  const offer = await Offer.findByPk(req.params.id);
  if (!offer || offer.coach_id !== coach.id) return res.status(404).json({ error: 'Offre introuvable' });
  await offer.destroy();
  res.json({ message: 'Offre supprimée' });
});

module.exports = router;
