'use strict';
const { DemandeCoaching, CoachProfile } = require('../db/models');

/**
 * Charge la demande (req.params.id) et attache:
 *   - req.demande
 *   - req.demandeCoachProfile (profil coach lié)
 * Renvoie 404 si non trouvé.
 */
async function loadDemande(req, res, next) {
  try {
    const id = req.params.id || req.body?.demande_id;
    if (!id) return res.status(400).json({ error: 'demande_id manquant' });

    const demande = await DemandeCoaching.findByPk(id);
    if (!demande) return res.status(404).json({ error: 'Demande introuvable' });

    const coachProfile = await CoachProfile.findByPk(demande.coach_id);
    if (!coachProfile) return res.status(400).json({ error: 'Profil coach inexistant pour cette demande' });

    req.demande = demande;
    req.demandeCoachProfile = coachProfile;
    next();
  } catch (e) {
    next(e);
  }
}

/**
 * Autorise l'accès si l'utilisateur est:
 *  - le joueur qui a créé la demande (joueur_id == req.user.sub)
 *  - le coach propriétaire (coach_profiles.user_id == req.user.sub)
 *  - un admin (role_id == 3)
 */
function ensureDemandeParticipant() {
  return (req, res, next) => {
    const u = req.user || {};
    const isAdmin = Number(u.role_id) === 3 || String(u.role).toUpperCase?.() === 'ADMIN';
    const isJoueur = req.demande?.joueur_id && req.demande.joueur_id === u.sub;
    const isCoachOwner = req.demandeCoachProfile?.user_id && req.demandeCoachProfile.user_id === u.sub;

    if (isAdmin || isJoueur || isCoachOwner) return next();
    return res.status(403).json({ error: 'Accès refusé (non participant)' });
  };
}

/**
 * Réservé au coach propriétaire (pour accepter/refuser).
 * Admin autorisé aussi.
 */
function ensureCoachOwner() {
  return (req, res, next) => {
    const u = req.user || {};
    const isAdmin = Number(u.role_id) === 3 || String(u.role).toUpperCase?.() === 'ADMIN';
    const isCoachOwner = req.demandeCoachProfile?.user_id && req.demandeCoachProfile.user_id === u.sub;

    if (isAdmin || isCoachOwner) return next();
    return res.status(403).json({ error: 'Accès réservé au coach' });
  };
}

module.exports = { loadDemande, ensureDemandeParticipant, ensureCoachOwner };
