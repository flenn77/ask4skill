// src/db/config/config.js
require('dotenv').config();
const base = { dialect: 'mysql', logging: false };
module.exports = {
  development: process.env.DATABASE_URL
    ? { use_env_variable: 'DATABASE_URL', ...base }
    : {
        host:     process.env.DB_HOST,
        port:     process.env.DB_PORT,
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ...base
      },
  test: { /* idem */ },
  production: { use_env_variable: 'DATABASE_URL', ...base }
};
