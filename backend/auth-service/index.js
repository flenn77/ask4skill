// index.js
require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const { swaggerUi, swaggerSpec } = require('./src/swagger');
const db            = require('./src/db/models');  // Sequelize + tous les modèles
const authRouter    = require('./src/routes');     // notre index des routes Auth

const app  = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route racine
app.get('/', (req, res) => res.send('Service auth-service OK'));

// Routes d’authentification
app.use('/auth', authRouter);

// Synchronisation des modèles → création / mise à jour des tables
db.sequelize.sync({ alter: true })
  .then(() => console.log('✅ Tables synchronisées'))
  .catch(err => console.error('❌ Échec sync:', err));

app.listen(port, () => {
  console.log(`🚀 auth-service lancé sur le port ${port}`);
});
