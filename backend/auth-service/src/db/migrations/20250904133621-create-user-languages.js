'use strict';
module.exports = {
  up: async (qi, S) => {
    await qi.createTable('user_languages', {
      user_id:   { type: S.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      lang_code: { type: S.CHAR(5), allowNull: false }
    });
    await qi.addIndex('user_languages', ['user_id', 'lang_code'], { unique: true, name: 'pk_user_languages' });
  },
  down: async (qi) => { await qi.dropTable('user_languages'); }
};
