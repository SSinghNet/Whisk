import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Whisk API',
      version: '1.0.0',
      description: 'API documentation for the Whisk backend',
    },

    servers: [
        {
            url: "http://localhost:3000",
            description: "Local development server",
        },
        {
            url: "https://whisk-lznv.onrender.com",
            description: "Production server",
        },
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js', './src/app.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;