'use strict';

module.exports = (sequelize, DataTypes) => {
  const Indisponibilite = sequelize.define('Indisponibilite', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    coach_id: { type: DataTypes.UUID, allowNull: false },
    jour: { type: DataTypes.ENUM('lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'), allowNull: true },
    heure_debut: { type: DataTypes.TIME, allowNull: false },
    heure_fin: { type: DataTypes.TIME, allowNull: false },
    type: { type: DataTypes.ENUM('repetitif','unique'), allowNull: false, defaultValue: 'repetitif' },
    date_unique: { type: DataTypes.DATEONLY, allowNull: true },
    slot_max_par_heure: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    actif: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    tableName: 'indisponibilites',
    timestamps: true,
    createdAt: 'date_creation',
    updatedAt: 'date_modification'
  });

  Indisponibilite.associate = (models) => {
    Indisponibilite.belongsTo(models.CoachProfile, { foreignKey: 'coach_id', as: 'coach' });
  };

  return Indisponibilite;
};
