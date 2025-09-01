'use strict';
const express = require('express');
const { ensureAuth } = require('../../middleware/auth');
const { ensureCoach } = require('../../middleware/roles');
const { Availability, CoachProfile } = require('../../db/models');
const { Op } = require('sequelize');

const router = express.Router();

router.get('/', ensureAuth, ensureCoach, async (req, res) => {
  const coach = await CoachProfile.findOne({ where: { user_id: req.user.sub } });
  if (!coach) return res.status(404).json({ error: 'Profil coach introuvable' });
  const { from, to } = req.query;
  const where = { coach_id: coach.id };
  if (from || to) {
    where.start_at = {}; where.end_at = {};
    if (from) where.start_at[Op.gte] = new Date(from);
    if (to) where.end_at[Op.lte] = new Date(to);
  }
  const items = await Availability.findAll({ where, order: [['start_at','ASC']] });
  res.json(items);
});

router.post('/', ensureAuth, ensureCoach, async (req, res) => {
  const coach = await CoachProfile.findOne({ where: { user_id: req.user.sub } });
  if (!coach) return res.status(404).json({ error: 'Profil coach introuvable' });
  const { start_at, end_at, timezone, rrule } = req.body;
  const a = await Availability.create({ coach_id: coach.id, start_at, end_at, timezone, rrule });
  res.status(201).json(a);
});

router.delete('/:id', ensureAuth, ensureCoach, async (req, res) => {
  const coach = await CoachProfile.findOne({ where: { user_id: req.user.sub } });
  if (!coach) return res.status(404).json({ error: 'Profil coach introuvable' });
  const a = await Availability.findByPk(req.params.id);
  if (!a || a.coach_id !== coach.id) return res.status(404).json({ error: 'Créneau introuvable' });
  await a.destroy();
  res.json({ message: 'Créneau supprimé' });
});

module.exports = router;
