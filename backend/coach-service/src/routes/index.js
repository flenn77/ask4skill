'use strict';
const express = require('express');
const profile = require('./coach/profile');
const offers = require('./coach/offers');
const avail = require('./coach/availabilities');
const publicCoachs = require('./public/coachs');

const router = express.Router();

router.use('/coach/profile', profile);
router.use('/coach/offers', offers);
router.use('/coach/availabilities', avail);
router.use('/coachs', publicCoachs);

module.exports = router;
