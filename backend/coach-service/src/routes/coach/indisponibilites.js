'use strict';
const express = require('express');
const { ensureAuth } = require('../../middleware/auth');
const { ensureCoach } = require('../../middleware/roles');
const { CoachProfile, Indisponibilite } = require('../../db/models');
const { Op } = require('sequelize');

const router = express.Router();

async function getCoachIdOr404(req, res) {
  const profile = await CoachProfile.findOne({ where: { user_id: req.user.sub } });
  if (!profile) {
    res.status(404).json({ error: 'Profil coach introuvable' });
    return null;
  }
  return profile.id;
}

/**
 * GET /coach/indisponibilites
 * Query support: ?from=YYYY-MM-DD&to=YYYY-MM-DD&actif=true|false
 */
router.get('/', ensureAuth, ensureCoach, async (req, res) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;

    const { from, to, actif } = req.query;
    const where = { coach_id: coachId };

    if (actif === 'true') where.actif = true;
    else if (actif === 'false') where.actif = false;

    if (from || to) {
      // pour type=unique on filtre via date_unique
      // pour type=repetitif on ne filtre pas par date (puisque récurrent), on renvoie tout ce qui est actif
      where[Op.or] = [
        { type: 'repetitif' },
        {
          type: 'unique',
          ...(from || to
            ? {
                date_unique: {
                  ...(from ? { [Op.gte]: from } : {}),
                  ...(to ? { [Op.lte]: to } : {})
                }
              }
            : {})
        }
      ];
    }

    const items = await Indisponibilite.findAll({
      where,
      order: [
        ['type', 'ASC'],
        ['date_unique', 'ASC'],
        ['jour', 'ASC'],
        ['heure_debut', 'ASC']
      ]
    });

    return res.json(items);
  } catch (e) {
    console.error('[GET /coach/indisponibilites]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /coach/indisponibilites
 * Body:
 *  - type: 'repetitif' | 'unique' (requis)
 *  - jour: enum (lundi..dimanche) requis si repetitif
 *  - date_unique: YYYY-MM-DD requis si unique
 *  - heure_debut: HH:mm:ss
 *  - heure_fin: HH:mm:ss
 *  - slot_max_par_heure: int >= 1 (par défaut 1)
 *  - actif: boolean (par défaut true)
 */
router.post('/', ensureAuth, ensureCoach, async (req, res) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;

    const {
      type,
      jour,
      date_unique,
      heure_debut,
      heure_fin,
      slot_max_par_heure = 1,
      actif = true
    } = req.body || {};

    if (type !== 'repetitif' && type !== 'unique') {
      return res.status(400).json({ error: "type doit être 'repetitif' ou 'unique'" });
    }
    const timeRe = /^\d{2}:\d{2}:\d{2}$/;
    if (!timeRe.test(String(heure_debut || '')) || !timeRe.test(String(heure_fin || ''))) {
      return res.status(400).json({ error: 'heure_debut / heure_fin doivent être au format HH:mm:ss' });
    }
    if (heure_fin <= heure_debut) {
      return res.status(400).json({ error: "heure_fin doit être après heure_debut" });
    }
    const validDays = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
    if (type === 'repetitif') {
      if (!validDays.includes(String(jour || '').toLowerCase())) {
        return res.status(400).json({ error: 'jour invalide pour type=repetitif' });
      }
    } else {
      // unique
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date_unique || ''))) {
        return res.status(400).json({ error: 'date_unique invalide (YYYY-MM-DD) pour type=unique' });
      }
    }
    const slots = Number(slot_max_par_heure);
    if (Number.isNaN(slots) || slots < 1) {
      return res.status(400).json({ error: 'slot_max_par_heure doit être >= 1' });
    }

    const item = await Indisponibilite.create({
      coach_id: coachId,
      type,
      jour: type === 'repetitif' ? String(jour).toLowerCase() : null,
      date_unique: type === 'unique' ? date_unique : null,
      heure_debut,
      heure_fin,
      slot_max_par_heure: slots,
      actif: !!actif
    });

    return res.status(201).json(item);
  } catch (e) {
    console.error('[POST /coach/indisponibilites]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PATCH /coach/indisponibilites/:id
 * Met à jour un créneau d'indisponibilité
 */
router.patch('/:id', ensureAuth, ensureCoach, async (req, res) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;

    const item = await Indisponibilite.findByPk(req.params.id);
    if (!item || item.coach_id !== coachId) {
      return res.status(404).json({ error: 'Indisponibilité introuvable' });
    }

    const allowed = [
      'type','jour','date_unique','heure_debut','heure_fin','slot_max_par_heure','actif'
    ];
    const data = {};
    for (const k of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) data[k] = req.body[k];
    }

    // re-valide si des champs critiques changent
    if (data.type && !['repetitif','unique'].includes(data.type)) {
      return res.status(400).json({ error: "type doit être 'repetitif' ou 'unique'" });
    }
    if (data.heure_debut || data.heure_fin) {
      const timeRe = /^\d{2}:\d{2}:\d{2}$/;
      if (data.heure_debut && !timeRe.test(String(data.heure_debut)))
        return res.status(400).json({ error: 'heure_debut invalide' });
      if (data.heure_fin && !timeRe.test(String(data.heure_fin)))
        return res.status(400).json({ error: 'heure_fin invalide' });

      const start = data.heure_debut ?? item.heure_debut;
      const end = data.heure_fin ?? item.heure_fin;
      if (end <= start) return res.status(400).json({ error: 'heure_fin doit être après heure_debut' });
    }
    if (data.type === 'repetitif' || (!data.type && item.type === 'repetitif')) {
      const v = data.jour ?? item.jour;
      const validDays = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
      if (!validDays.includes(String(v || '').toLowerCase()))
        return res.status(400).json({ error: 'jour invalide pour type=repetitif' });
    }
    if (data.type === 'unique' || (!data.type && item.type === 'unique')) {
      const v = data.date_unique ?? item.date_unique;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')))
        return res.status(400).json({ error: 'date_unique invalide (YYYY-MM-DD) pour type=unique' });
    }
    if (data.slot_max_par_heure != null) {
      const n = Number(data.slot_max_par_heure);
      if (Number.isNaN(n) || n < 1) return res.status(400).json({ error: 'slot_max_par_heure doit être >= 1' });
    }

    await item.update(data);
    return res.json(item);
  } catch (e) {
    console.error('[PATCH /coach/indisponibilites/:id]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /coach/indisponibilites/:id
 */
router.delete('/:id', ensureAuth, ensureCoach, async (req, res) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;

    const item = await Indisponibilite.findByPk(req.params.id);
    if (!item || item.coach_id !== coachId) {
      return res.status(404).json({ error: 'Indisponibilité introuvable' });
    }
    await item.destroy();
    return res.json({ message: 'Supprimé' });
  } catch (e) {
    console.error('[DELETE /coach/indisponibilites/:id]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
