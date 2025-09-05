'use strict';
const express = require('express');
const { ensureAuth } = require('../../middleware/auth');
const { ensureCoach } = require('../../middleware/roles');
const { CoachProfile, CoachGame } = require('../../db/models');

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
 * GET /coach/games
 * Liste des jeux du coach courant
 */
router.get('/', ensureAuth, ensureCoach, async (req, res) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;
    const items = await CoachGame.findAll({ where: { coach_id: coachId }, order: [['game','ASC']] });
    return res.json(items);
  } catch (e) {
    console.error('[GET /coach/games]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /coach/games
 * Ajoute un jeu. Empêche les doublons (coach_id + game).
 * Body: { game: "Valorant" }
 */
router.post('/', ensureAuth, ensureCoach, async (req, res) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;
    const game = String(req.body?.game || '').trim();
    if (!game) return res.status(400).json({ error: 'game requis' });

    const exists = await CoachGame.findOne({ where: { coach_id: coachId, game } });
    if (exists) return res.status(409).json({ error: 'Jeu déjà ajouté' });

    const item = await CoachGame.create({ coach_id: coachId, game });
    return res.status(201).json(item);
  } catch (e) {
    console.error('[POST /coach/games]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /coach/games/:game
 * Supprime le jeu (clé composite coach_id + game)
 */
router.delete('/:game', ensureAuth, ensureCoach, async (req, res) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;
    const game = decodeURIComponent(String(req.params.game || '')).trim();
    if (!game) return res.status(400).json({ error: 'game manquant' });

    const item = await CoachGame.findOne({ where: { coach_id: coachId, game } });
    if (!item) return res.status(404).json({ error: 'Jeu introuvable' });

    await item.destroy();
    return res.json({ message: 'Supprimé' });
  } catch (e) {
    console.error('[DELETE /coach/games/:game]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
