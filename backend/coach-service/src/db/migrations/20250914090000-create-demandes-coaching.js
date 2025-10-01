'use strict';

module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('demandes_coaching', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: Sequelize.literal('(UUID())') },

      // relations
      joueur_id: { type: Sequelize.UUID, allowNull: false }, // user_id du joueur (pas de FK ici, géré par auth-service)
      coach_id:  { type: Sequelize.UUID, allowNull: false }, // FK -> coach_profiles.id

      // données métier
      type: { type: Sequelize.ENUM('INDIVIDUEL','GROUPE','REPLAY','LIVE'), allowNull: false },
      date_debut: { type: Sequelize.DATE, allowNull: true },       // null autorisé pour REPLAY
      duree_min:  { type: Sequelize.INTEGER, allowNull: true },    // null/0 pour REPLAY

      prix_centimes: { type: Sequelize.INTEGER, allowNull: false },
      devise: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'EUR' },

      statut: {
        type: Sequelize.ENUM('EN_ATTENTE','ACCEPTEE','REFUSEE','ANNULEE','EXPIREE','ARCHIVEE'),
        allowNull: false,
        defaultValue: 'EN_ATTENTE'
      },

      message_joueur: { type: Sequelize.TEXT, allowNull: true },
      raison_refus:   { type: Sequelize.TEXT, allowNull: true },
      conversation_id:{ type: Sequelize.STRING(64), allowNull: true },
      date_archive:   { type: Sequelize.DATE, allowNull: true },

      // timestamps
      date_creation:     { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      date_modification: { type: Sequelize.DATE, allowNull: true }
    });

    // indexes
    await qi.addIndex('demandes_coaching', ['coach_id', 'statut']);
    await qi.addIndex('demandes_coaching', ['joueur_id', 'statut']);
    await qi.addIndex('demandes_coaching', ['date_debut']);

    // FK coach_id -> coach_profiles.id
    await qi.addConstraint('demandes_coaching', {
      fields: ['coach_id'],
      type: 'foreign key',
      references: { table: 'coach_profiles', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'fk_demandes_coaching_coach'
    });
  },

  async down(qi /*, Sequelize */) {
    await qi.dropTable('demandes_coaching');
    // MySQL n'a pas de TYPE ENUM global, rien à dropper.
    // (Si tu passes à Postgres plus tard, gérer le DROP TYPE ici)
  }
};
