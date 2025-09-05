'use strict';
const express = require('express');
const { ensureAuth } = require('../../middleware/auth');
const { ensureCoach } = require('../../middleware/roles');
const { CoachProfile, CoachPalmares } = require('../../db/models');

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
 * GET /coach/palmares
 * Liste le palmarès du coach courant
 */
router.get('/', ensureAuth, ensureCoach, async (req, res) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;
    const items = await CoachPalmares.findAll({
      where: { coach_id: coachId },
      order: [['id', 'DESC']]
    });
    return res.json(items);
  } catch (e) {
    console.error('[GET /coach/palmares]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /coach/palmares
 * Crée une entrée de palmarès
 * Champs: titre (required), description?, annee?
 */
router.post('/', ensureAuth, ensureCoach, async (req, res) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;

    const { titre, description, annee } = req.body || {};
    if (!titre || String(titre).trim().length < 3) {
      return res.status(400).json({ error: 'titre requis (min 3 caractères)' });
    }
    if (annee != null) {
      const n = Number(annee);
      if (Number.isNaN(n) || n < 1900 || n > 2100) {
        return res.status(400).json({ error: 'annee invalide (1900-2100)' });
      }
    }

    const item = await CoachPalmares.create({
      coach_id: coachId,
      titre: String(titre).trim(),
      description: description ?? null,
      annee: annee ?? null
    });

    return res.status(201).json(item);
  } catch (e) {
    console.error('[POST /coach/palmares]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PATCH /coach/palmares/:id
 */
router.patch('/:id', ensureAuth, ensureCoach, async (req, res) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;

    const item = await CoachPalmares.findByPk(req.params.id);
    if (!item || item.coach_id !== coachId) {
      return res.status(404).json({ error: 'Entrée de palmarès introuvable' });
    }

    const allowed = ['titre', 'description', 'annee'];
    const data = {};
    for (const k of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) data[k] = req.body[k];
    }
    if (data.titre && String(data.titre).trim().length < 3) {
      return res.status(400).json({ error: 'titre trop court' });
    }
    if (data.annee != null) {
      const n = Number(data.annee);
      if (Number.isNaN(n) || n < 1900 || n > 2100) {
        return res.status(400).json({ error: 'annee invalide (1900-2100)' });
      }
    }

    await item.update(data);
    return res.json(item);
  } catch (e) {
    console.error('[PATCH /coach/palmares/:id]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /coach/palmares/:id
 */
router.delete('/:id', ensureAuth, ensureCoach, async (req, res) => {
  try {
    const coachId = await getCoachIdOr404(req, res);
    if (!coachId) return;

    const item = await CoachPalmares.findByPk(req.params.id);
    if (!item || item.coach_id !== coachId) {
      return res.status(404).json({ error: 'Entrée de palmarès introuvable' });
    }
    await item.destroy();
    return res.json({ message: 'Supprimé' });
  } catch (e) {
    console.error('[DELETE /coach/palmares/:id]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
