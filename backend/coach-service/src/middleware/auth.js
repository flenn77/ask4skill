'use strict';
const jwt = require('jsonwebtoken');

/**
 * Vérifie le JWT (Authorization: Bearer <token>)
 * Attache l'objet décodé dans req.user
 */
function ensureAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant ou invalide' });
  }
  const token = h.slice(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    // attendu: { sub: <uuid>, role?: 'COACH'|'ADMIN'|..., ... }
    if (!req.user?.sub) {
      return res.status(401).json({ error: 'Token invalide (sub manquant)' });
    }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

module.exports = { ensureAuth };
