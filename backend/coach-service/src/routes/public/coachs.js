'use strict';
const express = require('express');
const { Op } = require('sequelize');
const { CoachProfile, Offer, Availability } = require('../../db/models');

const router = express.Router();

router.get('/', async (req, res) => {
  const { type, langue, prixMin, prixMax, dateFrom, dateTo, sort } = req.query;

  const whereOffer = { actif: true };
  if (type) whereOffer.type = type;
  if (prixMin || prixMax) {
    whereOffer.prix_centimes = {};
    if (prixMin) whereOffer.prix_centimes[Op.gte] = +prixMin;
    if (prixMax) whereOffer.prix_centimes[Op.lte] = +prixMax;
  }

  const profiles = await CoachProfile.findAll({
    include: [{ model: Offer, as: 'offers', where: whereOffer, required: false }],
    order: [['created_at', 'DESC']]
  });

  let filtered = profiles;
  if (langue) {
    filtered = filtered.filter(p => Array.isArray(p.langues) && p.langues.includes(langue));
  }

  if (dateFrom || dateTo) {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    const coachIds = filtered.map(p => p.id);
    const avails = await Availability.findAll({ where: { coach_id: coachIds } });
    const ok = new Set(avails.filter(a => {
      const s = new Date(a.start_at), e = new Date(a.end_at);
      if (from && e < from) return false;
      if (to && s > to) return false;
      return true;
    }).map(a => a.coach_id));
    filtered = filtered.filter(p => ok.has(p.id));
  }

  if (sort === 'price') filtered.sort((a,b)=>minPrice(a)-minPrice(b));
  else if (sort === 'price_desc') filtered.sort((a,b)=>minPrice(b)-minPrice(a));

  res.json(filtered.map(stripPrivate));
});

router.get('/:id', async (req, res) => {
  const p = await CoachProfile.findByPk(req.params.id, {
    include: [{ model: Offer, as: 'offers', where: { actif: true }, required: false }]
  });
  if (!p) return res.status(404).json({ error: 'Coach introuvable' });
  res.json(stripPrivate(p));
});

router.get('/:id/availabilities', async (req, res) => {
  const { Op } = require('sequelize');
  const { from, to } = req.query;
  const where = { coach_id: req.params.id };

  if (from || to) {
    where[Op.and] = [];
    if (from) where[Op.and].push({ end_at:   { [Op.gt]: new Date(from) } });
    if (to)   where[Op.and].push({ start_at: { [Op.lt]: new Date(to)   } });
  }

  const a = await Availability.findAll({ where, order: [['start_at','ASC']] });
  res.json(a);
});


function minPrice(p) {
  if (!p.offers?.length) return Number.MAX_SAFE_INTEGER;
  return Math.min(...p.offers.map(o => o.prix_centimes));
}

function stripPrivate(p) {
  const j = p.toJSON();
  delete j.user_id;
  return j;
}

module.exports = router;
