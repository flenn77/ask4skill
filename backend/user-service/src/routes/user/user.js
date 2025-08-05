'use strict';

const express        = require('express');
const { User }       = require('../../db/models');
const { Sequelize }  = require('sequelize');
const { ensureAuth } = require('../../middleware/auth');
const { ensureAdmin }= require('../../middleware/roles');
const profileRoute   = require('./profile');

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

// Routes profil (mise à jour / récupération du « profile » du user)
router.use('/profile', profileRoute);

module.exports = router;

