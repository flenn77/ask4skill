// src/index.js
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

app.listen(port, () => console.log(`🚀 coach-service lancé sur :${port}`));
