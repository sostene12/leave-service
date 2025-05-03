import swaggerJSDoc from "swagger-jsdoc";
import dotenv from "dotenv";

dotenv.config();

const swaggerServer_prod = process.env.SWAGGER_SERVER || "https://leave-service-api.onrender.com";

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Leave Management Service API",
      version: "1.0.0",
      description: "API Documentation for the Leave Management Service",
    },
    servers: [
      { url: `${swaggerServer_prod}` },
      { url: `http://localhost:3000` },
    ],
    components: {
      securitySchemes: {
        Authorization: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""
        },
      },
    },
    security: [{
      Authorization: []
    }]
  },
  apis: ["./docs/*.yaml"],
};

export const swaggerSpecs = swaggerJSDoc(options);