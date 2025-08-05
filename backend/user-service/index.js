// index.js
require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const { swaggerUi, swaggerSpec } = require('./src/swagger');
const db          = require('./src/db/models');
const usersRouter = require('./src/routes');

const app  = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Healthcheck
app.get('/', (req, res) => res.send('Service user-service OK'));

// Routes « métier »
app.use('/users', usersRouter);

db.Profile.sync({ alter: true })
  .then(() => console.log('Table profiles synchronisée'))
  .catch(err => console.error('Échec sync profiles :', err));

app.listen(port, () => {
  console.log(`user-service lancé sur le port ${port}`);
});
