'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Décrit la table et n'ajoute la colonne que si elle n'existe pas
    const table = await queryInterface.describeTable('users');
    if (!table.token_invalid_before) {
      await queryInterface.addColumn('users', 'token_invalid_before', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },
  down: async (queryInterface) => {
    // On peut garder la down classique
    const table = await queryInterface.describeTable('users');
    if (table.token_invalid_before) {
      await queryInterface.removeColumn('users', 'token_invalid_before');
    }
  }
};
