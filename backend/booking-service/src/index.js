require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { swaggerUi, swaggerSpec } = require('./swagger');
const db = require('./db/models');
const stripeWebhook = require('./routes/stripe');
const bookings = require('./routes/bookings');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.use('/stripe', stripeWebhook);
app.use(express.json());

app.get('/', (_, res) => res.send('booking-service OK'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/bookings', bookings);

async function waitDb(sequelize, retries = 20, delayMs = 1500) {
  for (let i = 1; i <= retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('✅ DB reachable');
      return;
    } catch (e) {
      console.log(`⏳ DB not ready (try ${i}/${retries})...`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw new Error('DB not reachable after retries');
}

(async () => {
  try {
    await waitDb(db.sequelize);
    await db.sequelize.sync({ alter: true });
    console.log('✅ DB sync OK');
  } catch (err) {
    console.error('❌ DB init error', err);
  }
})();

app.listen(port, () => console.log(`🚀 booking-service lancé sur :${port}`));
