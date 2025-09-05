require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const db          = require('./src/db/models');

const app  = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




db.sequelize.sync({ alter: true })
  .then(() => console.log('✅ Tables synchronisées'))
  .catch(err => console.error('❌ Échec sync :', err));

app.listen(port, () => {
  console.log(`🚀 user-service lancé sur le port ${port}`);
});
