'use strict';

function ensureAdmin(req, res, next) {
  const role = req.user?.role;
  if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
}

module.exports = { ensureAdmin };
