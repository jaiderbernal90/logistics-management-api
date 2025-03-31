import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import envs from '../config/envs';

dotenv.config();

const pool = mysql.createPool({
  host: envs.db.host,
  port: envs.db.port,
  user: envs.db.user,
  password: envs.db.password,
  database: envs.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = {
  query: async (sql: string, params?: any[]): Promise<any> => {
    const [results] = await pool.execute(sql, params);
    return results;
  },

  transaction: async <T>(
    callback: (connection: mysql.PoolConnection) => Promise<T>,
  ): Promise<T> => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (e) {
      await connection.rollback();
      throw e;
    } finally {
      connection.release();
    }
  },

  end: async (): Promise<void> => {
    await pool.end();
  },
};

export const initializeDatabase = async (): Promise<boolean> => {
  try {
    await db.query('SELECT 1');
    console.log('MySQL connected successfully');
    return true;
  } catch (error) {
    console.error('MySQL connection failed:', error);
    throw error;
  }
};
