'use strict';
module.exports = {
  up: async (qi, S) => {
    await qi.createTable('users', {
      id: { type: S.UUID, defaultValue: S.literal('(UUID())'), allowNull: false, primaryKey: true },

      role_id: { type: S.SMALLINT, allowNull: false },  // FK roles.id
      pseudo:  { type: S.STRING(32),  allowNull: false },
      email:   { type: S.STRING(150), allowNull: false },
      mot_de_passe: { type: S.CHAR(60), allowNull: false },

      prenom: { type: S.STRING(50), allowNull: true },
      nom:    { type: S.STRING(50), allowNull: true },
      sexe_id: { type: S.TINYINT, allowNull: true },     // FK sexes.id
      date_naissance: { type: S.DATEONLY, allowNull: true },
      telephone: { type: S.STRING(20), allowNull: true },
      pays: { type: S.CHAR(2), allowNull: true },
      ville: { type: S.STRING(100), allowNull: true },
      langue_principale: { type: S.CHAR(5), allowNull: true },
      niveau_id: { type: S.TINYINT, allowNull: true },   // FK levels.id
      description: { type: S.TEXT, allowNull: true },

      date_inscription:   { type: S.DATE, allowNull: false, defaultValue: S.literal('CURRENT_TIMESTAMP') },
      derniere_connexion: { type: S.DATE, allowNull: true },
      is_email_verified:  { type: S.BOOLEAN, allowNull: false, defaultValue: false }
    });

    await qi.addIndex('users', ['email'],  { unique: true, name: 'uniq_users_email' });
    await qi.addIndex('users', ['pseudo'], { unique: true, name: 'uniq_users_pseudo' });

    await qi.addConstraint('users', {
      fields: ['role_id'],
      type: 'foreign key',
      name: 'fk_users_role_id',
      references: { table: 'roles', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    await qi.addConstraint('users', {
      fields: ['sexe_id'],
      type: 'foreign key',
      name: 'fk_users_sexe_id',
      references: { table: 'sexes', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    await qi.addConstraint('users', {
      fields: ['niveau_id'],
      type: 'foreign key',
      name: 'fk_users_niveau_id',
      references: { table: 'levels', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },
  down: async (qi) => {
    await qi.dropTable('users');
  }
};
