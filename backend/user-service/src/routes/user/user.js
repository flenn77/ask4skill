'use strict';

const express        = require('express');
const { User }       = require('../../db/models');
const { Sequelize }  = require('sequelize');
const { ensureAuth } = require('../../middleware/auth');
const { ensureAdmin }= require('../../middleware/roles');
const profileRoute   = require('./profile');
const { body, validationResult } = require('express-validator');

const router = express.Router({ mergeParams: true });

// GET /users/:id
router.get(
  '/',
  ensureAuth,
  ensureAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      res.json({
        message: 'Utilisateur récupéré avec succès',
        data: user
      });
    } catch (err) {
      console.error('getUserById error:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// DELETE /users/:id
router.delete(
  '/',
  ensureAuth,
  ensureAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      const deleted = await User.destroy({ where: { id } });
      if (!deleted) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (err) {
      console.error('deleteUser error:', err);
      if (err instanceof Sequelize.ForeignKeyConstraintError) {
        return res.status(409).json({
          error: 'Impossible de supprimer cet utilisateur : des données dépendantes existent.'
        });
      }
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

router.patch(
  '/',
  ensureAuth,
  ensureAdmin,
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('pseudo').optional().isLength({ min: 3, max: 30 }).withMessage('Pseudo 3–30 caractères'),
  body('prenom').optional().isLength({ max: 50 }).withMessage('Prénom trop long'),
  body('nom').optional().isLength({ max: 50 }).withMessage('Nom trop long'),
  body('telephone').optional().matches(/^\+\d{10,15}$/).withMessage('Téléphone invalide'),
  body('role').optional().isIn(['JOUEUR','COACH','ADMIN','SUPERADMIN','MODERATEUR'])
               .withMessage('Role invalide'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const toUpdate = {};
    ['email','pseudo','prenom','nom','telephone','role'].forEach(f => {
      if (req.body[f] !== undefined) toUpdate[f] = req.body[f];
    });
    if (Object.keys(toUpdate).length === 0) {
      return res.status(400).json({ error: 'Aucun champ valide à mettre à jour' });
    }

    try {
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      await user.update(toUpdate);
      const result = user.toJSON();
      delete result.password;
      res.json({ message: 'Utilisateur mis à jour avec succès', data: result });
    } catch (err) {
      console.error('updateUser error:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

router.use('/profile', profileRoute);

module.exports = router;

