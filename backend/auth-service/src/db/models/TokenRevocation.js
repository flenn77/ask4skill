'use strict';
module.exports = (sequelize, DataTypes) => {
  const TokenRevocation = sequelize.define('TokenRevocation', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    invalid_before: { type: DataTypes.DATE, allowNull: false }
  }, { tableName: 'token_revocations', timestamps: false });

  TokenRevocation.associate = (models) => {
    TokenRevocation.belongsTo(models.User, { foreignKey: 'user_id' });
  };
  return TokenRevocation;
};
