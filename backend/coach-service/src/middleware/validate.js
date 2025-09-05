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
    req[source] = value; // on remplace par la version “propre”
    next();
  };
}

module.exports = validate;
