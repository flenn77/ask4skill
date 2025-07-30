'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('(UUID())'),
        allowNull: false,
        primaryKey: true
      },
      role: {
        type: Sequelize.ENUM('JOUEUR','COACH','ADMIN','SUPERADMIN','MODERATEUR'),
        allowNull: false,
        defaultValue: 'JOUEUR'
      },
      pseudo: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      prenom: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      nom: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      avatar_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      sexe: {
        type: Sequelize.ENUM('H','F','Autre','Non spécifié'),
        allowNull: true
      },
      date_naissance: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      telephone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      is_email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      google_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      steam_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      discord_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      type_connexion: {
        type: Sequelize.ENUM('email','google','steam','discord'),
        allowNull: false,
        defaultValue: 'email'
      },
      date_inscription: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      derniere_connexion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      ip_creation: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      ip_derniere_connexion: {
        type: Sequelize.STRING(45),
        allowNull: true
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  }
};
