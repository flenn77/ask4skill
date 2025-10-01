'use strict';
const express = require('express');
const { ensureAuth } = require('../middleware/auth');
const { ensurePlayer } = require('../middleware/roles');
const validate = require('../middleware/validate');
const schema = require('../middleware/validators/demande.coaching.schema');
const { CoachProfile, DemandeCoaching } = require('../db/models');
const { Op } = require('sequelize');

const router = express.Router();

function eurosToCents(n) { return Math.round(Number(n) * 100); }
function calcPrixCentimes(profile, type, dureeMin) {
  if (type === 'REPLAY') return eurosToCents(profile.prix_replay ?? 0);
  const hrs = (Number(dureeMin || 0) / 60);
  if (type === 'GROUPE')     return eurosToCents((profile.prix_session_groupe ?? 0) * hrs);
  if (type === 'LIVE')       return eurosToCents((profile.prix_par_heure ?? 0) * hrs);
  /* INDIVIDUEL (default) */ return eurosToCents((profile.prix_par_heure ?? 0) * hrs);
}

/**
 * POST /demandes
 * Crée une demande (par un joueur)
 */
router.post('/', ensureAuth, ensurePlayer, validate(schema.create, 'body'), async (req, res, next) => {
  try {
    const coach = await CoachProfile.findByPk(req.body.coach_id);
    if (!coach) return res.status(404).json({ error: 'Coach introuvable' });

    const { type, date_debut, duree_min, message_joueur } = req.body;
    if (type !== 'REPLAY') {
      if (!date_debut || !duree_min) return res.status(400).json({ error: 'date_debut et duree_min requis' });
    }

    const prix_centimes = calcPrixCentimes(coach, type, duree_min);
    if (!Number.isFinite(prix_centimes) || prix_centimes < 0) {
      return res.status(400).json({ error: 'Prix invalide (profil coach incomplet)' });
    }

    const item = await DemandeCoaching.create({
      joueur_id: req.user.sub,
      coach_id: coach.id,
      type,
      date_debut: type === 'REPLAY' ? null : new Date(date_debut),
      duree_min:  type === 'REPLAY' ? null : Number(duree_min),
      prix_centimes,
      devise: coach.devise || 'EUR',
      statut: 'EN_ATTENTE',
      message_joueur: message_joueur || null
    });

    // TODO: notifier le coach (event / queue)
    return res.status(201).json(item);
  } catch (e) { next(e); }
});

/**
 * GET /demandes/moi
 * Liste mes demandes (côté joueur)
 */
router.get('/moi', ensureAuth, ensurePlayer, async (req, res, next) => {
  try {
    const { statut } = req.query;
    const where = { joueur_id: req.user.sub };
    if (statut) where.statut = statut;
    const items = await DemandeCoaching.findAll({
      where,
      order: [['date_creation','DESC']]
    });
    res.json(items);
  } catch (e) { next(e); }
});

/**
 * GET /demandes/:id
 * Détail d’une demande si je suis participant (joueur ou coach) ou admin
 */
const { loadDemande, ensureDemandeParticipant } = require('../middleware/demandeAccess');
router.get('/:id', ensureAuth, loadDemande, ensureDemandeParticipant(), (req, res) => {
  res.json(req.demande);
});

/**
 * POST /demandes/:id/archiver
 * Archive par l’un des participants (joueur/coach) ou admin
 */
router.post('/:id/archiver', ensureAuth, loadDemande, ensureDemandeParticipant(), validate(schema.archive, 'body'), async (req, res, next) => {
  try {
    if (req.demande.statut === 'ARCHIVEE') return res.json(req.demande);
    await req.demande.update({ statut: 'ARCHIVEE', date_archive: new Date() });
    res.json(req.demande);
  } catch (e) { next(e); }
});

module.exports = router;
