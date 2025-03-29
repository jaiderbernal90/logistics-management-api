import dotenv from 'dotenv';

dotenv.config();

export default {
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10),

  db: {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },

  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
