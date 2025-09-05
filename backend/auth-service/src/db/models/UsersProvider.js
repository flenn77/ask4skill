'use strict';
module.exports = (sequelize, DataTypes) => {
  const UsersProvider = sequelize.define('UsersProvider', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    provider: { type: DataTypes.STRING(20), allowNull: false },
    provider_user_id: { type: DataTypes.STRING(64), allowNull: false }
  }, { tableName: 'users_provider', timestamps: false });

  UsersProvider.associate = (models) => {
    UsersProvider.belongsTo(models.User, { foreignKey: 'user_id' });
  };
  return UsersProvider;
};
