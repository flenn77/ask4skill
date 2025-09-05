'use strict';
module.exports = (sequelize, DataTypes) => {
  const LogConnexion = sequelize.define('LogConnexion', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    ip: { type: DataTypes.STRING, allowNull: true },
    user_agent: { type: DataTypes.TEXT, allowNull: true },
    date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, { tableName: 'log_connexion', timestamps: false });

  LogConnexion.associate = (models) => {
    LogConnexion.belongsTo(models.User, { foreignKey: 'user_id' });
  };
  return LogConnexion;
};
