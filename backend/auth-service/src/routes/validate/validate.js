// src/routes/validate/validate.js
'use strict';
const express = require('express');
const router = express.Router();
const { User } = require('../../db/models');

// GET /auth/validate/pseudo?pseudo=xxx&exclude_id=<uuid>
router.get('/pseudo', async (req, res) => {
  try {
    const pseudo = String(req.query.pseudo || '').trim();
    const excludeId = req.query.exclude_id || null;

    // même regex que le front
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(pseudo)) {
      return res.status(200).json({ available: false, reason: 'invalid_format' });
    }

    const existing = await User.findOne({ where: { pseudo }, attributes: ['id'] });
    const available = !existing || (excludeId && existing.id === excludeId);

    return res.json({ available });
  } catch (e) {
    console.error('[validate/pseudo]', e);
    return res.status(500).json({ available: false, error: 'server_error' });
  }
});

module.exports = router;
