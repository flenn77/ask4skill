// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User, TokenRevocation, Ban } = require('../db/models');

async function ensureAuth(req, res, next) {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT non configuré (JWT_SECRET manquant)' });
    }

    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant ou invalide' });
    }

    const token = h.slice(7);
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Token invalide' });
    }

    const user = await User.findByPk(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }

    const rev = await TokenRevocation.findOne({ where: { user_id: user.id } });
    if (rev) {
      const invalidBefore = Math.floor(new Date(rev.invalid_before).getTime() / 1000);
      if (payload.iat < invalidBefore) {
        return res.status(401).json({ error: 'Token expiré' });
      }
    }

    // bannis actifs bloqués partout

    const ban = await Ban.findOne({ where: { user_id: user.id, actif: true } });
    if (ban) {
      const now = new Date();
      if (!ban.date_expiration || new Date(ban.date_expiration) > now) {
        return res.status(403).json({ error: 'Compte banni' });
      }
    }

    req.user = {
      ...payload,
      id: user.id,
      role_id: user.role_id,
      is_email_verified: user.is_email_verified,
    };

    return next();
  } catch (err) {
    console.error('[ensureAuth]', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { ensureAuth };
