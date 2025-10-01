'use strict';

module.exports = {
  async up(qi) {
    // Supprime silencieusement les anciennes tables si elles existent
    for (const table of ['disponibilites', 'indisponibilites']) {
      try { await qi.dropTable(table); } catch (_) { /* no-op */ }
    }

    // Si tu étais sur Postgres avec des ENUM globaux, on tente un drop silencieux
    try { await qi.sequelize.query('DROP TYPE IF EXISTS "enum_disponibilites_type";'); } catch {}
    try { await qi.sequelize.query('DROP TYPE IF EXISTS "enum_disponibilites_jour";'); } catch {}
    try { await qi.sequelize.query('DROP TYPE IF EXISTS "enum_indisponibilites_type";'); } catch {}
    try { await qi.sequelize.query('DROP TYPE IF EXISTS "enum_indisponibilites_jour";'); } catch {}
  },

  async down() {
    // no-op (on ne recrée pas les anciennes tables)
  }
};
