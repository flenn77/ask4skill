// src/routes/me/me.js
'use strict';

const express = require('express');
const validator = require('validator');
const { User, Sex, Level } = require('../../db/models');
const { ensureAuth } = require('../../middleware/auth');

const router = express.Router();

/* ---------- Règles & regex partagées ---------- */
const MIN_AGE = 13;
const MAX_AGE = 100;
const PSEUDO_RE = /^[a-zA-Z0-9_]{3,32}$/;
const TEL_RE = /^\+?\d{6,20}$/;
const ISO2_RE = /^[A-Z]{2}$/;
const LANG_RE = /^[a-z]{2}(?:-[A-Z]{2})?$/;

function ageFromDateStr(s) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

function trimOrNull(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

/**
 * GET /auth/me
 */
router.get('/', ensureAuth, async (req, res) => {
  try {
    const u = await User.findByPk(req.user.sub, {
      attributes: { exclude: ['mot_de_passe'] },
    });
    if (!u) return res.status(404).end();
    res.json(u);
  } catch (e) {
    console.error('[GET /auth/me]', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PATCH /auth/me
 * Met à jour le profil (avec contrôle d’unicité sur pseudo & téléphone)
 */
router.patch('/', ensureAuth, async (req, res) => {
  // Champs éditables côté profil
  const allowed = [
    'prenom',
    'nom',
    'pseudo',
    'telephone',
    'date_naissance',
    'sexe_id',
    'pays',
    'ville',
    'langue_principale',
    'niveau_id',
    'description',
  ];

  // Extraction + normalisation douce
  const src = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      src[key] = req.body[key];
    }
  }

  // Normalisation string → trim, vide => null
  const cleaned = {
    prenom: trimOrNull(src.prenom),
    nom: trimOrNull(src.nom),
    pseudo: src.pseudo != null ? String(src.pseudo).trim() : undefined, // pseudo ne doit jamais devenir null/empty en DB
    telephone: trimOrNull(src.telephone),
    // date: on autorise null pour vider la valeur
    date_naissance:
      src.date_naissance === '' || src.date_naissance == null
        ? null
        : String(src.date_naissance),
    // ids: cast number ou null
    sexe_id:
      src.sexe_id === '' || src.sexe_id == null
        ? null
        : Number.isInteger(src.sexe_id)
          ? src.sexe_id
          : Number.parseInt(src.sexe_id, 10),
    niveau_id:
      src.niveau_id === '' || src.niveau_id == null
        ? null
        : Number.isInteger(src.niveau_id)
          ? src.niveau_id
          : Number.parseInt(src.niveau_id, 10),
    // pays en ISO2 upper, vide => null
    pays:
      src.pays === '' || src.pays == null
        ? null
        : String(src.pays).trim().toUpperCase(),
    ville: trimOrNull(src.ville),
    // langue: trim, vide => null
    langue_principale:
      src.langue_principale === '' || src.langue_principale == null
        ? null
        : String(src.langue_principale).trim(),
    description: trimOrNull(src.description),
  };

  /* ---------- Validations côté API (miroir du front) ---------- */

  // sexe_id / niveau_id : entiers positifs (ou null) + existence
  if (cleaned.sexe_id != null) {
    if (!Number.isInteger(cleaned.sexe_id) || cleaned.sexe_id <= 0) {
      return res.status(400).json({ error: 'sexe_id invalide' });
    }
  }
  if (cleaned.niveau_id != null) {
    if (!Number.isInteger(cleaned.niveau_id) || cleaned.niveau_id <= 0) {
      return res.status(400).json({ error: 'niveau_id invalide' });
    }
  }

  // date_naissance : format + bornes d’âge si fournie
  if (cleaned.date_naissance) {
    if (!validator.isDate(cleaned.date_naissance)) {
      return res.status(400).json({ error: 'Date de naissance invalide' });
    }
    const age = ageFromDateStr(cleaned.date_naissance);
    if (age == null || age < MIN_AGE || age > MAX_AGE) {
      return res
        .status(400)
        .json({ error: `Âge autorisé: ${MIN_AGE}–${MAX_AGE} ans` });
    }
  }

  // téléphone
  if (cleaned.telephone && !TEL_RE.test(cleaned.telephone)) {
    return res.status(400).json({ error: 'Téléphone invalide' });
  }

  // pays
  if (cleaned.pays && !ISO2_RE.test(cleaned.pays)) {
    return res.status(400).json({ error: 'Code pays invalide (ISO2)' });
  }

  // langue
  if (cleaned.langue_principale && !LANG_RE.test(cleaned.langue_principale)) {
    return res
      .status(400)
      .json({ error: 'Langue invalide (ex: fr ou fr-FR)' });
  }

  // pseudo : même règle que register (3–32 alphanumériques + _)
  if (Object.prototype.hasOwnProperty.call(src, 'pseudo')) {
    if (!cleaned.pseudo) {
      return res.status(400).json({ error: 'Le pseudo ne peut pas être vide.' });
    }
    if (!PSEUDO_RE.test(cleaned.pseudo)) {
      return res
        .status(400)
        .json({ error: 'Pseudo: 3–32 caractères alphanumériques ou _' });
    }
  }

  try {
    const user = await User.findByPk(req.user.sub);
    if (!user)
      return res.status(404).json({ error: 'Utilisateur introuvable' });

    // Vérif existence FK (si fournies)
    if (cleaned.sexe_id != null) {
      const sex = await Sex.findByPk(cleaned.sexe_id);
      if (!sex) return res.status(400).json({ error: 'sexe_id inconnu' });
    }
    if (cleaned.niveau_id != null) {
      const lvl = await Level.findByPk(cleaned.niveau_id);
      if (!lvl) return res.status(400).json({ error: 'niveau_id inconnu' });
    }

    // Unicité PSEUDO (si changé)
    if (
      Object.prototype.hasOwnProperty.call(src, 'pseudo') &&
      cleaned.pseudo !== user.pseudo
    ) {
      const existsPseudo = await User.findOne({
        where: { pseudo: cleaned.pseudo },
        attributes: ['id'],
      });
      if (existsPseudo && existsPseudo.id !== user.id) {
        return res
          .status(409)
          .json({ error: 'Ce pseudo est déjà pris.' });
      }
    }

    // Unicité TÉLÉPHONE (si fourni + changé)
    if (
      Object.prototype.hasOwnProperty.call(src, 'telephone') &&
      cleaned.telephone &&
      cleaned.telephone !== (user.telephone || null)
    ) {
      const existsTel = await User.findOne({
        where: { telephone: cleaned.telephone },
        attributes: ['id'],
      });
      if (existsTel && existsTel.id !== user.id) {
        return res.status(409).json({
          error: 'Ce numéro de téléphone est déjà utilisé.',
        });
      }
    }

    // Mise à jour
    await user.update(cleaned);

    const result = user.toJSON();
    delete result.mot_de_passe;
    return res.json(result);
  } catch (e) {
    console.error('[PATCH /auth/me]', e);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
