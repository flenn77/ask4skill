'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserLanguage = sequelize.define('UserLanguage', {
    user_id: { type: DataTypes.UUID, primaryKey: true },
    lang_code: { type: DataTypes.CHAR(5), primaryKey: true }
  }, { tableName: 'user_languages', timestamps: false });

  UserLanguage.associate = (models) => {
    UserLanguage.belongsTo(models.User, { foreignKey: 'user_id' });
  };
  return UserLanguage;
};
