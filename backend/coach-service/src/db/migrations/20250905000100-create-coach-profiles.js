'use strict';

module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('coach_profiles', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: Sequelize.literal('(UUID())') },
      user_id: { type: Sequelize.UUID, allowNull: false },
      titre: { type: Sequelize.STRING(255), allowNull: false },
      devise: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'EUR' },
      prix_par_heure: { type: Sequelize.DECIMAL(10,2), allowNull: true },
      prix_replay: { type: Sequelize.DECIMAL(10,2), allowNull: true },
      prix_session_groupe: { type: Sequelize.DECIMAL(10,2), allowNull: true },
      compte_stripe_id: { type: Sequelize.STRING(255), allowNull: true },
      disponible_actuellement: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      disponibilite_auto: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      est_certifie: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      date_creation: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      date_modification: { type: Sequelize.DATE, allowNull: true }
    });

    await qi.addConstraint('coach_profiles', {
      fields: ['user_id'],
      type: 'unique',
      name: 'uniq_coach_profiles_user_id'
    });

    await qi.addIndex('coach_profiles', ['devise']);
    await qi.addIndex('coach_profiles', ['est_certifie']);
    await qi.addIndex('coach_profiles', ['disponible_actuellement']);
  },

  async down(qi) {
    await qi.dropTable('coach_profiles');
  }
};
