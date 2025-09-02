'use strict';

const express = require('express');
const meRoute = require('./me/me');
const pwdRoute = require('./me/password');
const userRoute = require('./user/user');
const listRoute = require('./list/list');
const deactivateMe = require('./me/deactivate');

const router = express.Router();

router.use('/me', meRoute);
router.use('/me', deactivateMe);

router.use('/me/password', pwdRoute);

router.use('/:id', userRoute);

router.use('/', listRoute);

module.exports = router;
