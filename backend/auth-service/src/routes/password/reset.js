const express     = require('express');
const bcrypt      = require('bcrypt');
const { PasswordReset, User } = require('../../db/models');

const router = express.Router();

/**
 * @swagger
 * /auth/reset:
 *   post:
 *     summary: Réinitialiser le mot de passe avec token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe mis à jour
 *       400:
 *         description: Token invalide/expiré ou mot de passe non valide
 */
router.post('/', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token et nouveau mot de passe requis' });
  }

  const entry = await PasswordReset.findOne({ where: { token } });
  if (!entry || new Date() > entry.expires_at) {
    return res.status(400).json({ error: 'Token invalide ou expiré' });
  }

  if (newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
    return res.status(400).json({
      error: 'Mot de passe trop faible (min 8 car., 1 maj., 1 min., 1 chiffre, 1 spécial)'
    });
  }

  const user = await User.findByPk(entry.user_id);
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await PasswordReset.destroy({ where: { user_id: user.id } });

  res.json({ message: 'Mot de passe réinitialisé avec succès' });
});

module.exports = router;
