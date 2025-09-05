'use strict';
const Joi = require('joi');

// Vous pouvez restreindre à un set si vous le souhaitez :
// const allowed = ['individuel','replay','groupe'];
// .valid(...allowed)
const create = Joi.object({
  specialty: Joi.string().trim().min(2).max(50).lowercase().required()
});

const bulk = Joi.object({
  specialites: Joi.array().items(
    Joi.string().trim().min(2).max(50).lowercase()
  ).min(1).required()
});

module.exports = { create, bulk };
