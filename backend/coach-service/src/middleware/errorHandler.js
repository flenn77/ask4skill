'use strict';

/**
 * Gestionnaire d’erreurs global.
 * À monter après les routes: app.use(errorHandler)
 */
function errorHandler(err, req, res, _next) {
  console.error('[error]', err);

  // Erreurs de validation customisées
  if (err && err.isJoi) {
    return res.status(400).json({
      error: 'ValidationError',
      details: err.details?.map(d => d.message) || [err.message]
    });
  }

  // Sequelize (ex: contraintes)
  if (err?.name === 'SequelizeUniqueConstraintError') {
    const fld = err?.errors?.[0]?.path || 'unique_field';
    return res.status(409).json({ error: `Contrainte d’unicité violée (${fld})` });
  }

  if (err?.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ error: 'Référence inexistante (FK)' });
  }

  // par défaut
  res.status(500).json({ error: 'Erreur serveur' });
}

module.exports = errorHandler;
