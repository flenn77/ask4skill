'use strict';

module.exports = {
  up: async (qi, S) => {
    const now = new Date();

    // UUID des users COACH (depuis auth-service)
    const U = {
      coach1: '22222222-2222-2222-2222-222222222222',
      coach2: '33333333-3333-3333-3333-333333333333',
      coach3: '44444444-4444-4444-4444-444444444444',
    };

    // UUID explicites pour coach_profiles
    const CP = {
      c1: 'c1111111-1111-4111-8111-111111111111',
      c2: 'c2222222-2222-4222-8222-222222222222',
      c3: 'c3333333-3333-4333-8333-333333333333',
    };

    // --- COACH PROFILES
    await qi.bulkInsert('coach_profiles', [
      {
        id: CP.c1, user_id: U.coach1, titre: 'FPS & Aim Coaching',
        devise: 'EUR', prix_par_heure: 45.00, prix_replay: 25.00, prix_session_groupe: 15.00,
        compte_stripe_id: null, disponible_actuellement: true, disponibilite_auto: true, est_certifie: true,
        date_creation: now, date_modification: now
      },
      {
        id: CP.c2, user_id: U.coach2, titre: 'MOBA Macro/Micro',
        devise: 'EUR', prix_par_heure: 50.00, prix_replay: 30.00, prix_session_groupe: 20.00,
        compte_stripe_id: null, disponible_actuellement: true, disponibilite_auto: false, est_certifie: false,
        date_creation: now, date_modification: now
      },
      {
        id: CP.c3, user_id: U.coach3, titre: 'RL Mechanics & Rotation',
        devise: 'EUR', prix_par_heure: 40.00, prix_replay: 20.00, prix_session_groupe: 12.00,
        compte_stripe_id: null, disponible_actuellement: false, disponibilite_auto: true, est_certifie: true,
        date_creation: now, date_modification: now
      },
    ]);

    // --- GAMES
    await qi.bulkInsert('coach_games', [
      { id: S.literal('(UUID())'), coach_id: CP.c1, game: 'Valorant',          date_creation: now, date_modification: now },
      { id: S.literal('(UUID())'), coach_id: CP.c1, game: 'CS2',               date_creation: now, date_modification: now },
      { id: S.literal('(UUID())'), coach_id: CP.c2, game: 'League of Legends', date_creation: now, date_modification: now },
      { id: S.literal('(UUID())'), coach_id: CP.c2, game: 'TFT',               date_creation: now, date_modification: now },
      { id: S.literal('(UUID())'), coach_id: CP.c3, game: 'Rocket League',     date_creation: now, date_modification: now },
      { id: S.literal('(UUID())'), coach_id: CP.c3, game: 'Fortnite',          date_creation: now, date_modification: now },
    ]);

    // --- SPECIALITÉS
    await qi.bulkInsert('coach_specialites', [
      { id: S.literal('(UUID())'), coach_id: CP.c1, specialty: 'individuel', date_creation: now, date_modification: now },
      { id: S.literal('(UUID())'), coach_id: CP.c1, specialty: 'replay',     date_creation: now, date_modification: now },
      { id: S.literal('(UUID())'), coach_id: CP.c1, specialty: 'groupe',     date_creation: now, date_modification: now },

      { id: S.literal('(UUID())'), coach_id: CP.c2, specialty: 'individuel', date_creation: now, date_modification: now },
      { id: S.literal('(UUID())'), coach_id: CP.c2, specialty: 'groupe',     date_creation: now, date_modification: now },

      { id: S.literal('(UUID())'), coach_id: CP.c3, specialty: 'individuel', date_creation: now, date_modification: now },
      { id: S.literal('(UUID())'), coach_id: CP.c3, specialty: 'replay',     date_creation: now, date_modification: now },
    ]);

    // --- PALMARÈS
    await qi.bulkInsert('coach_palmares', [
      { coach_id: CP.c1, titre: 'Immortal 3 - Valorant', description: 'Spécialiste des duels & utilité', annee: 2024, date_creation: now, date_modification: now },
      { coach_id: CP.c1, titre: 'Top 1% Aimlabs',        description: 'Routine aim personnalisée',        annee: 2023, date_creation: now, date_modification: now },

      { coach_id: CP.c2, titre: 'Master - LoL',          description: 'Jungle pathing & macro team',      annee: 2022, date_creation: now, date_modification: now },
      { coach_id: CP.c2, titre: 'Tournoi local gagnant', description: 'Coach d’équipe universitaire',      annee: 2021, date_creation: now, date_modification: now },

      { coach_id: CP.c3, titre: 'GC RL S14',             description: 'Mécaniques aériennes & rotation 3v3', annee: 2024, date_creation: now, date_modification: now },
    ]);

    // --- INDISPONIBILITÉS
    await qi.bulkInsert('indisponibilites', [
      // Coach 1 - répétitif
      {
        id: S.literal('(UUID())'), coach_id: CP.c1, type: 'repetitif', jour: 'lundi',
        heure_debut: '18:00:00', heure_fin: '20:00:00', slot_max_par_heure: 1, actif: true,
        date_creation: now, date_modification: now
      },
      {
        id: S.literal('(UUID())'), coach_id: CP.c1, type: 'repetitif', jour: 'mercredi',
        heure_debut: '19:00:00', heure_fin: '22:00:00', slot_max_par_heure: 2, actif: true,
        date_creation: now, date_modification: now
      },
      // Coach 2 - unique
      {
        id: S.literal('(UUID())'), coach_id: CP.c2, type: 'unique', date_unique: '2025-09-15',
        heure_debut: '09:00:00', heure_fin: '12:00:00', slot_max_par_heure: 1, actif: true,
        date_creation: now, date_modification: now
      },
      // Coach 3 - répétitif + unique
      {
        id: S.literal('(UUID())'), coach_id: CP.c3, type: 'repetitif', jour: 'samedi',
        heure_debut: '10:00:00', heure_fin: '13:00:00', slot_max_par_heure: 3, actif: true,
        date_creation: now, date_modification: now
      },
      {
        id: S.literal('(UUID())'), coach_id: CP.c3, type: 'unique', date_unique: '2025-09-20',
        heure_debut: '15:00:00', heure_fin: '18:00:00', slot_max_par_heure: 1, actif: false,
        date_creation: now, date_modification: now
      },
    ]);

    // --- OFFERS (si la table existe)
    try {
      await qi.bulkInsert('offers', [
        // Coach 1
        { id: S.literal('(UUID())'), coach_id: CP.c1, type: 'INDIVIDUEL', titre: 'Aim & Crosshair (1h)', description: 'Analyse VOD + routine aim', duree_min: 60, prix_centimes: 4500, devise: 'EUR', actif: true, created_at: now, updated_at: now },
        { id: S.literal('(UUID())'), coach_id: CP.c1, type: 'REPLAY',     titre: 'Review Valorant (45m)', description: 'Review détaillée avec timestamps', duree_min: 45, prix_centimes: 2500, devise: 'EUR', actif: true, created_at: now, updated_at: now },

        // Coach 2
        { id: S.literal('(UUID())'), coach_id: CP.c2, type: 'INDIVIDUEL', titre: 'Jungle Pathing (1h)', description: 'Clear optimisé & objectifs', duree_min: 60, prix_centimes: 5000, devise: 'EUR', actif: true, created_at: now, updated_at: now },
        { id: S.literal('(UUID())'), coach_id: CP.c2, type: 'GROUPE',     titre: 'Macro d’équipe (1h30)', description: 'Prio lanes, tempo, vision', duree_min: 90, prix_centimes: 2000, devise: 'EUR', actif: true, created_at: now, updated_at: now },

        // Coach 3
        { id: S.literal('(UUID())'), coach_id: CP.c3, type: 'INDIVIDUEL', titre: 'Aériens & double taps (1h)', description: 'Pack mechanics personnalisé', duree_min: 60, prix_centimes: 4000, devise: 'EUR', actif: true, created_at: now, updated_at: now },
        { id: S.literal('(UUID())'), coach_id: CP.c3, type: 'LIVE',       titre: 'Session Live 2v2 (1h)', description: 'Coaching en live Q', duree_min: 60, prix_centimes: 3000, devise: 'EUR', actif: true, created_at: now, updated_at: now },
      ]);
    } catch (e) {
      console.warn('[seed coach-service] Table "offers" absente, skip:', e?.message);
    }
  },

  down: async (qi) => {
    const CP = [
      'c1111111-1111-4111-8111-111111111111',
      'c2222222-2222-4222-8222-222222222222',
      'c3333333-3333-4333-8333-333333333333',
    ];
    await qi.bulkDelete('offers', { coach_id: CP });
    await qi.bulkDelete('indisponibilites', { coach_id: CP });
    await qi.bulkDelete('coach_palmares', { coach_id: CP });
    await qi.bulkDelete('coach_specialites', { coach_id: CP });
    await qi.bulkDelete('coach_games', { coach_id: CP });
    await qi.bulkDelete('coach_profiles', { id: CP });
  }
};
