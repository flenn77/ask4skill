'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1) Supprime l'ancienne contrainte sur email_confirmations
        await queryInterface.removeConstraint('email_confirmations', 'email_confirmations_ibfk_1');
        // 2) Réajoute-la avec ON DELETE CASCADE
        await queryInterface.addConstraint('email_confirmations', {
            fields: ['user_id'],
            type: 'foreign key',
            name: 'email_confirmations_user_id_fkey',
            references: { table: 'users', field: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // Même chose pour password_resets
        await queryInterface.removeConstraint('password_resets', 'password_resets_ibfk_1');
        await queryInterface.addConstraint('password_resets', {
            fields: ['user_id'],
            type: 'foreign key',
            name: 'password_resets_user_id_fkey',
            references: { table: 'users', field: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeConstraint('email_confirmations', 'email_confirmations_user_id_fkey');
        await queryInterface.removeConstraint('password_resets', 'password_resets_user_id_fkey');
    }
};
