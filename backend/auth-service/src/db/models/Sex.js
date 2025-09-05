'use strict';
module.exports = (sequelize, DataTypes) => {
  const Sex = sequelize.define('Sex', {
    id: { type: DataTypes.TINYINT, primaryKey: true },
    label: { type: DataTypes.STRING(20), allowNull: false, unique: true }
  }, { tableName: 'sexes', timestamps: false });

  Sex.associate = (models) => {
    Sex.hasMany(models.User, { foreignKey: 'sexe_id' });
  };
  return Sex;
};
