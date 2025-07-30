'use strict';
module.exports = (sequelize, DataTypes) => {
  const EmailConfirmation = sequelize.define('EmailConfirmation', {
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
    tableName: 'email_confirmations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  EmailConfirmation.associate = (models) => {
    EmailConfirmation.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return EmailConfirmation;
};
