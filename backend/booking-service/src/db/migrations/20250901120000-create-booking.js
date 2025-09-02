'use strict';
module.exports = {
  async up(qi, Sequelize) {
    await qi.createTable('bookings', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('(UUID())'), allowNull: false, primaryKey: true },
      offer_id: { type: Sequelize.UUID, allowNull: false },
      coach_profile_id: { type: Sequelize.UUID, allowNull: false },
      player_id: { type: Sequelize.UUID, allowNull: false },
      start_at: { type: Sequelize.DATE, allowNull: false },
      end_at: { type: Sequelize.DATE, allowNull: false },
      price_centimes: { type: Sequelize.INTEGER, allowNull: false },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'EUR' },
      status: { type: Sequelize.ENUM('PENDING','PAID','CONFIRMED','DONE','DISPUTED','CANCELLED'), allowNull: false, defaultValue: 'PENDING' },
      coach_approved: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      player_approved: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      stripe_payment_intent_id: { type: Sequelize.STRING(100), allowNull: true },
      stripe_payment_status: { type: Sequelize.STRING(50), allowNull: true },
      stripe_transfer_id: { type: Sequelize.STRING(100), allowNull: true },
      transfer_released_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: true, defaultValue: null }
    });
    await qi.addIndex('bookings', ['player_id']);
    await qi.addIndex('bookings', ['coach_profile_id']);
    await qi.addIndex('bookings', ['status']);
    await qi.addIndex('bookings', ['start_at','end_at']);
  },
  async down(qi) {
    await qi.dropTable('bookings');
  }
};
