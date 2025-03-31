import winston from "winston";
import appConfig from "../config/envs";

const { combine, timestamp, printf, colorize } = winston.format;

const customFormat = printf(({ level, message, timestamp, module, ...meta }) => {
  return `${timestamp} [${module || 'app'}] ${level}: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta) : ''
  }`;
});

export function createLogger(module: string) {
  return winston.createLogger({
    level: appConfig.logging.level,
    format: combine(
      timestamp(),
      customFormat
    ),
    defaultMeta: { module },
    transports: [
      new winston.transports.Console({
        format: combine(
          colorize(),
          timestamp(),
          customFormat
        )
      }),
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: 'logs/combined.log' 
      })
    ]
  });
}

export default createLogger('app');