'use strict';

const express               = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt                = require('bcrypt');
const { ensureAuth }        = require('../../middleware/auth');
const { User }              = require('../../db/models');

const router = express.Router();

/**
 * PATCH /users/me/password
 * Change le mot de passe de l’utilisateur connecté
 */
router.patch(
  '/',
  ensureAuth,

  // Validation des champs
  body('oldPassword')
    .notEmpty().withMessage('Mot de passe actuel requis'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('8 caractères minimum')
    .matches(/[A-Z]/).withMessage('Au moins une majuscule')
    .matches(/[a-z]/).withMessage('Au moins une minuscule')
    .matches(/\d/).withMessage('Au moins un chiffre')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Au moins un caractère spécial'),

  async (req, res) => {
    // 1) Vérif. des payloads
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.sub;

    try {
      // 2) Charger l’utilisateur
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // 3) Vérifier l’ancien mot de passe
      const ok = await bcrypt.compare(oldPassword, user.password);
      if (!ok) {
        return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
      }

      // 4) Hasher et enregistrer le nouveau mot de passe
      const hash = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hash });

      res.json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (err) {
      console.error('changePassword error:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

module.exports = router;
