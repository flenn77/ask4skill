// src/routes/index.js
'use strict';

const express = require('express');
const userRoute = require('./user/user');
const listRoute = require('./list/list');
const meRoute = require('./me/me');

const router = express.Router();




// 1) on monte /users/me AVANT /users/:id
router.use('/me', meRoute);

// 2) ensuite /users/:id
router.use('/:id', userRoute);

// 3) enfin liste paginée /users
router.use('/', listRoute);

module.exports = router;
