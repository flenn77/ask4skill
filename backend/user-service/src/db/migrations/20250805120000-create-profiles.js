'use strict';
module.exports = {
    up: async (qi, Sequelize) => {
        await qi.createTable('profiles', {
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                references: { model: 'users', key: 'id' },
                onDelete: 'CASCADE'
            },
            avatar_url: { type: Sequelize.STRING(255), allowNull: true },
            bio: { type: Sequelize.TEXT, allowNull: true },
            location: { type: Sequelize.STRING(100), allowNull: true },
            preferences: { type: Sequelize.JSON, allowNull: true, defaultValue: {} },
            notifications: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: { email: true, push: false }
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
            }
        });
    },
    down: async qi => { await qi.dropTable('profiles'); }
};
