'use strict';

const express        = require('express');
const { ensureAuth } = require('../../middleware/auth');
const { User }          = require('../../db/models');

const router = express.Router();

/**
 * GET /users/me
 */
router.get('/', ensureAuth, async (req, res) => {
  const id = req.user.sub;
  try {
   const user = await User.findByPk(id, {
     attributes: { exclude: ['password'] }
   });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({
      message: 'Profil récupéré avec succès',
      data:    user
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
