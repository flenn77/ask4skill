'use strict';
module.exports = (sequelize, DataTypes) => {
  const CoachProfile = sequelize.define('CoachProfile', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    bio_coach: { type: DataTypes.TEXT, allowNull: true },
    langues: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    jeux: { type: DataTypes.JSON, allowNull: false, defaultValue: ["VALORANT"] },
    reseaux: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    structure: { type: DataTypes.STRING(120), allowNull: true },
    palmares: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    stripe_account_id: { type: DataTypes.STRING(100), allowNull: true }
  }, {
    tableName: 'coach_profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  CoachProfile.associate = (models) => {
    CoachProfile.hasMany(models.Offer, { foreignKey: 'coach_id', as: 'offers' });
    CoachProfile.hasMany(models.Availability, { foreignKey: 'coach_id', as: 'availabilities' });
  };

  return CoachProfile;
};
