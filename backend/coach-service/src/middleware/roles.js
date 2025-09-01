'use strict';

function ensureCoach(req, res, next) {
  if (req.user?.role !== 'COACH' && req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPERADMIN') {
    return res.status(403).json({ error: 'Réservé aux coachs' });
  }
  next();
}

module.exports = { ensureCoach };
