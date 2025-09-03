// src/routes/me/me.js
const express = require('express');
const { User } = require('../../db/models');
const { ensureAuth } = require('../../middleware/auth');

const router = express.Router();

/**
 * GET /auth/me
 */
router.get('/', ensureAuth, async (req, res) => {
  const u = await User.findByPk(req.user.sub, {
    attributes: { exclude: ['password'] }
  });
  if (!u) return res.status(404).end();
  res.json(u);
});

/**
 * PATCH /auth/me
 * Met à jour le profil (avec contrôle d’unicité sur pseudo & téléphone)
 */
router.patch('/', ensureAuth, async (req, res) => {
  const allowed = [
    'prenom',
    'nom',
    'pseudo',
    'telephone',
    'date_naissance',
    'sexe',
  ];

  const payload = {};
  for (const key of allowed) {
    if (key in req.body) payload[key] = req.body[key];
  }

  // Validations simples
  if (payload.sexe && !['H', 'F', 'Autre', 'Non spécifié'].includes(payload.sexe)) {
    return res.status(400).json({ error: 'Valeur de sexe invalide' });
  }
  if (payload.date_naissance) {
    const d = new Date(payload.date_naissance);
    if (isNaN(d)) return res.status(400).json({ error: 'Date de naissance invalide' });
  }
  if (payload.telephone && !/^\+?\d{6,20}$/.test(payload.telephone)) {
    return res.status(400).json({ error: 'Téléphone invalide' });
  }

  try {
    const user = await User.findByPk(req.user.sub);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    // 🔒 Unicité PSEUDO (si changé)
    if (
      typeof payload.pseudo === 'string' &&
      payload.pseudo.trim() &&
      payload.pseudo !== user.pseudo
    ) {
      const existsPseudo = await User.findOne({
        where: { pseudo: payload.pseudo },
        attributes: ['id'],
      });
      if (existsPseudo && existsPseudo.id !== user.id) {
        return res.status(409).json({ error: 'Ce pseudo est déjà pris.' });
      }
    }

    // 🔒 Unicité TÉLÉPHONE (si fourni + changé)
    if (
      typeof payload.telephone === 'string' &&
      payload.telephone.trim() &&
      payload.telephone !== user.telephone
    ) {
      const existsTel = await User.findOne({
        where: { telephone: payload.telephone },
        attributes: ['id'],
      });
      if (existsTel && existsTel.id !== user.id) {
        return res.status(409).json({ error: 'Ce numéro de téléphone est déjà utilisé.' });
      }
    }

    await user.update(payload);

    const result = user.toJSON();
    delete result.password;
    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
