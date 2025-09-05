'use strict';

function ensureCoach(req, res, next) {
  const roleId = req.user?.role_id;
  // Seeds auth-service: 1=JOUEUR, 2=COACH, 3=ADMIN
  const ALLOWED = [2, 3]; // autorise COACH et ADMIN
  if (ALLOWED.includes(roleId)) return next();
  return res.status(403).json({ error: 'Accès réservé aux coachs' });
}

module.exports = { ensureCoach };
