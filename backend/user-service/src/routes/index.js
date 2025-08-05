'use strict';

const express   = require('express');
const meRoute   = require('./me/me');
const userRoute = require('./user/user');
const listRoute = require('./list/list');

const router = express.Router();

// 1) /users/me
router.use('/me', meRoute);

// 2) /users/:id
router.use('/:id', userRoute);

// 3) /users
router.use('/', listRoute);

module.exports = router;
