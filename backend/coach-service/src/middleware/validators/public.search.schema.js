'use strict';
const Joi = require('joi');

const schema = Joi.object({
  game: Joi.string().trim().min(2).max(50),
  specialty: Joi.string().trim().min(2).max(50).lowercase(),
  priceField: Joi.string().valid('heure','replay','groupe').default('heure'),
  priceMin: Joi.number().integer().min(0),
  priceMax: Joi.number().integer().min(0),
  sort: Joi.string().valid('price_asc','price_desc','date_desc','date_asc').default('date_desc')
}).with('priceMax', 'priceField').with('priceMin', 'priceField')
  .custom((v, helpers) => {
    if (v.priceMin != null && v.priceMax != null && v.priceMin > v.priceMax) {
      return helpers.error('any.invalid', { message: 'priceMin doit être <= priceMax' });
    }
    return v;
  });

module.exports = { schema };
