'use strict';
module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    offer_id: { type: DataTypes.UUID, allowNull: false },
    coach_profile_id: { type: DataTypes.UUID, allowNull: false },
    player_id: { type: DataTypes.UUID, allowNull: false },
    start_at: { type: DataTypes.DATE, allowNull: false },
    end_at: { type: DataTypes.DATE, allowNull: false },
    price_centimes: { type: DataTypes.INTEGER, allowNull: false },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'EUR' },
    status: { type: DataTypes.ENUM('PENDING','PAID','CONFIRMED','DONE','DISPUTED','CANCELLED'), allowNull: false, defaultValue: 'PENDING' },
    coach_approved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    player_approved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    stripe_payment_intent_id: { type: DataTypes.STRING(100), allowNull: true },
    stripe_payment_status: { type: DataTypes.STRING(50), allowNull: true },
    stripe_transfer_id: { type: DataTypes.STRING(100), allowNull: true },
    transfer_released_at: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: 'bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Booking;
};
