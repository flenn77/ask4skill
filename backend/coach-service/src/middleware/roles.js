'use strict';

/**
 * Seeds auth-service: 1=JOUEUR, 2=COACH, 3=ADMIN
 */

function ensureCoach(req, res, next) {
  const roleId = Number(req.user?.role_id);
  if ([2, 3].includes(roleId)) return next();
  return res.status(403).json({ error: 'Accès réservé aux coachs' });
}

function ensurePlayer(req, res, next) {
  const roleId = Number(req.user?.role_id);
  if ([1, 3].includes(roleId)) return next(); // joueur ou admin
  return res.status(403).json({ error: 'Accès réservé aux joueurs' });
}

module.exports = { ensureCoach, ensurePlayer };
