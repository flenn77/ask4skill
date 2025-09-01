'use strict';
module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('availabilities', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('(UUID())'), allowNull: false, primaryKey: true },
      coach_id: { type: Sequelize.UUID, allowNull: false },
      start_at: { type: Sequelize.DATE, allowNull: false },
      end_at: { type: Sequelize.DATE, allowNull: false },
      timezone: { type: Sequelize.STRING(60), allowNull: false, defaultValue: 'Europe/Paris' },
      rrule: { type: Sequelize.STRING(255), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: true, defaultValue: null }
    });
    await qi.addIndex('availabilities', ['coach_id']);
    await qi.addIndex('availabilities', ['start_at', 'end_at']);
  },
  async down(qi) {
    await qi.dropTable('availabilities');
  }
};
