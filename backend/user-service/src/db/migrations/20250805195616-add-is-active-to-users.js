'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('users');
    if (!table.is_active) {
      await queryInterface.addColumn('users', 'is_active', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
    }
  },

  down: async (queryInterface) => {
    const table = await queryInterface.describeTable('users');
    if (table.is_active) {
      await queryInterface.removeColumn('users', 'is_active');
    }
  }
};
