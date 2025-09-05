'use strict';

module.exports = (sequelize, DataTypes) => {
  const CoachSpecialite = sequelize.define('CoachSpecialite', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    coach_id: { type: DataTypes.UUID, allowNull: false },
    specialty: { type: DataTypes.STRING(50), allowNull: false }
  }, {
    tableName: 'coach_specialites',
    timestamps: true,
    createdAt: 'date_creation',
    updatedAt: 'date_modification',
    indexes: [{ unique: true, fields: ['coach_id', 'specialty'] }]
  });

  CoachSpecialite.associate = (models) => {
    CoachSpecialite.belongsTo(models.CoachProfile, { foreignKey: 'coach_id', as: 'coach' });
  };

  return CoachSpecialite;
};
