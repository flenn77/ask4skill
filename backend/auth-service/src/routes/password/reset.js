const express     = require('express');
const bcrypt      = require('bcrypt');
const { PasswordReset, User, TokenRevocation } = require('../../db/models');

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
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token et nouveau mot de passe requis' });
    }

    // Validation complexité
    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    ) {
      return res.status(400).json({
        error: 'Mot de passe trop faible (min 8 car., 1 maj., 1 min., 1 chiffre, 1 spécial)'
      });
    }

    const entry = await PasswordReset.findOne({ where: { token } });
    if (!entry || new Date() > entry.expires_at) {
      return res.status(400).json({ error: 'Token invalide ou expiré' });
    }

    const user = await User.findByPk(entry.user_id);
    if (!user) {
      // Nettoyage défensif si l’utilisateur n’existe plus
      await PasswordReset.destroy({ where: { user_id: entry.user_id } });
      return res.status(400).json({ error: 'Token invalide' });
    }

    // Hash + MAJ dans la bonne colonne
    const hash = await bcrypt.hash(newPassword, 10);
    user.mot_de_passe = hash;
    await user.save();

    // Invalider tous les tokens JWT existants de ce user (sécurité)
    if (TokenRevocation?.upsert) {
      await TokenRevocation.upsert({ user_id: user.id, invalid_before: new Date() });
    }

    // Supprimer tous les resets restants pour ce user
    await PasswordReset.destroy({ where: { user_id: user.id } });

    return res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (err) {
    console.error('[reset]', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
