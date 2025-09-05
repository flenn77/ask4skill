'use strict';
const Joi = require('joi');

const currentYear = new Date().getFullYear();

const create = Joi.object({
  titre: Joi.string().trim().max(255).required(),
  description: Joi.string().trim().allow('', null),
  annee: Joi.number().integer().min(1950).max(currentYear + 1).allow(null)
});

const update = Joi.object({
  titre: Joi.string().trim().max(255),
  description: Joi.string().trim().allow(''),
  annee: Joi.number().integer().min(1950).max(currentYear + 1).allow(null)
}).min(1);

module.exports = { create, update };
