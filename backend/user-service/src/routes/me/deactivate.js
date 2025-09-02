'use strict';

const express       = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt        = require('bcrypt');
const nodemailer    = require('nodemailer');
const { ensureAuth }= require('../../middleware/auth');
const { User }      = require('../../db/models');

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false
});

/**
 * DELETE /users/me
 * Désactive le compte utilisateur (soft delete)
 */
router.delete(
  '/',
  ensureAuth,
  body('password').notEmpty().withMessage('Mot de passe requis'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.sub;
    const { password } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    await user.update({ is_active: false });

    await transporter.sendMail({
      from:    '"Ask4Skill" <no-reply@ask4skill.local>',
      to:      user.email,
      subject: 'Votre compte a été désactivé',
      html: `
        <p>Bonjour ${user.pseudo || user.email},</p>
        <p>Votre compte a bien été désactivé comme demandé.</p>
      `
    });

    res.json({ message: 'Compte désactivé et e-mail envoyé' });
  }
);

module.exports = router;
