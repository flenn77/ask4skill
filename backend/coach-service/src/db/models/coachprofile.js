'use strict';

module.exports = (sequelize, DataTypes) => {
  const CoachProfile = sequelize.define('CoachProfile', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    titre: { type: DataTypes.STRING(255), allowNull: false },
    devise: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'EUR' },
    prix_par_heure: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    prix_replay: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    prix_session_groupe: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    compte_stripe_id: { type: DataTypes.STRING(255), allowNull: true },
    disponible_actuellement: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    disponibilite_auto: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    est_certifie: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    tableName: 'coach_profiles',
    timestamps: true,
    createdAt: 'date_creation',
    updatedAt: 'date_modification'
  });

  CoachProfile.associate = (models) => {
    CoachProfile.hasMany(models.CoachPalmares, { foreignKey: 'coach_id', as: 'palmares' });
    CoachProfile.hasMany(models.CoachGame, { foreignKey: 'coach_id', as: 'games' });
    CoachProfile.hasMany(models.CoachSpecialite, { foreignKey: 'coach_id', as: 'specialites' });
    CoachProfile.hasMany(models.Indisponibilite, { foreignKey: 'coach_id', as: 'indisponibilites' });
  };

  return CoachProfile;
};
