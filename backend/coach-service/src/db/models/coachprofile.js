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
    est_certifie: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

    // ---- Ajouts pour gestion du calendrier / politique de réservation
    fuseau_horaire: { type: DataTypes.STRING(64), allowNull: false, defaultValue: 'Europe/Paris' },
    duree_slot_min: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60 },
    delai_min_prise_rdv_min: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60 },
    delai_max_anticipation_jours: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 },
    acceptation_mode: { type: DataTypes.ENUM('MANUEL','AUTO'), allowNull: false, defaultValue: 'MANUEL' },
    annulation_autorisee_heures: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 24 }
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
    // ⚠️ Supprimé : Indisponibilite / Disponibilite (modèles retirés)
  };

  return CoachProfile;
};
