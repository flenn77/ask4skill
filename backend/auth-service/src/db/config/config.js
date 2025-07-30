// src/db/config/config.js
require('dotenv').config();

const baseConfig = {
  dialect: 'mysql',
  logging: false,
};

module.exports = {
  development: process.env.DATABASE_URL
    ? {
        use_env_variable: 'DATABASE_URL',
        ...baseConfig,
      }
    : {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        ...baseConfig,
      },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: `${process.env.DB_NAME}_test`,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    ...baseConfig,
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    ...baseConfig,
  },
};

