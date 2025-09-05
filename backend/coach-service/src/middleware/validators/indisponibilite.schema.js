'use strict';
const Joi = require('joi');

const typeEnum = Joi.string().valid('repetitif', 'unique').required();
const jourEnum = Joi.string().valid(
  'lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'
);

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

const base = {
  type: typeEnum,
  jour: jourEnum.when('type', { is: 'repetitif', then: Joi.required(), otherwise: Joi.forbidden() }),
  date_unique: Joi.date().iso().when('type', { is: 'unique', then: Joi.required(), otherwise: Joi.forbidden() }),
  heure_debut: Joi.string().pattern(timeRegex).required().messages({ 'string.pattern.base': 'heure_debut format HH:mm:ss' }),
  heure_fin: Joi.string().pattern(timeRegex).required().messages({ 'string.pattern.base': 'heure_fin format HH:mm:ss' }),
  slot_max_par_heure: Joi.number().integer().min(1).max(999).default(1),
  actif: Joi.boolean().default(true)
};

const create = Joi.object(base).custom((val, helpers) => {
  if (val.heure_debut >= val.heure_fin) {
    return helpers.error('any.invalid', { message: 'heure_debut doit être < heure_fin' });
  }
  return val;
});

const update = Joi.object({
  type: Joi.forbidden(), // non modifiable après création
  jour: jourEnum,
  date_unique: Joi.date().iso(),
  heure_debut: Joi.string().pattern(timeRegex),
  heure_fin: Joi.string().pattern(timeRegex),
  slot_max_par_heure: Joi.number().integer().min(1).max(999),
  actif: Joi.boolean()
}).custom((val, helpers) => {
  if (val.heure_debut && val.heure_fin && val.heure_debut >= val.heure_fin) {
    return helpers.error('any.invalid', { message: 'heure_debut doit être < heure_fin' });
  }
  return val;
}).min(1);

module.exports = { create, update };
    