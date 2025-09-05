'use strict';
const express = require('express');
const router = express.Router();

const { Role, Sex, Level } = require('../../db/models');

router.get('/roles', async (req, res) => {
  try {
    const rows = await Role.findAll({ order: [['id', 'ASC']] });
    res.json(rows);
  } catch (err) {
    console.error('[ref.roles] error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/sexes', async (req, res) => {
  try {
    const rows = await Sex.findAll({ order: [['id', 'ASC']] });
    res.json(rows);
  } catch (err) {
    console.error('[ref.sexes] error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/levels', async (req, res) => {
  try {
    const rows = await Level.findAll({ order: [['id', 'ASC']] });
    res.json(rows);
  } catch (err) {
    console.error('[ref.levels] error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;