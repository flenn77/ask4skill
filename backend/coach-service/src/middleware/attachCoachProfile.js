'use strict';
const { CoachProfile } = require('../db/models');

/**
 * Charge (si existe) le profil coach de l’utilisateur courant
 * - attachCoachProfile(): attache req.coachProfile ou null
 * - requireCoachProfile(): 404 si non trouvé
 */

async function _fetchProfile(userId) {
  return await CoachProfile.findOne({ where: { user_id: userId } });
}

function attachCoachProfile() {
  return async (req, res, next) => {
    try {
      req.coachProfile = await _fetchProfile(req.user.sub);
      next();
    } catch (e) {
      next(e);
    }
  };
}

function requireCoachProfile() {
  return async (req, res, next) => {
    try {
      const p = await _fetchProfile(req.user.sub);
      if (!p) return res.status(404).json({ error: 'Profil coach introuvable' });
      req.coachProfile = p;
      next();
    } catch (e) {
      next(e);
    }
  };
}

module.exports = { attachCoachProfile, requireCoachProfile };
