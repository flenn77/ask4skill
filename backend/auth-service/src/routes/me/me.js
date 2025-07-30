const express = require('express');
const { User } = require('../../db/models');
const { ensureAuth } = require('../../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Récupère le profil de l’utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', ensureAuth, async (req, res) => {
  const u = await User.findByPk(req.user.sub, {
    attributes: { exclude: ['password'] }
  });
  if (!u) return res.status(404).end();
  res.json(u);
});

module.exports = router;
