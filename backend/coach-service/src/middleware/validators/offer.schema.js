'use strict';
const Joi = require('joi');

const TYPES = ['INDIVIDUEL','GROUPE','REPLAY','LIVE'];

const queryList = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  perPage: Joi.number().integer().min(1).max(100).default(20),
  actif: Joi.boolean().truthy('true').falsy('false'),
  type: Joi.string().valid(...TYPES),
  sort: Joi.string().default('created_at:desc').custom((v, helpers) => {
    const allowed = new Set(['created_at','updated_at','prix_centimes','duree_min','titre']);
    const [field, dirRaw] = String(v).split(':');
    const f = field || 'created_at';
    const d = (dirRaw || 'desc').toLowerCase();
    if (!allowed.has(f)) return helpers.error('any.invalid', { message: `sort field invalide (${f})` });
    if (!['asc','desc'].includes(d)) return helpers.error('any.invalid', { message: `sort direction invalide (${d})` });
    return `${f}:${d}`; // normalisé
  }),
  q: Joi.string().trim().min(1).max(120)
});

const create = Joi.object({
  type: Joi.string().valid(...TYPES).required(),
  titre: Joi.string().trim().max(120).required(),
  description: Joi.string().trim().allow('', null),
  duree_min: Joi.number().integer().min(0).max(240).default(60), // REPLAY sera forcé à 0 côté route
  prix_centimes: Joi.number().integer().min(0).required(),
  devise: Joi.string().uppercase().length(3).default('EUR'),
  actif: Joi.boolean().default(true)
});

const update = Joi.object({
  type: Joi.string().valid(...TYPES),
  titre: Joi.string().trim().max(120),
  description: Joi.string().trim().allow(''),
  duree_min: Joi.number().integer().min(0).max(240),
  prix_centimes: Joi.number().integer().min(0),
  devise: Joi.string().uppercase().length(3),
  actif: Joi.boolean()
}).min(1);

module.exports = { queryList, create, update };
