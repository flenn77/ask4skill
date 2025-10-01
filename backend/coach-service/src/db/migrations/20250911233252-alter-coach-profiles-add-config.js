'use strict';

module.exports = {
  async up(qi, Sequelize) {
    await qi.addColumn('coach_profiles', 'fuseau_horaire', {
      type: Sequelize.STRING(64), allowNull: false, defaultValue: 'Europe/Paris'
    });
    await qi.addColumn('coach_profiles', 'duree_slot_min', {
      type: Sequelize.INTEGER, allowNull: false, defaultValue: 60
    });
    await qi.addColumn('coach_profiles', 'delai_min_prise_rdv_min', {
      type: Sequelize.INTEGER, allowNull: false, defaultValue: 60
    });
    await qi.addColumn('coach_profiles', 'delai_max_anticipation_jours', {
      type: Sequelize.INTEGER, allowNull: false, defaultValue: 30
    });
    await qi.addColumn('coach_profiles', 'acceptation_mode', {
      type: Sequelize.ENUM('MANUEL','AUTO'), allowNull: false, defaultValue: 'MANUEL'
    });
    await qi.addColumn('coach_profiles', 'annulation_autorisee_heures', {
      type: Sequelize.INTEGER, allowNull: false, defaultValue: 24
    });

    await qi.addIndex('coach_profiles', ['acceptation_mode']);
  },

  async down(qi) {
    await qi.removeIndex('coach_profiles', ['acceptation_mode']).catch(() => {});
    await qi.removeColumn('coach_profiles', 'annulation_autorisee_heures');
    await qi.removeColumn('coach_profiles', 'acceptation_mode');
    await qi.removeColumn('coach_profiles', 'delai_max_anticipation_jours');
    await qi.removeColumn('coach_profiles', 'delai_min_prise_rdv_min');
    await qi.removeColumn('coach_profiles', 'duree_slot_min');
    await qi.removeColumn('coach_profiles', 'fuseau_horaire');

    try { await qi.sequelize.query('DROP TYPE `enum_coach_profiles_acceptation_mode`;'); } catch {}
  }
};
