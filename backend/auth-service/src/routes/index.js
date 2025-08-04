const express = require('express');
const registerRoute = require('./register/register');
const loginRoute = require('./login/login');
const meRoute = require('./me/me');
const confirmRoute = require('./confirm/confirm');
const logoutRoute   = require('./logout/logout');
const forgotRoute   = require('./password/forgot');
const resetRoute    = require('./password/reset');

const router = express.Router();

router.use('/register', registerRoute);
router.use('/login', loginRoute);
router.use('/me', meRoute);
router.use('/confirm', confirmRoute);
router.use('/logout', logoutRoute);
router.use('/forgot',   forgotRoute);
router.use('/reset',    resetRoute);

module.exports = router;
