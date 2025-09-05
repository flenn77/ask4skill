'use strict';
const express = require('express');

const router = express.Router();

/**
 * GET /health
 * Healthcheck simple
 */
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'coach-service',
    uptime_sec: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
