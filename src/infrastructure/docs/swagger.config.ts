// src/infrastructure/docs/swagger.config.ts

import { Express, Request, Response } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createLogger } from '@/infrastructure/logger';
import envs from '@/infrastructure/config/envs';

const logger = createLogger('swagger-config');

export const setupSwagger = (app: Express) => {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Coordinadora API',
        version: '1.0.0',
        description: 'API para gestión de envíos y logística',
        contact: {
          name: 'Soporte Coordinadora',
          email: 'soporte@coordinadora.com',
        },
      },
      servers: [
        {
          url: `http://localhost:${envs.port}/api/v1`,
          description: 'Servidor de desarrollo',
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      tags: [
        {
          name: 'Auth',
          description: 'Operaciones de autenticación',
        },
        {
          name: 'Shipments',
          description: 'Operaciones relacionadas con envíos',
        },
        {
          name: 'Reports',
          description: 'Reportes y estadísticas',
        },
        {
          name: 'Transporters',
          description: 'Operaciones relacionadas con transportistas',
        },
        {
          name: 'Routes',
          description: 'Operaciones relacionadas con rutas',
        },
      ],
    },
    apis: [
      './src/infrastructure/http/routes/*.ts',
      './src/infrastructure/http/controller/*.ts',
    ],
  };

  const specs = swaggerJsdoc(options);

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
  app.get('/api/docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  logger.info('Swagger documentation initialized at /api/docs');
};
