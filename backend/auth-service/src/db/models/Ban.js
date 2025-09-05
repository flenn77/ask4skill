'use strict';
module.exports = (sequelize, DataTypes) => {
  const Ban = sequelize.define('Ban', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    admin_id: { type: DataTypes.UUID, allowNull: false },
    raison: { type: DataTypes.TEXT, allowNull: false },
    date_ban: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    date_expiration: { type: DataTypes.DATE, allowNull: true },
    actif: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, { tableName: 'bans', timestamps: false });

  Ban.associate = (models) => {
    Ban.belongsTo(models.User, { foreignKey: 'user_id', as: 'banni' });
    Ban.belongsTo(models.User, { foreignKey: 'admin_id', as: 'moderateur' });
  };
  return Ban;
};
