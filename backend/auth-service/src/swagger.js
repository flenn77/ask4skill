// src/swagger.js
const path = require('path');
const swaggerJSDoc  = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description: 'Endpoints pour l’authentification (register, login, reset password, OAuth)',
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 5000}` }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [
    path.resolve(__dirname, 'routes/**/*.js')
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
