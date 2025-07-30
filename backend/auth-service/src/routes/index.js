const express = require('express');
const registerRoute = require('./register/register');
const loginRoute = require('./login/login');
const meRoute = require('./me/me');
const confirmRoute = require('./confirm/confirm');

const router = express.Router();

router.use('/register', registerRoute);
router.use('/login', loginRoute);
router.use('/me', meRoute);
router.use('/confirm', confirmRoute);

module.exports = router;
