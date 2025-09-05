'use strict';
module.exports = {
  up: async (qi, S) => {
    await qi.createTable('bans', {
      id:               { type: S.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id:          { type: S.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      admin_id:         { type: S.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      raison:           { type: S.TEXT, allowNull: false },
      date_ban:         { type: S.DATE, allowNull: false, defaultValue: S.literal('CURRENT_TIMESTAMP') },
      date_expiration:  { type: S.DATE, allowNull: true },
      actif:            { type: S.BOOLEAN, allowNull: false, defaultValue: true }
    });
  },
  down: async (qi) => { await qi.dropTable('bans'); }
};
