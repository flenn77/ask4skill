'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Champs de profil dans users
    await Promise.all([
      queryInterface.addColumn('users', 'avatar_url', {
        type: Sequelize.STRING(255),
        allowNull: true
      }),
      queryInterface.addColumn('users', 'bio', {
        type: Sequelize.TEXT,
        allowNull: true
      }),
      queryInterface.addColumn('users', 'location', {
        type: Sequelize.STRING(100),
        allowNull: true
      }),
      queryInterface.addColumn('users', 'preferences', {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {}
      }),
      queryInterface.addColumn('users', 'notifications', {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: { email: true, push: false }
      })
    ]);
  },

  down: async (queryInterface /*, Sequelize */) => {
    // On retire dans l’ordre inverse
    await Promise.all([
      queryInterface.removeColumn('users', 'notifications'),
      queryInterface.removeColumn('users', 'preferences'),
      queryInterface.removeColumn('users', 'location'),
      queryInterface.removeColumn('users', 'bio'),
      queryInterface.removeColumn('users', 'avatar_url')
    ]);
  }
};
