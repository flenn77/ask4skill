const express = require('express');
const { User } = require('../../db/models');
const { ensureAuth } = require('../../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Déconnecte l’utilisateur (révocation de tous les tokens)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Déconnecté avec succès
 *       401:
 *         description: Token manquant/invalide
 */
router.post('/', ensureAuth, async (req, res) => {
  await User.update(
    { token_invalid_before: new Date() },
    { where: { id: req.user.sub } }
  );
  res.json({ message: 'Déconnecté avec succès' });
});

module.exports = router;
