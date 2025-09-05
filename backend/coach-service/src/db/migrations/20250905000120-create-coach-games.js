'use strict';

module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('coach_games', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: Sequelize.literal('(UUID())') },
      coach_id: { type: Sequelize.UUID, allowNull: false },
      game: { type: Sequelize.STRING(50), allowNull: false },
      date_creation: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      date_modification: { type: Sequelize.DATE, allowNull: true }
    });

    await qi.addIndex('coach_games', ['coach_id']);
    await qi.addConstraint('coach_games', {
      fields: ['coach_id', 'game'],
      type: 'unique',
      name: 'uniq_coach_game'
    });
    await qi.addConstraint('coach_games', {
      fields: ['coach_id'],
      type: 'foreign key',
      references: { table: 'coach_profiles', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'fk_games_coach'
    });
  },

  async down(qi) {
    await qi.dropTable('coach_games');
  }
};
