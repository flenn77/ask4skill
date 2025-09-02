require('dotenv').config();
const base = { dialect: 'mysql', logging: false };
module.exports = {
  development: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ...base
  },
  test: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME + '_test',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ...base
  },
  production: { use_env_variable: 'DATABASE_URL', ...base }
};
