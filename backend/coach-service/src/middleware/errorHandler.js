'use strict';

/**
 * Gestionnaire d’erreurs global.
 * À monter après les routes: app.use(errorHandler)
 */
function errorHandler(err, req, res, _next) {
  console.error('[error]', err);

  // Erreurs Joi
  if (err && err.isJoi) {
    return res.status(400).json({
      error: 'ValidationError',
      details: err.details?.map(d => d.message) || [err.message]
    });
  }

  // Sequelize validations (ex: notNull, len, isEmail, etc.)
  if (err?.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'SequelizeValidationError',
      details: err.errors?.map(e => e.message) || [err.message]
    });
  }

  // Unicité
  if (err?.name === 'SequelizeUniqueConstraintError') {
    const fld = err?.errors?.[0]?.path || 'unique_field';
    return res.status(409).json({ error: `Contrainte d’unicité violée (${fld})` });
  }

  // FK
  if (err?.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ error: 'Référence inexistante (FK)' });
  }

  // par défaut
  res.status(500).json({ error: 'Erreur serveur' });
}

module.exports = errorHandler;
