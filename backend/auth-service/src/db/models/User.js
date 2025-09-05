'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    // MCD
    role_id: { type: DataTypes.SMALLINT, allowNull: false }, // FK → roles.id
    pseudo: { type: DataTypes.STRING(32), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
    mot_de_passe: { type: DataTypes.CHAR(60), allowNull: false }, // hash bcrypt
    prenom: { type: DataTypes.STRING(50), allowNull: true },
    nom: { type: DataTypes.STRING(50), allowNull: true },
    sexe_id: { type: DataTypes.TINYINT, allowNull: true }, // FK → sexes.id
    date_naissance: { type: DataTypes.DATEONLY, allowNull: true },
    telephone: { type: DataTypes.STRING(20), allowNull: true },
    pays: { type: DataTypes.CHAR(2), allowNull: true },
    ville: { type: DataTypes.STRING(100), allowNull: true },
    langue_principale: { type: DataTypes.CHAR(5), allowNull: true },
    niveau_id: { type: DataTypes.TINYINT, allowNull: true }, // FK → levels.id
    description: { type: DataTypes.TEXT, allowNull: true },
    date_inscription: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    derniere_connexion: { type: DataTypes.DATE, allowNull: true },
    is_email_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    tableName: 'users',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['email'] },
      { unique: true, fields: ['pseudo'] }
    ]
  });

  User.associate = (models) => {
    User.belongsTo(models.Role, { foreignKey: 'role_id' });
    User.belongsTo(models.Sex, { foreignKey: 'sexe_id' });
    User.belongsTo(models.Level, { foreignKey: 'niveau_id' });
    User.hasMany(models.UsersProvider, { foreignKey: 'user_id' });
    User.hasMany(models.UserLanguage, { foreignKey: 'user_id' });
    User.hasMany(models.Ban, { foreignKey: 'user_id', as: 'bans' });
  };

  return User;
};
