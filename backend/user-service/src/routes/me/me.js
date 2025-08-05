// src/routes/me/me.js
'use strict';

const express       = require('express');
const { ensureAuth }= require('../../middleware/auth');
const { User, Profile } = require('../../db/models');
const router        = express.Router();

/**
 * GET /users/me
 * Récupère le profil de l’utilisateur connecté
 */
router.get('/', ensureAuth, async (req, res) => {
  const id = req.user.sub;  // req.user défini par ensureAuth
  try {
    const user = await User.findByPk(id, { include: Profile });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({
      message: 'Profil récupéré avec succès',
      data: user
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
