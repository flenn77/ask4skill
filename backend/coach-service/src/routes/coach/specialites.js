'use strict';
const express = require('express');
const { ensureAuth } = require('../../middleware/auth');
const { ensureCoach } = require('../../middleware/roles');
const { CoachProfile, CoachSpecialite } = require('../../db/models');

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
 * GET /coach/specialites
 * Liste des spécialités du coach courant
 */
router.get('/', ensureAuth, ensureCoach, async (req, res) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;
    const items = await CoachSpecialite.findAll({ where: { coach_id: coachId }, order: [['specialty','ASC']] });
    return res.json(items);
  } catch (e) {
    console.error('[GET /coach/specialites]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /coach/specialites
 * Ajoute une spécialité. Empêche les doublons (coach_id + specialty).
 * Body: { specialty: "individuel" }
 */
router.post('/', ensureAuth, ensureCoach, async (req, res) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;
    const specialty = String(req.body?.specialty || '').trim();
    if (!specialty) return res.status(400).json({ error: 'specialty requis' });

    const exists = await CoachSpecialite.findOne({ where: { coach_id: coachId, specialty } });
    if (exists) return res.status(409).json({ error: 'Spécialité déjà ajoutée' });

    const item = await CoachSpecialite.create({ coach_id: coachId, specialty });
    return res.status(201).json(item);
  } catch (e) {
    console.error('[POST /coach/specialites]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /coach/specialites/:specialty
 * Supprime la spécialité (clé composite coach_id + specialty)
 */
router.delete('/:specialty', ensureAuth, ensureCoach, async (req, res) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;
    const specialty = decodeURIComponent(String(req.params.specialty || '')).trim();
    if (!specialty) return res.status(400).json({ error: 'specialty manquant' });

    const item = await CoachSpecialite.findOne({ where: { coach_id: coachId, specialty } });
    if (!item) return res.status(404).json({ error: 'Spécialité introuvable' });

    await item.destroy();
    return res.json({ message: 'Supprimé' });
  } catch (e) {
    console.error('[DELETE /coach/specialites/:specialty]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
