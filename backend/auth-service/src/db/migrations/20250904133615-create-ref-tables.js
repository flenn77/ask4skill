'use strict';
module.exports = {
  up: async (qi, S) => {
    await qi.createTable('roles', {
      id:   { type: S.SMALLINT, primaryKey: true },
      nom:  { type: S.STRING(20), allowNull: false, unique: true }
    });
    await qi.createTable('sexes', {
      id:    { type: S.TINYINT, primaryKey: true },
      label: { type: S.STRING(20), allowNull: false, unique: true }
    });
    await qi.createTable('levels', {
      id:    { type: S.TINYINT, primaryKey: true },
      label: { type: S.STRING(20), allowNull: false, unique: true }
    });
    await qi.createTable('connexion_types', {
      id:    { type: S.SMALLINT, primaryKey: true },
      label: { type: S.STRING(20), allowNull: false, unique: true }
    });

    // Seeds
    await qi.bulkInsert('roles', [
      { id: 1, nom: 'JOUEUR' },
      { id: 2, nom: 'COACH'  },
      { id: 3, nom: 'ADMIN'  }
    ]);
    await qi.bulkInsert('sexes', [
      { id: 1, label: 'H'     },
      { id: 2, label: 'F'     },
      { id: 3, label: 'Autre' }
    ]);
    await qi.bulkInsert('levels', [
      { id: 1, label: 'Débutant'      },
      { id: 2, label: 'Intermédiaire' },
      { id: 3, label: 'Avancé'        }
    ]);
    await qi.bulkInsert('connexion_types', [
      { id: 1, label: 'email'   },
      { id: 2, label: 'google'  },
      { id: 3, label: 'steam'   },
      { id: 4, label: 'discord' }
    ]);
  },
  down: async (qi) => {
    await qi.dropTable('connexion_types');
    await qi.dropTable('levels');
    await qi.dropTable('sexes');
    await qi.dropTable('roles');
  }
};
