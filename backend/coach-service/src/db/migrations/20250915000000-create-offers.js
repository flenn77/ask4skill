'use strict';

module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('offers', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: Sequelize.literal('(UUID())') },
      coach_id: { type: Sequelize.UUID, allowNull: false },
      type: { type: Sequelize.ENUM('INDIVIDUEL','GROUPE','REPLAY','LIVE'), allowNull: false },
      titre: { type: Sequelize.STRING(120), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      duree_min: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 60 },
      prix_centimes: { type: Sequelize.INTEGER, allowNull: false },
      devise: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'EUR' },
      actif: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: true }
    });

    await qi.addIndex('offers', ['coach_id']);
    await qi.addIndex('offers', ['type']);
    await qi.addIndex('offers', ['actif']);
    await qi.addConstraint('offers', {
      fields: ['coach_id'],
      type: 'foreign key',
      references: { table: 'coach_profiles', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'fk_offers_coach'
    });
  },

  async down(qi) {
    await qi.dropTable('offers');
    // Si Postgres, drop des ENUM ici le cas échéant
  }
};
