// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../db/models');

async function ensureAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant ou invalide' });
  }
  const token = h.slice(7);
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }

  const user = await User.findByPk(payload.sub);
  if (!user) {
    return res.status(401).json({ error: 'Utilisateur introuvable' });
  }

  if (user.token_invalid_before) {
    const invalidBefore = Math.floor(new Date(user.token_invalid_before).getTime() / 1000);
    if (payload.iat < invalidBefore) {
      return res.status(401).json({ error: 'Token expiré' });
    }
  }

  req.user = payload;
  next();
}

module.exports = { ensureAuth };
