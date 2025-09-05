// src/routes/confirm/confirm.js
const express = require('express');
const db = require('../../db/models');
const { User, EmailConfirmation } = db;

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token manquant' });
    }

    // Récupère l’entrée de confirmation
    const confirmation = await EmailConfirmation.findOne({ where: { token } });
    if (!confirmation) {
      return res.status(400).json({ error: 'Token invalide ou expiré' });
    }

    // Vérifie l’expiration
    if (new Date() > confirmation.expires_at) {
      // on détruit ce token expiré pour éviter l’accumulation
      await confirmation.destroy().catch(() => {});
      return res.status(400).json({ error: 'Token invalide ou expiré' });
    }

    // Récupère l’utilisateur
    const user = await User.findByPk(confirmation.user_id);
    if (!user) {
      // si l’utilisateur n’existe plus, on purge quand même le token
      await confirmation.destroy().catch(() => {});
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    // Marque l’email comme vérifié (idempotent)
    if (!user.is_email_verified) {
      user.is_email_verified = true;
      await user.save();
    }

    // Nettoyage : supprime toutes les confirmations restantes pour cet utilisateur
    await EmailConfirmation.destroy({ where: { user_id: user.id } }).catch(() => {});

    return res.json({ message: 'E-mail confirmé avec succès' });
  } catch (e) {
    console.error('[confirm] error:', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
