'use strict';

const express       = require('express');
const { Op }        = require('sequelize');
const { User }      = require('../../db/models');
const { ensureAuth }  = require('../../middleware/auth');
const { ensureAdmin } = require('../../middleware/roles');

const router = express.Router();

router.get('/', ensureAuth, ensureAdmin, async (req, res) => {
  try {
    const page   = parseInt(req.query.page,  10) || 1;
    const limit  = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search;

    const where = {};
    if (search) {
      where.pseudo = { [Op.like]: `%${search}%` };
    }

    const attributes = { exclude: ['password'] };

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes,
      offset: (page - 1) * limit,
      limit
    });

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

