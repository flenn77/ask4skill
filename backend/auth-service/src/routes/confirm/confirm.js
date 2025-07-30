const express = require('express');
const { User, EmailConfirmation } = require('../../db/models');

const router = express.Router();

router.get('/', async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: 'Token manquant' });
  }

  // On cherche le token
  const confirmation = await EmailConfirmation.findOne({ where: { token } });
  if (!confirmation || new Date() > confirmation.expires_at) {
    return res.status(400).json({ error: 'Token invalide ou expiré' });
  }

  // On marque l’utilisateur comme vérifié
  const user = await User.findByPk(confirmation.user_id);
  user.is_email_verified = true;
  await user.save();

  // On peut supprimer la ligne de confirmation
  await confirmation.destroy();

  res.json({ message: 'E-mail confirmé avec succès' });
});

module.exports = router;
