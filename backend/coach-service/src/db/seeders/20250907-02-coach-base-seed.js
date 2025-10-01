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
        // Config calendrier (laisse pour politiques de réservation futures)
        fuseau_horaire: 'Europe/Paris',
        duree_slot_min: 60,
        delai_min_prise_rdv_min: 60,
        delai_max_anticipation_jours: 30,
        acceptation_mode: 'MANUEL',
        annulation_autorisee_heures: 24,
        date_creation: now, date_modification: now
      },
      {
        id: CP.c2, user_id: U.coach2, titre: 'MOBA Macro/Micro',
        devise: 'EUR', prix_par_heure: 50.00, prix_replay: 30.00, prix_session_groupe: 20.00,
        compte_stripe_id: null, disponible_actuellement: true, disponibilite_auto: false, est_certifie: false,
        fuseau_horaire: 'Europe/Paris',
        duree_slot_min: 60,
        delai_min_prise_rdv_min: 120,
        delai_max_anticipation_jours: 14,
        acceptation_mode: 'MANUEL',
        annulation_autorisee_heures: 12,
        date_creation: now, date_modification: now
      },
      {
        id: CP.c3, user_id: U.coach3, titre: 'RL Mechanics & Rotation',
        devise: 'EUR', prix_par_heure: 40.00, prix_replay: 20.00, prix_session_groupe: 12.00,
        compte_stripe_id: null, disponible_actuellement: false, disponibilite_auto: true, est_certifie: true,
        fuseau_horaire: 'Europe/Paris',
        duree_slot_min: 30,
        delai_min_prise_rdv_min: 30,
        delai_max_anticipation_jours: 60,
        acceptation_mode: 'MANUEL',
        annulation_autorisee_heures: 24,
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
      { coach_id: CP.c2, titre: 'Tournoi local gagnant', description: 'Coach d’équipe universitaire',     annee: 2021, date_creation: now, date_modification: now },

      { coach_id: CP.c3, titre: 'GC RL S14',             description: 'Mécaniques aériennes & rotation 3v3', annee: 2024, date_creation: now, date_modification: now },
    ]);

    // Remarque: plus de seed pour disponibilités / indisponibilités / offers.
  },

  down: async (qi) => {
    const CP = [
      'c1111111-1111-4111-8111-111111111111',
      'c2222222-2222-4222-8222-222222222222',
      'c3333333-3333-4333-8333-333333333333',
    ];
    // nettoie enfants puis parents
    await qi.bulkDelete('coach_palmares',   { coach_id: CP });
    await qi.bulkDelete('coach_specialites',{ coach_id: CP });
    await qi.bulkDelete('coach_games',      { coach_id: CP });
    await qi.bulkDelete('coach_profiles',   { id: CP });
  }
};
