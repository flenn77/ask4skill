'use strict';
module.exports = (sequelize, DataTypes) => {
  const Availability = sequelize.define('Availability', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    coach_id: { type: DataTypes.UUID, allowNull: false },
    start_at: { type: DataTypes.DATE, allowNull: false },
    end_at: { type: DataTypes.DATE, allowNull: false },
    timezone: { type: DataTypes.STRING(60), allowNull: false, defaultValue: 'Europe/Paris' },
    rrule: { type: DataTypes.STRING(255), allowNull: true }
  }, {
    tableName: 'availabilities',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Availability.associate = (models) => {
    Availability.belongsTo(models.CoachProfile, { foreignKey: 'coach_id', as: 'coach' });
  };

  return Availability;
};
