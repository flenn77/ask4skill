'use strict';
const Joi = require('joi');

const TYPE = ['INDIVIDUEL','GROUPE','REPLAY','LIVE'];

const create = Joi.object({
  coach_id: Joi.string().uuid().required(),          // cible obligatoire
  type: Joi.string().valid(...TYPE).required(),
  // REPLAY: pas de date/durée. Les autres: date_debut + duree_min requis.
  date_debut: Joi.alternatives().conditional('type', {
    is: 'REPLAY',
    then: Joi.any().strip(),
    otherwise: Joi.date().iso().required()
  }),
  duree_min: Joi.alternatives().conditional('type', {
    is: 'REPLAY',
    then: Joi.any().strip(),
    otherwise: Joi.number().integer().min(15).max(240).required()
  }),
  message_joueur: Joi.string().trim().max(1000).allow('', null)
}).required();

const accept = Joi.object({
  // Optionnel : on peut déjà rattacher une conversation externe (ex: chat service)
  conversation_id: Joi.string().trim().max(64).allow('', null)
}).required();

const refuse = Joi.object({
  raison_refus: Joi.string().trim().min(3).max(1000).required()
}).required();

const archive = Joi.object({
  // champ libre si tu veux logger une note, sinon on ne passe rien
  commentaire: Joi.string().trim().max(500).allow('', null)
}).optional();

module.exports = { create, accept, refuse, archive };
