'use strict';
const express = require('express');
const { Op } = require('sequelize');
const { CoachProfile, Disponibilite } = require('../../db/models');

const router = express.Router();

/**
 * GET /availability/:id/disponibilites
 * Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD&actif=true|false
 */
router.get('/:id/disponibilites', async (req, res) => {
  try {
    const coach = await CoachProfile.findByPk(req.params.id);
    if (!coach) return res.status(404).json({ error: 'Coach introuvable' });

    const { from, to, actif } = req.query;
    const where = { coach_id: coach.id };

    if (actif === 'true') where.actif = true;
    else if (actif === 'false') where.actif = false;

    if (from || to) {
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

    const items = await Disponibilite.findAll({
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
    console.error('[GET /availability/:id/disponibilites]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
