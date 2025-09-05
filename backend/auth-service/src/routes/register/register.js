// src/routes/register/register.js
'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const validator = require('validator');
const nodemailer = require('nodemailer');
const db = require('../../db/models');
const { User, EmailConfirmation, Sex, Level } = db;

const router = express.Router();

/* ---------- Règles d’âge ---------- */
const MIN_AGE = 13;
const MAX_AGE = 100;
function ageFromDateStr(s) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

/* ---------- Transport SMTP (variables .env) ---------- */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'maildev',
  port: Number(process.env.SMTP_PORT || 1025),
  secure:
    String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' ||
    Number(process.env.SMTP_PORT) === 465,
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
});

router.post('/', async (req, res) => {
  try {
    // ---------- Normalisation ----------
    let {
      email,
      password,
      pseudo,
      prenom,
      nom,
      role_id,
      sexe_id,
      date_naissance,
      telephone,
      pays,
      ville,
      langue_principale,
      niveau_id,
      description,
    } = req.body || {};

    const ALLOWED_ROLES = [1, 2]; // JOUEUR, COACH
    const finalRoleId = ALLOWED_ROLES.includes(Number(role_id))
      ? Number(role_id)
      : 1;

    if (typeof email === 'string') email = email.trim().toLowerCase();
    if (typeof pseudo === 'string') pseudo = pseudo.trim(); // garde la casse pour l’affichage
    if (typeof prenom === 'string') prenom = prenom.trim();
    if (typeof nom === 'string') nom = nom.trim();
    if (typeof pays === 'string') pays = pays.trim().toUpperCase();
    if (typeof ville === 'string') ville = ville.trim();
    if (typeof langue_principale === 'string') langue_principale = langue_principale.trim();

    // ---------- Champs requis ----------
    if (!email || !password || !pseudo || !prenom || !nom) {
      return res
        .status(400)
        .json({ error: 'Champs requis: email, password, pseudo, prenom, nom' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    // ---------- Contraintes de format ----------
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(pseudo)) {
      return res
        .status(400)
        .json({ error: 'Pseudo: 3–32 caractères alphanumériques ou _' });
    }

    // Règles mot de passe (alignées avec /auth/reset)
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)
    ) {
      return res.status(400).json({
        error:
          'Mot de passe trop faible (min 8 car., 1 maj., 1 min., 1 chiffre, 1 spécial)',
      });
    }

    // Date de naissance + âge
    if (date_naissance) {
      if (!validator.isDate(date_naissance)) {
        return res.status(400).json({ error: 'Date de naissance invalide' });
      }
      const age = ageFromDateStr(date_naissance);
      if (age === null || age < MIN_AGE || age > MAX_AGE) {
        return res
          .status(400)
          .json({ error: `Âge autorisé: ${MIN_AGE}–${MAX_AGE} ans` });
      }
    }

    // Téléphone / pays / langue
    if (telephone && !/^\+?\d{6,20}$/.test(telephone)) {
      return res.status(400).json({ error: 'Téléphone invalide' });
    }
    if (pays && !/^[A-Z]{2}$/.test(pays)) {
      return res.status(400).json({ error: 'Pays (ISO2) invalide' });
    }
    if (langue_principale && !/^[a-z]{2}(?:-[A-Z]{2})?$/.test(langue_principale)) {
      return res
        .status(400)
        .json({ error: 'Langue invalide (ex: fr ou fr-FR)' });
    }

    // ---------- FKs optionnelles : existence ----------
    if (sexe_id != null) {
      const sex = await Sex.findByPk(sexe_id);
      if (!sex) return res.status(400).json({ error: 'sexe_id inconnu' });
    }
    if (niveau_id != null) {
      const lvl = await Level.findByPk(niveau_id);
      if (!lvl) return res.status(400).json({ error: 'niveau_id inconnu' });
    }

    // ---------- Unicité email / pseudo ----------
    if (await User.findOne({ where: { email } })) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }
    if (await User.findOne({ where: { pseudo } })) {
      return res.status(400).json({ error: 'Pseudo déjà utilisé' });
    }

    // ---------- Création ----------
    const hash = await bcrypt.hash(password, 10);

    // transaction pour créer user + email_confirmation
    let user, token;
    await db.sequelize.transaction(async (t) => {
      user = await User.create(
        {
          role_id: finalRoleId,
          pseudo,
          email,
          mot_de_passe: hash,
          prenom,
          nom,
          sexe_id,
          date_naissance,
          telephone,
          pays,
          ville,
          langue_principale,
          niveau_id,
          description,
        },
        { transaction: t }
      );

      token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      await EmailConfirmation.create(
        {
          user_id: user.id,
          token,
          expires_at: expires,
        },
        { transaction: t }
      );
    });

    // ---------- Envoi de l’email après commit ----------
    const confirmUrl = `${
      process.env.FRONT_URL || 'http://localhost:3000'
    }/confirm?token=${token}`;
    let emailWarning = null;
    try {
      await transporter.sendMail({
        from:
          process.env.EMAIL_FROM ||
          '"Ask4Skill" <no-reply@ask4skill.local>',
        to: user.email,
        subject: 'Confirmez votre adresse e-mail',
        html: `
          <p>Bonjour ${prenom || pseudo},</p>
          <p>Confirmez votre e-mail :</p>
          <p><a href="${confirmUrl}">Confirmer mon e-mail</a></p>
          <p>Le lien expire dans 24h.</p>
        `,
      });
    } catch (e) {
      console.error('[register] sendMail error:', e);
      emailWarning =
        'Utilisateur créé mais l’email de confirmation n’a pas pu être envoyé.';
    }

    const result = user.toJSON();
    delete result.mot_de_passe;

    return res
      .status(201)
      .json(emailWarning ? { ...result, warning: emailWarning } : result);
  } catch (err) {
    console.error('[register] error:', err);

    // fallback unicité DB
    if (err?.name === 'SequelizeUniqueConstraintError') {
      const fld = err?.errors?.[0]?.path;
      if (fld === 'email')
        return res.status(400).json({ error: 'Email déjà utilisé' });
      if (fld === 'pseudo')
        return res.status(400).json({ error: 'Pseudo déjà utilisé' });
    }

    return res
      .status(400)
      .json({ error: err.message || 'Erreur de validation' });
  }
});

module.exports = router;
