// src/routes/logout/logout.js
const express = require('express');
const { TokenRevocation } = require('../../db/models');
const { ensureAuth } = require('../../middleware/auth');

const router = express.Router();

router.post('/', ensureAuth, async (req, res) => {
  try {
    await TokenRevocation.upsert({
      user_id: req.user.sub,
      invalid_before: new Date()
    });
    return res.json({ message: 'Déconnecté avec succès' });
  } catch (e) {
    console.error('[logout]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
