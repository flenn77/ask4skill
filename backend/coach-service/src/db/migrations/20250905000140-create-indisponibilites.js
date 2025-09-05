'use strict';

module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('indisponibilites', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: Sequelize.literal('(UUID())') },
      coach_id: { type: Sequelize.UUID, allowNull: false },
      jour: { type: Sequelize.ENUM('lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'), allowNull: true },
      heure_debut: { type: Sequelize.TIME, allowNull: false },
      heure_fin: { type: Sequelize.TIME, allowNull: false },
      type: { type: Sequelize.ENUM('repetitif','unique'), allowNull: false, defaultValue: 'repetitif' },
      date_unique: { type: Sequelize.DATEONLY, allowNull: true },
      slot_max_par_heure: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      actif: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      date_creation: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      date_modification: { type: Sequelize.DATE, allowNull: true }
    });

    await qi.addIndex('indisponibilites', ['coach_id']);
    await qi.addIndex('indisponibilites', ['coach_id', 'actif', 'jour']);
    await qi.addIndex('indisponibilites', ['coach_id', 'date_unique']);
    await qi.addConstraint('indisponibilites', {
      fields: ['coach_id'],
      type: 'foreign key',
      references: { table: 'coach_profiles', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      name: 'fk_indisponibilites_coach'
    });
  },

  async down(qi) {
    // Supprimer la table et les ENUMs
    await qi.dropTable('indisponibilites');
    try { await qi.sequelize.query("DROP TYPE `enum_indisponibilites_jour`;"); } catch {}
    try { await qi.sequelize.query("DROP TYPE `enum_indisponibilites_type`;"); } catch {}
  }
};
