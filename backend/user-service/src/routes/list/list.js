// src/routes/list/list.js
'use strict';

const express = require('express');
const { Op } = require('sequelize');
const { User, Profile } = require('../../db/models');

const router = express.Router();

/**
 * GET /users
 * Liste paginée des utilisateurs
 */
router.get('/', async (req, res) => {
  try {
    // Pagination
    const page  = parseInt(req.query.page, 10)  || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search;

    // Filtre optionnel sur le pseudo
    const where = {};
    if (search) {
      where.pseudo = { [Op.like]: `%${search}%` };
    }

    // Récupère le total et la page de données
    const { count, rows } = await User.findAndCountAll({
      where,
      include: Profile,
      offset: (page - 1) * limit,
      limit
    });

    // Renvoie le résultat
    res.json({
      total:  count,
      page,
      limit,
      users: rows
    });
  } catch (err) {
    console.error('Erreur listUsers:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
