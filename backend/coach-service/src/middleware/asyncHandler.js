'use strict';

/**
 * Wrapper pour routes async afin d'éviter les try/catch répétitifs.
 * Utilisation: router.get('/', asyncHandler(async (req, res) => { ... }));
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
