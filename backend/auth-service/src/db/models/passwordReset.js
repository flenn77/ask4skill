'use strict';
module.exports = (sequelize, DataTypes) => {
  const PasswordReset = sequelize.define('PasswordReset', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'password_resets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  PasswordReset.associate = models => {
    PasswordReset.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return PasswordReset;
};
