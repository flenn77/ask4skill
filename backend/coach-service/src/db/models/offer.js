'use strict';
module.exports = (sequelize, DataTypes) => {
  const Offer = sequelize.define('Offer', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    coach_id: { type: DataTypes.UUID, allowNull: false },
    type: { type: DataTypes.ENUM('INDIVIDUEL','GROUPE','REPLAY','LIVE'), allowNull: false },
    titre: { type: DataTypes.STRING(120), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    duree_min: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60 },
    prix_centimes: { type: DataTypes.INTEGER, allowNull: false },
    devise: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'EUR' },
    actif: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    tableName: 'offers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Offer.associate = (models) => {
    Offer.belongsTo(models.CoachProfile, { foreignKey: 'coach_id', as: 'coach' });
  };

  return Offer;
};
