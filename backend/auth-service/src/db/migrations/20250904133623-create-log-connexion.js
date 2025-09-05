'use strict';
module.exports = {
  up: async (qi, S) => {
    await qi.createTable('log_connexion', {
      id:         { type: S.UUID, defaultValue: S.literal('(UUID())'), primaryKey: true },
      user_id:    { type: S.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      ip:         { type: S.STRING, allowNull: true },
      user_agent: { type: S.TEXT, allowNull: true },
      date:       { type: S.DATE, allowNull: false, defaultValue: S.literal('CURRENT_TIMESTAMP') }
    });
  },
  down: async (qi) => { await qi.dropTable('log_connexion'); }
};
  