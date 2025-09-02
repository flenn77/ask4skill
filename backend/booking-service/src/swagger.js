const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Booking Service API', version: '1.0.0' },
    servers: [{ url: `http://localhost:${process.env.PORT || 5000}` }],
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [ path.resolve(__dirname, 'routes/**/*.js') ]
};
const swaggerSpec = swaggerJSDoc(options);
module.exports = { swaggerUi, swaggerSpec };
