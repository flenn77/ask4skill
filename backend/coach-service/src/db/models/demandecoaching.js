'use strict';

module.exports = (sequelize, DataTypes) => {
  const DemandeCoaching = sequelize.define('DemandeCoaching', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    joueur_id: { type: DataTypes.UUID, allowNull: false },
    coach_id:  { type: DataTypes.UUID, allowNull: false },

    type: { type: DataTypes.ENUM('INDIVIDUEL','GROUPE','REPLAY','LIVE'), allowNull: false },

    date_debut: { type: DataTypes.DATE, allowNull: true },
    duree_min:  { type: DataTypes.INTEGER, allowNull: true },

    prix_centimes: { type: DataTypes.INTEGER, allowNull: false },
    devise: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'EUR' },

    statut: {
      type: DataTypes.ENUM('EN_ATTENTE','ACCEPTEE','REFUSEE','ANNULEE','EXPIREE','ARCHIVEE'),
      allowNull: false,
      defaultValue: 'EN_ATTENTE'
    },

    message_joueur: { type: DataTypes.TEXT, allowNull: true },
    raison_refus:   { type: DataTypes.TEXT, allowNull: true },
    conversation_id:{ type: DataTypes.STRING(64), allowNull: true },
    date_archive:   { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: 'demandes_coaching',
    timestamps: true,
    createdAt: 'date_creation',
    updatedAt: 'date_modification'
  });

  DemandeCoaching.associate = (models) => {
    DemandeCoaching.belongsTo(models.CoachProfile, { foreignKey: 'coach_id', as: 'coach' });
  };

  return DemandeCoaching;
};
