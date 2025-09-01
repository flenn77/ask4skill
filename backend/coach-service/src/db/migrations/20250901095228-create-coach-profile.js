'use strict';
module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('coach_profiles', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('(UUID())'), allowNull: false, primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false },
      bio_coach: { type: Sequelize.TEXT, allowNull: true },
      langues: { type: Sequelize.JSON, allowNull: false, defaultValue: '[]' },
      jeux: { type: Sequelize.JSON, allowNull: false, defaultValue: '["VALORANT"]' },
      reseaux: { type: Sequelize.JSON, allowNull: false, defaultValue: '{}' },
      structure: { type: Sequelize.STRING(120), allowNull: true },
      palmares: { type: Sequelize.JSON, allowNull: false, defaultValue: '[]' },
      stripe_account_id: { type: Sequelize.STRING(100), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: true, defaultValue: null }
    });
    await qi.addIndex('coach_profiles', ['user_id']);
  },
  async down(qi) {
    await qi.dropTable('coach_profiles');
  }
};
