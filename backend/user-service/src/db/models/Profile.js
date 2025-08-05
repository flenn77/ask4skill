// src/db/models/Profile.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Profile = sequelize.define('Profile', {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
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
      allowNull: true,
      defaultValue: {}
    },
    notifications: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: { email: true, push: false }
    }
  }, {
    tableName: 'profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Profile.associate = models => {
    Profile.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  };

  return Profile;
};
