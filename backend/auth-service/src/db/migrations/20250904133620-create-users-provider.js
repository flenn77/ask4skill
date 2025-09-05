'use strict';
module.exports = {
  up: async (qi, S) => {
    await qi.createTable('users_provider', {
      id: { type: S.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id: {
        type: S.UUID, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE'
      },
      provider:         { type: S.STRING(20), allowNull: false },
      provider_user_id: { type: S.STRING(64), allowNull: false }
    });
    await qi.addIndex('users_provider', ['user_id', 'provider'], { unique: true, name: 'uniq_user_provider' });
  },
  down: async (qi) => { await qi.dropTable('users_provider'); }
};
