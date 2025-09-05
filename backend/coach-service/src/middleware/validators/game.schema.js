'use strict';
const Joi = require('joi');

const create = Joi.object({
  game: Joi.string().trim().min(2).max(50).required()
});

const bulk = Joi.object({
  games: Joi.array().items(Joi.string().trim().min(2).max(50)).min(1).required()
});

module.exports = { create, bulk };
