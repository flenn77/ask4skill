'use strict';
const express = require('express');

const coachProfile = require('./coach/profile');
const coachPalmares = require('./coach/palmares');
const coachGames = require('./coach/games');
const coachSpecialites = require('./coach/specialites');
const coachIndispos = require('./coach/indisponibilites');

const publicCoach = require('./public/coach');
const health = require('./health');

const router = express.Router();

// Routes privées (coach)
router.use('/coach/profile', coachProfile);
router.use('/coach/palmares', coachPalmares);
router.use('/coach/games', coachGames);
router.use('/coach/specialites', coachSpecialites);
router.use('/coach/indisponibilites', coachIndispos);

// Routes publiques
router.use('/coachs', publicCoach);

// Health
router.use('/health', health);

// Racine
router.get('/', (_req, res) => res.send('coach-service API OK'));

module.exports = router;
