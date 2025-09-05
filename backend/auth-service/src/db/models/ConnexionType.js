'use strict';
module.exports = (sequelize, DataTypes) => {
  const ConnexionType = sequelize.define('ConnexionType', {
    id: { type: DataTypes.SMALLINT, primaryKey: true },
    label: { type: DataTypes.STRING(20), allowNull: false, unique: true }
  }, { tableName: 'connexion_types', timestamps: false });
  return ConnexionType;
};
