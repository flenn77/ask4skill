require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { swaggerUi, swaggerSpec } = require('./swagger');
const db = require('./db/models');
const router = require('./routes');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => res.send('coach-service OK'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', router);

db.sequelize.sync({ alter: true })
  .then(() => console.log('✅ DB sync OK'))
  .catch(err => console.error('❌ DB sync error', err));

app.listen(port, () => console.log(`🚀 coach-service lancé sur :${port}`));
