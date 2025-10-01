'use strict';
const express = require('express');

const coachProfile = require('./coach/profile');
const coachPalmares = require('./coach/palmares');
const coachGames = require('./coach/games');
const coachSpecialites = require('./coach/specialites');

const demandes = require('./demandes');              // <- NEW (joueur)
const coachDemandes = require('./coach/demandes');   // <- NEW (coach)
const coachOffers = require('./coach/offers');

// Anciennes routes de dispos/indispos supprimées
// const coachIndispos = require('./coach/indisponibilites');
// const coachDisponibilites = require('./coach/disponibilites');

// Ancienne API publique d’availability supprimée
// const publicAvailability = require('./public/availability');

const publicCoach = require('./public/coach');
const health = require('./health');

const router = express.Router();

// Routes privées (coach)
router.use('/coach/profile', coachProfile);
router.use('/coach/palmares', coachPalmares);
router.use('/coach/games', coachGames);
router.use('/coach/specialites', coachSpecialites);
router.use('/coach/demandes', coachDemandes); // NEW
router.use('/coach/offers', coachOffers);

// Routes “joueur”
router.use('/demandes', demandes);           // NEW

// Routes publiques
router.use('/coachs', publicCoach);
// router.use('/availability', publicAvailability); // removed

// Health
router.use('/health', health);

// Racine
router.get('/', (_req, res) => res.send('coach-service API OK'));

module.exports = router;
