'use strict';

module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('coach_palmares', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      coach_id: { type: Sequelize.UUID, allowNull: false },
      titre: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      annee: { type: Sequelize.SMALLINT, allowNull: true },
      date_creation: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      date_modification: { type: Sequelize.DATE, allowNull: true }
    });

    await qi.addIndex('coach_palmares', ['coach_id']);
    await qi.addConstraint('coach_palmares', {
      fields: ['coach_id'],
      type: 'foreign key',
      references: { table: 'coach_profiles', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'fk_palmares_coach'
    });
  },

  async down(qi) {
    await qi.dropTable('coach_palmares');
  }
};
