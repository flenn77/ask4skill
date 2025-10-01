require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { swaggerUi, swaggerSpec } = require('./swagger');
const router = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.set('trust proxy', true);

app.get('/', (_, res) => res.send('coach-service OK'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', router);

// Error handler en dernier
app.use(errorHandler);

// (Optionnel) activer un sync auto en dev si besoin : DB_SYNC=true npm run dev
if (process.env.DB_SYNC === 'true') {
  const db = require('./db/models');
  db.sequelize.sync({ alter: true })
    .then(() => console.log('✅ DB sync OK'))
    .catch(err => console.error('❌ DB sync error', err));
}

app.listen(port, () => console.log(`🚀 coach-service lancé sur :${port}`));
