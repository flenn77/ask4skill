'use strict';
const express = require('express');
const { Op } = require('sequelize');
const { ensureAuth } = require('../../middleware/auth');
const { ensureCoach } = require('../../middleware/roles');
const validate = require('../../middleware/validate');
const schema = require('../../middleware/validators/offer.schema');
const { CoachProfile, Offer } = require('../../db/models');

const router = express.Router();

async function getCoachIdOr404(req, res) {
  const profile = await CoachProfile.findOne({ where: { user_id: req.user.sub } });
  if (!profile) {
    res.status(404).json({ error: 'Profil coach introuvable' });
    return null;
  }
  return profile.id;
}

/**
 * @openapi
 * /coach/offers:
 *   get:
 *     summary: Liste paginée des offres du coach courant
 *     tags: [Coach/Offers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: perPage
 *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
 *       - in: query
 *         name: actif
 *         schema: { type: boolean }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [INDIVIDUEL, GROUPE, REPLAY, LIVE] }
 *       - in: query
 *         name: sort
 *         description: "Champ:direction. Ex: created_at:desc, prix_centimes:asc"
 *         schema: { type: string, default: "created_at:desc" }
 *       - in: query
 *         name: q
 *         description: Recherche sur le titre
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', ensureAuth, ensureCoach, validate(schema.queryList, 'query'), async (req, res, next) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;

    // Robust parsing + defaults (même si le validator n’a pas peuplé req.query)
    let { page = 1, perPage = 20, actif, type, sort = 'created_at:desc', q } = req.query;

    page = Number(page);
    perPage = Number(perPage);
    if (!Number.isFinite(page) || page < 1) page = 1;
    if (!Number.isFinite(perPage) || perPage < 1 || perPage > 100) perPage = 20;

    const where = { coach_id: coachId };

    // actif peut arriver en bool (validator) ou en string ("true"/"false") via la query
    if (typeof actif === 'boolean') {
      where.actif = actif;
    } else if (typeof actif === 'string') {
      const a = actif.toLowerCase();
      if (a === 'true') where.actif = true;
      else if (a === 'false') where.actif = false;
    }

    if (type) where.type = String(type).toUpperCase();
    if (q) where.titre = { [Op.like]: `%${q}%` };

    // Tri whiteliste
    const [fieldRaw, dirRaw] = String(sort || 'created_at:desc').split(':');
    const SORT_MAP = {
      created_at: 'created_at',
      updated_at: 'updated_at',
      prix_centimes: 'prix_centimes',
      duree_min: 'duree_min',
      titre: 'titre'
    };
    const col = SORT_MAP[fieldRaw] || 'created_at';
    const dir = String(dirRaw || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const order = [[col, dir]];

    const offset = (page - 1) * perPage;

    // Séparation count / rows (évite LIMIT NaN,NaN et simplifie le debug)
    const total = await Offer.count({ where });
    const items = await Offer.findAll({ where, order, offset, limit: perPage });

    return res.json({
      items,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.max(1, Math.ceil(total / perPage))
      }
    });
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /coach/offers:
 *   post:
 *     summary: Crée une offre
 *     tags: [Coach/Offers]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OfferCreate'
 *     responses:
 *       201: { description: Créé }
 */
router.post('/', ensureAuth, ensureCoach, validate(schema.create, 'body'), async (req, res, next) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;

    const payload = { ...req.body, coach_id: coachId };
    if (payload.type === 'REPLAY') payload.duree_min = 0;

    const offer = await Offer.create(payload);
    res.status(201).json(offer);
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /coach/offers/{id}:
 *   patch:
 *     summary: Met à jour une offre
 *     tags: [Coach/Offers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OfferUpdate' }
 *     responses:
 *       200: { description: OK }
 */
router.patch('/:id', ensureAuth, ensureCoach, validate(schema.update, 'body'), async (req, res, next) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;

    const offer = await Offer.findByPk(req.params.id);
    if (!offer || offer.coach_id !== coachId) {
      return res.status(404).json({ error: 'Offre introuvable' });
    }

    const patch = { ...req.body };
    if (patch.type === 'REPLAY') patch.duree_min = 0;

    await offer.update(patch);
    res.json(offer);
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /coach/offers/{id}:
 *   delete:
 *     summary: Supprime une offre
 *     tags: [Coach/Offers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Supprimé }
 */
router.delete('/:id', ensureAuth, ensureCoach, async (req, res, next) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;

    const offer = await Offer.findByPk(req.params.id);
    if (!offer || offer.coach_id !== coachId) {
      return res.status(404).json({ error: 'Offre introuvable' });
    }
    await offer.destroy();
    res.json({ message: 'Supprimé' });
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /coach/offers/{id}/activer:
 *   post:
 *     summary: Active l’offre
 *     tags: [Coach/Offers]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.post('/:id/activer', ensureAuth, ensureCoach, async (req, res, next) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;

    const offer = await Offer.findByPk(req.params.id);
    if (!offer || offer.coach_id !== coachId) return res.status(404).json({ error: 'Offre introuvable' });

    await offer.update({ actif: true });
    res.json(offer);
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /coach/offers/{id}/desactiver:
 *   post:
 *     summary: Désactive l’offre
 *     tags: [Coach/Offers]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.post('/:id/desactiver', ensureAuth, ensureCoach, async (req, res, next) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;

    const offer = await Offer.findByPk(req.params.id);
    if (!offer || offer.coach_id !== coachId) return res.status(404).json({ error: 'Offre introuvable' });

    await offer.update({ actif: false });
    res.json(offer);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
