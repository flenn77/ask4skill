'use strict';

const express = require('express');
const meRoute = require('./me/me');
const pwdRoute = require('./me/password');
const userRoute = require('./user/user');
const listRoute = require('./list/list');
const deactivateMe = require('./me/deactivate');

const router = express.Router();

// 1) /users/me
router.use('/me', meRoute);
router.use('/me', deactivateMe);

// 1b) /users/me/password
router.use('/me/password', pwdRoute);

// 2) /users/:id
router.use('/:id', userRoute);

// 3) /users
router.use('/', listRoute);

module.exports = router;
