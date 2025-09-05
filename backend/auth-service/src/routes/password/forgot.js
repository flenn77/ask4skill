// src/routes/password/forgot.js
const express     = require('express');
const crypto      = require('crypto');
const { User, PasswordReset } = require('../../db/models');
const nodemailer  = require('nodemailer');

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.MAILDEV_HOST || 'maildev',
  port: process.env.MAILDEV_PORT || 1025,
  secure: false,
});

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email est requis' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Format d’email invalide' });
    }

    const user = await User.findOne({ where: { email } });
    if (user) {
      // on nettoie les anciens tokens pour ce user
      await PasswordReset.destroy({ where: { user_id: user.id } });

      const token   = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h
      await PasswordReset.create({ user_id: user.id, token, expires_at: expires });

      const resetUrl = `${process.env.FRONT_URL || 'http://localhost:3000'}/reset?token=${token}`;

      await transporter.sendMail({
        from: '"Ask4Skill" <no-reply@ask4skill.local>',
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe',
        html: `
          <p>Bonjour ${user.pseudo || user.email},</p>
          <p>Pour réinitialiser votre mot de passe, cliquez ici :</p>
          <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
          <p>Ce lien expire dans 1 heure.</p>
        `,
      });
    }

    return res.json({
      message: 'Si cet email existe, un lien de réinitialisation vous a été envoyé.',
    });
  } catch (err) {
    console.error('[forgot]', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
