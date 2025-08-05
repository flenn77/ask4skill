// src/db/models/User.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    pseudo: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false
    }
  }, {
    tableName: 'users',
    timestamps: false
  });

  // Association 1:1 avec le modèle Profile
  User.associate = models => {
    User.hasOne(models.Profile, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE'
    });
  };

  return User;
};
