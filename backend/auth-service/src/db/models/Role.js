'use strict';
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: { type: DataTypes.SMALLINT, primaryKey: true },
    nom: { type: DataTypes.STRING(20), allowNull: false, unique: true }
  }, { tableName: 'roles', timestamps: false });

  Role.associate = (models) => {
    Role.hasMany(models.User, { foreignKey: 'role_id' });
  };
  return Role;
};
