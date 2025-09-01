'use strict';

const express               = require('express');
const { body, validationResult } = require('express-validator');
const { ensureAuth }        = require('../../middleware/auth');
const { User }              = require('../../db/models');

const router = express.Router();

router.get(
  '/',
  ensureAuth,
  async (req, res) => {
    const id = req.user.sub;
    try {
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      res.json({ message: 'Profil récupéré avec succès', data: user });
    } catch (err) {
      console.error('getMe error:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

router.patch(
  '/',
  ensureAuth,
  // on enlève body('email') pour interdiction de mise à jour de l’email
  body('pseudo')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Pseudo : 3–30 caractères'),
  body('prenom')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Prénom trop long'),
  body('nom')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Nom trop long'),
  body('avatar_url')
    .optional()
    .isURL()
    .withMessage('URL invalide'),
  body('sexe')
    .optional()
    .isIn(['H','F','Autre','Non spécifié'])
    .withMessage('Valeur de sexe invalide'),
  body('date_naissance')
    .optional()
    .isISO8601()
    .withMessage('Date invalide'),
  body('telephone')
    .optional()
    .matches(/^\+\d{10,15}$/)
    .withMessage('Téléphone invalide'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = req.user.sub;
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      // champs autorisés à la mise à jour (sans email)
      const updatable = [
        'pseudo',
        'prenom',
        'nom',
        'avatar_url',
        'sexe',
        'date_naissance',
        'telephone'
      ];
      const data = {};
      for (const field of updatable) {
        if (req.body[field] !== undefined) {
          data[field] = req.body[field];
        }
      }
      if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: 'Aucun champ valide à mettre à jour' });
      }

      await user.update(data);
      const result = user.toJSON();
      delete result.password;
      res.json({ message: 'Profil mis à jour avec succès', data: result });
    } catch (err) {
      console.error('updateMe error:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

module.exports = router;
