'use strict';

/**
 * Middleware générique pour valider body / query / params via Joi.
 * Usage: router.post('/', validate(schema.create, 'body'), handler)
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source] || {};
    const options = { abortEarly: false, stripUnknown: true, convert: true };
    const { value, error } = schema.validate(data, options);

    if (error) {
      error.isJoi = true; // pour l’errorHandler
      return next(error);
    }

    // En Express 5, req.query (et parfois req.params) ne peuvent pas être réassignés.
    if (source === 'query' || source === 'params') {
      const target = req[source];
      // Nettoie les clés existantes
      for (const k of Object.keys(target)) delete target[k];
      // Copie les valeurs validées
      for (const [k, v] of Object.entries(value)) target[k] = v;
    } else {
      // body reste réassignable
      req[source] = value;
    }

    next();
  };
}

module.exports = validate;
