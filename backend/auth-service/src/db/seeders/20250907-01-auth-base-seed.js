'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async (qi, S) => {
    // UUID fixes pour recoller côté coach-service
    const U = {
      admin:   '11111111-1111-1111-1111-111111111111',
      coach1:  '22222222-2222-2222-2222-222222222222',
      coach2:  '33333333-3333-3333-3333-333333333333',
      coach3:  '44444444-4444-4444-4444-444444444444',
      player1: '55555555-5555-5555-5555-555555555555',
      player2: '66666666-6666-6666-6666-666666666666',
      player3: '77777777-7777-7777-7777-777777777777',
      player4: '88888888-8888-8888-8888-888888888888',
      player5: '99999999-9999-9999-9999-999999999999',
    };

    const passwordHash = await bcrypt.hash('Passw0rd!', 10);
    const now = new Date();

    // --- USERS
    await qi.bulkInsert('users', [
      // ADMIN
      {
        id: U.admin, role_id: 3, pseudo: 'admin',
        email: 'admin@ask4skill.local', mot_de_passe: passwordHash,
        prenom: 'Admin', nom: 'Root', sexe_id: 1, niveau_id: 3,
        pays: 'FR', ville: 'Paris', langue_principale: 'fr',
        date_inscription: now, derniere_connexion: now, is_email_verified: true,
      },

      // COACHS
      {
        id: U.coach1, role_id: 2, pseudo: 'coach_lina',
        email: 'lina@ask4skill.local', mot_de_passe: passwordHash,
        prenom: 'Lina', nom: 'Moreau', sexe_id: 2, niveau_id: 3,
        pays: 'FR', ville: 'Lyon', langue_principale: 'fr',
        date_inscription: now, derniere_connexion: now, is_email_verified: true,
      },
      {
        id: U.coach2, role_id: 2, pseudo: 'coach_hugo',
        email: 'hugo@ask4skill.local', mot_de_passe: passwordHash,
        prenom: 'Hugo', nom: 'Martin', sexe_id: 1, niveau_id: 3,
        pays: 'FR', ville: 'Lille', langue_principale: 'fr',
        date_inscription: now, derniere_connexion: now, is_email_verified: true,
      },
      {
        id: U.coach3, role_id: 2, pseudo: 'coach_marco',
        email: 'marco@ask4skill.local', mot_de_passe: passwordHash,
        prenom: 'Marco', nom: 'Dias', sexe_id: 1, niveau_id: 3,
        pays: 'PT', ville: 'Porto', langue_principale: 'en-US',
        date_inscription: now, derniere_connexion: now, is_email_verified: true,
      },

      // JOUEURS
      {
        id: U.player1, role_id: 1, pseudo: 'player_zoe',
        email: 'zoe@ask4skill.local', mot_de_passe: passwordHash,
        prenom: 'Zoé', nom: 'Lambert', sexe_id: 2, niveau_id: 2,
        pays: 'FR', ville: 'Nantes', langue_principale: 'fr',
        date_inscription: now, is_email_verified: true,
      },
      {
        id: U.player2, role_id: 1, pseudo: 'player_sam',
        email: 'sam@ask4skill.local', mot_de_passe: passwordHash,
        prenom: 'Sam', nom: 'Nguyen', sexe_id: 1, niveau_id: 1,
        pays: 'BE', ville: 'Bruxelles', langue_principale: 'fr',
        date_inscription: now, is_email_verified: true,
      },
      {
        id: U.player3, role_id: 1, pseudo: 'player_ines',
        email: 'ines@ask4skill.local', mot_de_passe: passwordHash,
        prenom: 'Inès', nom: 'Garcia', sexe_id: 2, niveau_id: 2,
        pays: 'ES', ville: 'Madrid', langue_principale: 'es',
        date_inscription: now, is_email_verified: true,
      },
      {
        id: U.player4, role_id: 1, pseudo: 'player_lee',
        email: 'lee@ask4skill.local', mot_de_passe: passwordHash,
        prenom: 'Lee', nom: 'Park', sexe_id: 1, niveau_id: 3,
        pays: 'KR', ville: 'Seoul', langue_principale: 'en-US',
        date_inscription: now, is_email_verified: true,
      },
      {
        id: U.player5, role_id: 1, pseudo: 'player_ava',
        email: 'ava@ask4skill.local', mot_de_passe: passwordHash,
        prenom: 'Ava', nom: 'Smith', sexe_id: 3, niveau_id: 1,
        pays: 'GB', ville: 'London', langue_principale: 'en-GB',
        date_inscription: now, is_email_verified: true,
      },
    ]);

    // --- USER LANGUAGES
    await qi.bulkInsert('user_languages', [
      { user_id: U.admin,   lang_code: 'fr' },
      { user_id: U.coach1,  lang_code: 'fr' },
      { user_id: U.coach2,  lang_code: 'fr' },
      { user_id: U.coach3,  lang_code: 'en-US' },
      { user_id: U.player1, lang_code: 'fr' },
      { user_id: U.player2, lang_code: 'fr' },
      { user_id: U.player3, lang_code: 'es' },
      { user_id: U.player4, lang_code: 'en-US' },
      { user_id: U.player5, lang_code: 'en-GB' },
    ]);

    // --- USERS PROVIDER (exemples)
    await qi.bulkInsert('users_provider', [
      { user_id: U.coach1, provider: 'google',  provider_user_id: 'google_1001' },
      { user_id: U.coach3, provider: 'discord', provider_user_id: 'discord_2003' },
      { user_id: U.player4, provider: 'steam',  provider_user_id: 'steam_3004' },
    ]);

    // --- BANS (player2 temporairement banni par admin)
    const tomorrow = new Date(Date.now() + 24*60*60*1000);
    await qi.bulkInsert('bans', [
      {
        user_id: U.player2,
        admin_id: U.admin,
        raison: 'Toxicité en vocal',
        date_ban: now,
        date_expiration: tomorrow,
        actif: true
      }
    ]);

    // --- LOG CONNEXION (échantillon)
    await qi.bulkInsert('log_connexion', [
      { id: S.literal('(UUID())'), user_id: U.coach1, ip: '1.1.1.1', user_agent: 'seed/agent', date: now },
      { id: S.literal('(UUID())'), user_id: U.coach2, ip: '2.2.2.2', user_agent: 'seed/agent', date: now },
      { id: S.literal('(UUID())'), user_id: U.player1, ip: '3.3.3.3', user_agent: 'seed/agent', date: now },
    ]);
  },

  down: async (qi) => {
    const ids = [
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      '33333333-3333-3333-3333-333333333333',
      '44444444-4444-4444-4444-444444444444',
      '55555555-5555-5555-5555-555555555555',
      '66666666-6666-6666-6666-666666666666',
      '77777777-7777-7777-7777-777777777777',
      '88888888-8888-8888-8888-888888888888',
      '99999999-9999-9999-9999-999999999999',
    ];

    await qi.bulkDelete('log_connexion', { user_id: ids });
    await qi.bulkDelete('bans', { user_id: ids });
    await qi.bulkDelete('users_provider', { user_id: ids });
    await qi.bulkDelete('user_languages', { user_id: ids });
    await qi.bulkDelete('users', { id: ids });
  }
};
