'use strict';

module.exports = {
  up: async (qi, S) => {
    const now = new Date();

    // joueurs fictifs (depuis auth-service côté réel)
    const J = {
      j1: '11111111-1111-4111-8111-111111111111',
      j2: '55555555-5555-4555-8555-555555555555'
    };

    // coach_profiles existants via seed précédent
    const CP = {
      c1: 'c1111111-1111-4111-8111-111111111111',
      c2: 'c2222222-2222-4222-8222-222222222222',
      c3: 'c3333333-3333-4333-8333-333333333333',
    };

    // dates futures
    const plus1h = new Date(now.getTime() + 60 * 60 * 1000);
    const plus2j = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    await qi.bulkInsert('demandes_coaching', [
      // EN_ATTENTE — Individuel 60 min chez coach1 (45€/h => 4500 centimes)
      {
        id: S.literal('(UUID())'),
        joueur_id: J.j1,
        coach_id: CP.c1,
        type: 'INDIVIDUEL',
        date_debut: plus1h,
        duree_min: 60,
        prix_centimes: 4500,
        devise: 'EUR',
        statut: 'EN_ATTENTE',
        message_joueur: 'Salut, je veux travailler mon crosshair placement',
        date_creation: now,
        date_modification: now
      },
      // ACCEPTEE — Groupe 90 min chez coach2 (20€/h groupe => 3000 centimes)
      {
        id: S.literal('(UUID())'),
        joueur_id: J.j2,
        coach_id: CP.c2,
        type: 'GROUPE',
        date_debut: plus2j,
        duree_min: 90,
        prix_centimes: 3000,
        devise: 'EUR',
        statut: 'ACCEPTEE',
        message_joueur: 'On sera 3 pour la macro jungle',
        conversation_id: 'conv_demo_ABC123',
        date_creation: now,
        date_modification: now
      },
      // REFUSEE — Replay (prix fixe 25€ => 2500 centimes)
      {
        id: S.literal('(UUID())'),
        joueur_id: J.j1,
        coach_id: CP.c1,
        type: 'REPLAY',
        date_debut: null,
        duree_min: null,
        prix_centimes: 2500,
        devise: 'EUR',
        statut: 'REFUSEE',
        message_joueur: 'Analyse VOD 20 min',
        raison_refus: 'Indisponible cette semaine',
        date_creation: now,
        date_modification: now
      }
    ]);
  },

  down: async (qi) => {
    // supprime toutes les demandes seedées (simplement par statut connu)
    await qi.bulkDelete('demandes_coaching', { conversation_id: 'conv_demo_ABC123' });
    await qi.bulkDelete('demandes_coaching', { statut: 'REFUSEE' });
    await qi.bulkDelete('demandes_coaching', { statut: 'EN_ATTENTE' });
    // (si tu as déjà des vraies données, adapte le where aux IDs exacts)
  }
};
