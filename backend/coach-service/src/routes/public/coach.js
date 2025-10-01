'use strict';
const express = require('express');
const { Op } = require('sequelize');
const {
  CoachProfile,
  CoachGame,
  CoachSpecialite,
  CoachPalmares
  // ⚠️ retiré: Indisponibilite
} = require('../../db/models');

const router = express.Router();

/**
 * Helpers
 */
function stripPrivate(p) {
  const j = p.toJSON ? p.toJSON() : p;
  delete j.user_id;
  delete j.compte_stripe_id;
  return j;
}

const PRICE_FIELDS = {
  heure: 'prix_par_heure',
  replay: 'prix_replay',
  groupe: 'prix_session_groupe'
};

router.get('/', async (req, res) => {
  try {
    const {
      game,
      specialty,
      priceField = 'heure',
      priceMin,
      priceMax,
      sort = 'date_desc'
    } = req.query;

    let allowedCoachIds = null;

    if (game) {
      const rows = await CoachGame.findAll({
        attributes: ['coach_id'],
        where: { game: String(game).trim() }
      });
      const ids = new Set(rows.map(r => r.coach_id));
      allowedCoachIds = allowedCoachIds === null ? ids : new Set([...allowedCoachIds].filter(x => ids.has(x)));
    }

    if (specialty) {
      const rows = await CoachSpecialite.findAll({
        attributes: ['coach_id'],
        where: { specialty: String(specialty).trim() }
      });
      const ids = new Set(rows.map(r => r.coach_id));
      allowedCoachIds = allowedCoachIds === null ? ids : new Set([...allowedCoachIds].filter(x => ids.has(x)));
    }

    const where = {};
    if (allowedCoachIds && allowedCoachIds.size === 0) return res.json([]);
    if (allowedCoachIds && allowedCoachIds.size > 0) where.id = { [Op.in]: [...allowedCoachIds] };

    const pf = PRICE_FIELDS[priceField] || PRICE_FIELDS.heure;
    if (priceMin || priceMax) {
      where[pf] = {};
      if (priceMin != null) where[pf][Op.gte] = Number(priceMin);
      if (priceMax != null) where[pf][Op.lte] = Number(priceMax);
    }

    let order = [['date_creation', 'DESC']];
    if (sort === 'price_asc') order = [[pf, 'ASC']];
    else if (sort === 'price_desc') order = [[pf, 'DESC']];
    else if (sort === 'date_asc') order = [['date_creation', 'ASC']];

    const profiles = await CoachProfile.findAll({ where, order });

    const coachIds = profiles.map(p => p.id);
    const [games, specs] = await Promise.all([
      CoachGame.findAll({ where: { coach_id: { [Op.in]: coachIds } } }),
      CoachSpecialite.findAll({ where: { coach_id: { [Op.in]: coachIds } } })
    ]);

    const byCoachGames = new Map();
    const byCoachSpecs = new Map();
    for (const g of games) {
      if (!byCoachGames.has(g.coach_id)) byCoachGames.set(g.coach_id, []);
      byCoachGames.get(g.coach_id).push(g.game);
    }
    for (const s of specs) {
      if (!byCoachSpecs.has(s.coach_id)) byCoachSpecs.set(s.coach_id, []);
      byCoachSpecs.get(s.coach_id).push(s.specialty);
    }

    const out = profiles.map(p => {
      const j = stripPrivate(p);
      j.games = byCoachGames.get(p.id) || [];
      j.specialites = byCoachSpecs.get(p.id) || [];
      return j;
    });

    return res.json(out);
  } catch (e) {
    console.error('[GET /coachs]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /coachs/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const p = await CoachProfile.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: 'Coach introuvable' });

    const [games, specs, palmares] = await Promise.all([
      CoachGame.findAll({ where: { coach_id: p.id }, order: [['game','ASC']] }),
      CoachSpecialite.findAll({ where: { coach_id: p.id }, order: [['specialty','ASC']] }),
      CoachPalmares.findAll({ where: { coach_id: p.id }, order: [['id','DESC']] })
    ]);

    const j = stripPrivate(p);
    j.games = games.map(g => g.game);
    j.specialites = specs.map(s => s.specialty);
    j.palmares = palmares.map(pr => ({
      id: pr.id,
      titre: pr.titre,
      description: pr.description,
      annee: pr.annee
    }));

    return res.json(j);
  } catch (e) {
    console.error('[GET /coachs/:id]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
