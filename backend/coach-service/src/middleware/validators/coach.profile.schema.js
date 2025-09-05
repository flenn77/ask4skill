'use strict';
const Joi = require('joi');

const money = Joi.number().min(0).max(9999999).precision(2);
const currency = Joi.string().uppercase().length(3);

const base = {
  titre: Joi.string().trim().max(255).allow('', null),
  devise: currency.default('EUR'),
  prix_par_heure: money.required(),
  prix_replay: money.required(),
  prix_session_groupe: money.required(),
  compte_stripe_id: Joi.string().trim().max(255).allow(null, ''),
  disponible_actuellement: Joi.boolean().default(false),
  disponibilite_auto: Joi.boolean().default(false),
  est_certifie: Joi.boolean().default(false)
};

const create = Joi.object({
  ...base
}).required();

const update = Joi.object({
  ...Object.fromEntries(Object.entries(base).map(([k, v]) => [k, v.optional()]))
}).min(1);

module.exports = { create, update };
