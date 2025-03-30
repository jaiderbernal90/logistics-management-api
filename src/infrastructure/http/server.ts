import express, { Router } from 'express';
import http from 'http';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import logger from '../logger';
import { initializeDatabase } from '../database/database.config';
import { WebSocketService } from '../services/websocket/websocket.service';

interface Options {
  port: number;
  routes: Router;
  public_path?: string;
}

export class Server {
  private app = express();
  private httpServer: http.Server;
  private readonly port: number;
  private readonly routes: Router;

  constructor(options: Options) {
    const { port, routes } = options;
    this.port = port;
    this.routes = routes;

    this.httpServer = http.createServer(this.app);
  }

  async start() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(compression());
    this.app.use(helmet());
    this.app.use(cors());

    this.app.use('/api/v1', this.routes);

    const dbConnected = await initializeDatabase();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    this.app.use((err, req, res, next) => {
      logger.error('Unhandled error', err);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    });

    WebSocketService.getInstance(this.httpServer);

    this.httpServer.listen(this.port, () => {
      logger.info(`Server running on port ${this.port}`);
    });

    return this.app;
  }
}
