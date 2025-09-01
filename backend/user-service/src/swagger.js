// src/swagger.js
const path        = require('path');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Service API',
      version: '1.0.0',
      description: 'Gestion des profils utilisateurs',
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 5000}` }
    ],
  },
  apis: [ path.resolve(__dirname, 'routes/**/*.js') ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
