'use strict';
module.exports = (sequelize, DataTypes) => {
  const Level = sequelize.define('Level', {
    id: { type: DataTypes.TINYINT, primaryKey: true },
    label: { type: DataTypes.STRING(20), allowNull: false, unique: true }
  }, { tableName: 'levels', timestamps: false });

  Level.associate = (models) => {
    Level.hasMany(models.User, { foreignKey: 'niveau_id' });
  };
  return Level;
};
