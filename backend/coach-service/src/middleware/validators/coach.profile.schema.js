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
  est_certifie: Joi.boolean().default(false),

  // ---- Ajouts config calendrier / politique de réservation
  fuseau_horaire: Joi.string().trim().max(64).default('Europe/Paris'),
  duree_slot_min: Joi.number().integer().min(15).max(240).default(60),
  delai_min_prise_rdv_min: Joi.number().integer().min(0).max(10080).default(60), // jusqu’à 7 jours
  delai_max_anticipation_jours: Joi.number().integer().min(1).max(365).default(30),
  acceptation_mode: Joi.string().valid('MANUEL','AUTO').default('MANUEL'),
  annulation_autorisee_heures: Joi.number().integer().min(0).max(720).default(24)
};

const create = Joi.object({
  ...base
}).required();

const update = Joi.object({
  ...Object.fromEntries(Object.entries(base).map(([k, v]) => [k, v.optional()]))
}).min(1);

module.exports = { create, update };
