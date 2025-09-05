'use strict';
module.exports = {
  up: async (qi, S) => {
    await qi.createTable('token_revocations', {
      id:             { type: S.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id:        { type: S.UUID, allowNull: false, unique: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      invalid_before: { type: S.DATE, allowNull: false, defaultValue: S.literal('CURRENT_TIMESTAMP') }
    });
  },
  down: async (qi) => { await qi.dropTable('token_revocations'); }
};
