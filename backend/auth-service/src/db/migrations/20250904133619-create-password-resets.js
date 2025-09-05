'use strict';
module.exports = {
  up: async (qi, S) => {
    await qi.createTable('password_resets', {
      id:         { type: S.UUID, defaultValue: S.literal('(UUID())'), allowNull: false, primaryKey: true },
      user_id:    { type: S.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      token:      { type: S.STRING(64), allowNull: false, unique: true },
      expires_at: { type: S.DATE, allowNull: false },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('CURRENT_TIMESTAMP') }
    });
  },
  down: async (qi) => { await qi.dropTable('password_resets'); }
};
