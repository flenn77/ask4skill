// src/db/models/User.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    role: {
      type: DataTypes.ENUM('JOUEUR', 'COACH', 'ADMIN', 'SUPERADMIN', 'MODERATEUR'),
      allowNull: false,
      defaultValue: 'JOUEUR'
    },
    pseudo: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    prenom: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    nom: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    sexe: {
      type: DataTypes.ENUM('H', 'F', 'Autre', 'Non spécifié'),
      allowNull: true
    },
    date_naissance: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },

    // — champs de "profil" intégrés directement —
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    notifications: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: { email: true, push: false }
    },
    // — fin des champs de profil —

    is_email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    google_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    steam_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    discord_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    type_connexion: {
      type: DataTypes.ENUM('email', 'google', 'steam', 'discord'),
      allowNull: false,
      defaultValue: 'email'
    },
    date_inscription: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    derniere_connexion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ip_creation: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    ip_derniere_connexion: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    token_invalid_before: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },

  }, {
    tableName: 'users',
    timestamps: false
  });


  return User;
};
