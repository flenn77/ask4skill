'use strict';
const express = require('express');
const { ensureAuth } = require('../../middleware/auth');
const { ensureCoach } = require('../../middleware/roles');
const validate = require('../../middleware/validate');
const schema = require('../../middleware/validators/demande.coaching.schema');
const { CoachProfile, DemandeCoaching } = require('../../db/models');
const { loadDemande, ensureCoachOwner } = require('../../middleware/demandeAccess');

const router = express.Router();

/**
 * GET /coach/demandes?statut=EN_ATTENTE
 * Liste des demandes reçues par le coach courant
 */
router.get('/', ensureAuth, ensureCoach, async (req, res, next) => {
  try {
    const profile = await CoachProfile.findOne({ where: { user_id: req.user.sub } });
    if (!profile) return res.status(404).json({ error: 'Profil coach introuvable' });
    const where = { coach_id: profile.id };
    if (req.query.statut) where.statut = req.query.statut;
    const items = await DemandeCoaching.findAll({ where, order: [['date_creation','DESC']] });
    res.json(items);
  } catch (e) { next(e); }
});

/**
 * POST /coach/demandes/:id/accepter
 * Accepte une demande (coach propriétaire)
 */
router.post('/:id/accepter', ensureAuth, ensureCoach, loadDemande, ensureCoachOwner(), validate(schema.accept, 'body'), async (req, res, next) => {
  try {
    if (req.demande.statut !== 'EN_ATTENTE') {
      return res.status(409).json({ error: `Impossible d'accepter (statut=${req.demande.statut})` });
    }
    const patch = { statut: 'ACCEPTEE' };
    if (req.body.conversation_id) patch.conversation_id = req.body.conversation_id;
    await req.demande.update(patch);
    // TODO: notifier le joueur
    res.json(req.demande);
  } catch (e) { next(e); }
});

/**
 * POST /coach/demandes/:id/refuser
 * Refuse une demande (coach propriétaire) + archive immédiatement
 */
router.post('/:id/refuser', ensureAuth, ensureCoach, loadDemande, ensureCoachOwner(), validate(schema.refuse, 'body'), async (req, res, next) => {
  try {
    if (req.demande.statut !== 'EN_ATTENTE') {
      return res.status(409).json({ error: `Impossible de refuser (statut=${req.demande.statut})` });
    }
    await req.demande.update({
      statut: 'REFUSEE',
      raison_refus: req.body.raison_refus,
      date_archive: new Date()
    });
    // TODO: notifier le joueur
    res.json(req.demande);
  } catch (e) { next(e); }
});

module.exports = router;
