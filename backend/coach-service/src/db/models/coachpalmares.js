'use strict';

module.exports = (sequelize, DataTypes) => {
  const CoachPalmares = sequelize.define('CoachPalmares', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    coach_id: { type: DataTypes.UUID, allowNull: false },
    titre: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    annee: { type: DataTypes.SMALLINT, allowNull: true }
  }, {
    tableName: 'coach_palmares',
    timestamps: true,
    createdAt: 'date_creation',
    updatedAt: 'date_modification'
  });

  CoachPalmares.associate = (models) => {
    CoachPalmares.belongsTo(models.CoachProfile, { foreignKey: 'coach_id', as: 'coach' });
  };

  return CoachPalmares;
};
