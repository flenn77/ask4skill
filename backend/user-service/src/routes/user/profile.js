'use strict';

const express       = require('express');
const { ensureAuth }= require('../../middleware/auth');
const { User }      = require('../../db/models');

const router = express.Router({ mergeParams: true });

/**
 * GET /users/:id/profile
 * Récupère les champs « profil » de l’utilisateur
 */
router.get('/', ensureAuth, async (req, res) => {
  const userId = req.params.id;
  if (req.user.sub !== userId) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  try {
    const user = await User.findByPk(userId, {
      attributes: [
        'avatar_url',
        'bio',
        'location',
        'preferences',
        'notifications'
      ]
    });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PATCH /users/:id/profile
 * Met à jour les champs « profil » de l’utilisateur
 */
router.patch('/', ensureAuth, async (req, res) => {
  const userId = req.params.id;
  if (req.user.sub !== userId) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    const allowed = ['avatar_url','bio','location','preferences','notifications'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Aucun champ valide à mettre à jour' });
    }
    await user.update(updates);
    const { avatar_url, bio, location, preferences, notifications } = user;
    res.json({ avatar_url, bio, location, preferences, notifications });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
