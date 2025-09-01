// src/db/migrations/20250806160000-add-profile-fields-to-users.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'bio', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'location', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
    await queryInterface.addColumn('users', 'preferences', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {}
    });
    await queryInterface.addColumn('users', 'notifications', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: { email: true, push: false }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'notifications');
    await queryInterface.removeColumn('users', 'preferences');
    await queryInterface.removeColumn('users', 'location');
    await queryInterface.removeColumn('users', 'bio');
  }
};
