'use strict';
const express = require('express');
const { ensureAuth } = require('../../middleware/auth');
const { ensureCoach } = require('../../middleware/roles');
const { CoachProfile } = require('../../db/models');

const router = express.Router();

/**
 * GET /coach/profile
 * Retourne le profil coach de l'utilisateur courant
 */
router.get('/', ensureAuth, ensureCoach, async (req, res) => {
  try {
    const profile = await CoachProfile.findOne({ where: { user_id: req.user.sub } });
    if (!profile) return res.status(404).json({ error: 'Profil coach introuvable' });
    return res.json(profile);
  } catch (e) {
    console.error('[GET /coach/profile]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /coach/profile
 * Crée le profil coach (1 seul par user). 409 si déjà existant.
 * Champs attendus (MCD Coach_profil):
 * - titre, devise (ISO 4217), prix_par_heure, prix_replay, prix_session_groupe
 * - compte_stripe_id?, disponible_actuellement?, disponibilite_auto?, est_certifie?
 */
router.post('/', ensureAuth, ensureCoach, async (req, res) => {
  try {
    const exists = await CoachProfile.findOne({ where: { user_id: req.user.sub } });
    if (exists) return res.status(409).json({ error: 'Profil déjà créé' });

    const {
      titre,
      devise = 'EUR',
      prix_par_heure,
      prix_replay,
      prix_session_groupe,
      compte_stripe_id,
      disponible_actuellement = false,
      disponibilite_auto = false,
      est_certifie = false
    } = req.body || {};

    // validations simples
    if (!titre || String(titre).trim().length < 3) {
      return res.status(400).json({ error: 'titre requis (min 3 caractères)' });
    }
    if (!/^[A-Z]{3}$/.test(String(devise))) {
      return res.status(400).json({ error: 'devise invalide (ISO 4217, ex: EUR)' });
    }
    const numericOk = (v) => v == null || (!Number.isNaN(Number(v)) && Number(v) >= 0);
    if (!numericOk(prix_par_heure) || !numericOk(prix_replay) || !numericOk(prix_session_groupe)) {
      return res.status(400).json({ error: 'prix_par_heure / prix_replay / prix_session_groupe doivent être des nombres >= 0' });
    }

    const profile = await CoachProfile.create({
      user_id: req.user.sub,
      titre: String(titre).trim(),
      devise,
      prix_par_heure: prix_par_heure ?? 0,
      prix_replay: prix_replay ?? 0,
      prix_session_groupe: prix_session_groupe ?? 0,
      compte_stripe_id: compte_stripe_id || null,
      disponible_actuellement: !!disponible_actuellement,
      disponibilite_auto: !!disponibilite_auto,
      est_certifie: !!est_certifie
    });

    return res.status(201).json(profile);
  } catch (e) {
    console.error('[POST /coach/profile]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PATCH /coach/profile
 * Met à jour les champs modifiables du profil coach.
 */
router.patch('/', ensureAuth, ensureCoach, async (req, res) => {
  try {
    const profile = await CoachProfile.findOne({ where: { user_id: req.user.sub } });
    if (!profile) return res.status(404).json({ error: 'Profil coach introuvable' });

    const allowed = [
      'titre', 'devise',
      'prix_par_heure', 'prix_replay', 'prix_session_groupe',
      'compte_stripe_id',
      'disponible_actuellement', 'disponibilite_auto', 'est_certifie'
    ];
    const data = {};
    for (const k of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) data[k] = req.body[k];
    }

    if (data.devise && !/^[A-Z]{3}$/.test(String(data.devise))) {
      return res.status(400).json({ error: 'devise invalide (ISO 4217, ex: EUR)' });
    }
    const numFields = ['prix_par_heure','prix_replay','prix_session_groupe'];
    for (const f of numFields) {
      if (data[f] != null && (Number.isNaN(Number(data[f])) || Number(data[f]) < 0)) {
        return res.status(400).json({ error: `${f} doit être un nombre >= 0` });
      }
    }

    await profile.update(data);
    return res.json(profile);
  } catch (e) {
    console.error('[PATCH /coach/profile]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
