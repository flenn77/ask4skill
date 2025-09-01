'use strict';
const express = require('express');
const { ensureAuth } = require('../../middleware/auth');
const { ensureCoach } = require('../../middleware/roles');
const { CoachProfile } = require('../../db/models');

const router = express.Router();
router.get('/', ensureAuth, ensureCoach, async (req, res) => {
  const p = await CoachProfile.findOne({ where: { user_id: req.user.sub } });
  res.json(p || null);
});
router.post('/', ensureAuth, ensureCoach, async (req, res) => {
  const data = req.body;
  let p = await CoachProfile.findOne({ where: { user_id: req.user.sub } });
  if (!p) p = await CoachProfile.create({ user_id: req.user.sub, ...data });
  else await p.update(data);
  res.status(201).json(p);
});
module.exports = router;
