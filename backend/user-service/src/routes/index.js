// src/routes/index.js
'use strict';

const express   = require('express');
const userRoute = require('./user/user');
const listRoute = require('./list/list');

const router = express.Router();

// 1) on monte userRoute AVANT listRoute
router.use('/:id', userRoute);

// 2) ensuite listRoute
router.use('/', listRoute);

module.exports = router;
