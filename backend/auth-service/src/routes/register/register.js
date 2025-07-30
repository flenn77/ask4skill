// src/routes/register/register.js
const express      = require('express');
const bcrypt       = require('bcrypt');
const crypto       = require('crypto');
const validator    = require('validator');
const nodemailer   = require('nodemailer');
const { User, EmailConfirmation } = require('../../db/models');

const router = express.Router();

// Transporteur MailDev
const transporter = nodemailer.createTransport({
  host: process.env.MAILDEV_HOST || 'maildev',
  port: process.env.MAILDEV_PORT || 1025,
  secure: false,
});

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         role:
 *           type: string
 *           enum: [JOUEUR, COACH, ADMIN, SUPERADMIN, MODERATEUR]
 *         email:
 *           type: string
 *           format: email
 *         pseudo:
 *           type: string
 *         prenom:
 *           type: string
 *         nom:
 *           type: string
 *         avatar_url:
 *           type: string
 *           format: uri
 *         sexe:
 *           type: string
 *           enum: [H, F, Autre, "Non spécifié"]
 *         date_naissance:
 *           type: string
 *           format: date
 *         telephone:
 *           type: string
 *         is_email_verified:
 *           type: boolean
 *         type_connexion:
 *           type: string
 *           enum: [email, google, steam, discord]
 *         date_inscription:
 *           type: string
 *           format: date-time
 *         ip_creation:
 *           type: string
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur (tous les champs, validations incluses)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - pseudo
 *               - prenom
 *               - nom
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 description: >
 *                   Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
 *               pseudo:
 *                 type: string
 *                 pattern: '^[a-zA-Z0-9_]{3,30}$'
 *               prenom:
 *                 type: string
 *                 maxLength: 50
 *               nom:
 *                 type: string
 *                 maxLength: 50
 *               avatar_url:
 *                 type: string
 *                 format: uri
 *               sexe:
 *                 type: string
 *                 enum: [H, F, Autre, "Non spécifié"]
 *               date_naissance:
 *                 type: string
 *                 format: date
 *               telephone:
 *                 type: string
 *                 pattern: '^\\+\\d{10,15}$'
 *             example:
 *               email: "user@example.com"
 *               password: "Secur3$Pass!"
 *               pseudo: "user_123"
 *               prenom: "User"
 *               nom: "Example"
 *               avatar_url: "https://…/avatar.png"
 *               sexe: "F"
 *               date_naissance: "1995-12-31"
 *               telephone: "+33123456789"
 *     responses:
 *       201:
 *         description: Utilisateur créé (sans mot de passe)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Erreur de validation ou email/pseudo déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', async (req, res) => {
  try {
    const {
      email, password,
      pseudo, prenom, nom,
      avatar_url, sexe,
      date_naissance, telephone
    } = req.body;

    // 1) Tous les champs requis
    if (!email || !password || !pseudo || !prenom || !nom) {
      return res.status(400).json({ error: 'Tous les champs (email, password, pseudo, prenom, nom) sont requis' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    // 2) Unicité email & pseudo
    if (await User.findOne({ where: { email } })) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(pseudo)) {
      return res.status(400).json({ error: 'Pseudo : 3–30 caractères alphanumériques ou _' });
    }
    if (await User.findOne({ where: { pseudo } })) {
      return res.status(400).json({ error: 'Pseudo déjà utilisé' });
    }

    // 3) Règles mot de passe
    const pwdRules = {
      minLength: 8,
      uppercase: /[A-Z]/,
      lowercase: /[a-z]/,
      digit:     /\d/,
      special:   /[!@#$%^&*(),.?":{}|<>]/
    };
    if (
      password.length < pwdRules.minLength ||
      !pwdRules.uppercase.test(password) ||
      !pwdRules.lowercase.test(password) ||
      !pwdRules.digit.test(password) ||
      !pwdRules.special.test(password)
    ) {
      return res.status(400).json({
        error: 'Mot de passe trop faible (min 8 car., 1 maj., 1 min., 1 chiffre, 1 spécial)'
      });
    }

    // 4) Validation optionnelle
    if (avatar_url && !validator.isURL(avatar_url)) {
      return res.status(400).json({ error: 'URL d’avatar invalide' });
    }
    if (date_naissance) {
      if (!validator.isDate(date_naissance)) {
        return res.status(400).json({ error: 'Date de naissance invalide' });
      }
      const age = new Date().getFullYear() - new Date(date_naissance).getFullYear();
      if (age < 13 || age > 120) {
        return res.status(400).json({ error: 'Âge doit être entre 13 et 120 ans' });
      }
    }
    if (telephone && !/^\+\d{10,15}$/.test(telephone)) {
      return res.status(400).json({
        error: 'Téléphone invalide (format E.164, ex. +33123456789)'
      });
    }

    // 5) Hash & création utilisateur
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email, password: hash,
      pseudo, prenom, nom,
      avatar_url, sexe,
      date_naissance, telephone
    });

    // 6) Génération du token de confirmation (24h)
    const token   = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await EmailConfirmation.create({
      user_id:    user.id,
      token,
      expires_at: expires
    });

    // 7) Envoi du mail de confirmation
    const confirmUrl = `${process.env.APP_URL || 'http://localhost:5000'}/auth/confirm?token=${token}`;
    await transporter.sendMail({
      from:    '"Ask4Skill" <no-reply@ask4skill.local>',
      to:      user.email,
      subject: 'Confirmez votre adresse e-mail',
      html: `
        <p>Bonjour ${prenom || pseudo},</p>
        <p>Pour valider votre inscription, cliquez ici :</p>
        <a href="${confirmUrl}">Confirmer mon e-mail</a>
        <p>Ce lien expire dans 24 heures.</p>
      `
    });

    // 8) Nettoyage et réponse
    const result = user.toJSON();
    delete result.password;
    res.status(201).json(result);

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
