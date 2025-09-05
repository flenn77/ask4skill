'use strict';

module.exports = (sequelize, DataTypes) => {
  const CoachGame = sequelize.define('CoachGame', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    coach_id: { type: DataTypes.UUID, allowNull: false },
    game: { type: DataTypes.STRING(50), allowNull: false }
  }, {
    tableName: 'coach_games',
    timestamps: true,
    createdAt: 'date_creation',
    updatedAt: 'date_modification',
    indexes: [{ unique: true, fields: ['coach_id', 'game'] }]
  });

  CoachGame.associate = (models) => {
    CoachGame.belongsTo(models.CoachProfile, { foreignKey: 'coach_id', as: 'coach' });
  };

  return CoachGame;
};
