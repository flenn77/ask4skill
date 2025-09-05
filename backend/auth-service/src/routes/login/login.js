// src/routes/login/login.js
const express   = require('express');
const bcrypt    = require('bcrypt');
const jwt       = require('jsonwebtoken');
const validator = require('validator');
const { User, Ban, LogConnexion }  = require('../../db/models');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation entrée
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe sont requis' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Format d’email invalide' });
    }

    // Recherche utilisateur
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe invalide' });
    }

    // Vérif mot de passe
    const valid = await bcrypt.compare(password, user.mot_de_passe);
    if (!valid) {
      return res.status(401).json({ error: 'Email ou mot de passe invalide' });
    }

    // Email non confirmé
    if (!user.is_email_verified) {
      return res.status(403).json({ error: 'Veuillez confirmer votre adresse e-mail' });
    }

    // Vérif ban actif
    const ban = await Ban.findOne({
      where: { user_id: user.id, actif: true },
      order: [['date_ban', 'DESC']]
    });
    if (ban) {
      const now = new Date();
      if (!ban.date_expiration || new Date(ban.date_expiration) > now) {
        return res.status(403).json({
          error: 'Compte banni',
          raison: ban.raison,
          expiration: ban.date_expiration
        });
      }
    }

    // ➕ Mise à jour connexion
    const now = new Date();
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || null;
    const userAgent = req.headers['user-agent'] || null;

    await Promise.all([
      user.update({ derniere_connexion: now }),
      LogConnexion.create({ user_id: user.id, ip, user_agent: userAgent, date: now })
    ]);

    // JWT payload = id + rôle
    const payload = { sub: user.id, role_id: user.role_id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

    // Réponse
    return res.json({
      token,
      user: {
        id: user.id,
        pseudo: user.pseudo,
        email: user.email,
        role_id: user.role_id,
        is_email_verified: user.is_email_verified
      }
    });
  } catch (err) {
    console.error('[login] error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
