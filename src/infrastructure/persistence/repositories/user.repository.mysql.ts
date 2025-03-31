import { User, UserRole } from '@/domain/entities/user.entity';
import { UserRepository } from '@/domain/ports/repositories/user.repository.port';
import { UserId } from '@/domain/values/user.value';
import { db } from '@/infrastructure/database/database.config';

export class MysqlUserRepository implements UserRepository {
  constructor() {}

  async findById(id: UserId): Promise<User | null> {
    const query = `
      SELECT id, name, email, password, role, created_at, updated_at
      FROM users
      WHERE id = ?
    `;
    
    const results = await db.query(query, [id]);
    
    if (!results || results.length === 0) {
      return null;
    }
    
    const userData = results[0];
    
    return userData;
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, name, email, password, role, created_at, updated_at
      FROM users
      WHERE email = ?
    `;
    
    const results = await db.query(query, [email]);
    
    if (!results || results.length === 0) {
      return null;
    }
    
    const userData = results[0];
    
    return userData;
  }

  async create(user: User): Promise<User> {
    const query = `
      INSERT INTO users (name, email, password, role, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const values = [
      user.name,
      user.email,
      user.password,
      user.role,
      new Date()
    ];
    
    await db.query(query, values);
    
    return user;
  }

  async update(id: string | number, user: User): Promise<User> {
    const query = `
      UPDATE users
      SET name = ?, email = ?, password = ?, role = ?, updated_at = ?
      WHERE id = ?
    `;
    
    const values = [
      user.name,
      user.email,
      user.password,
      user.role,
      new Date(),
      id,
    ];
    
    const result = await db.query(query, values);
    
    if (!result || result.affectedRows === 0) {
      throw new Error('User not found');
    }
    
    return user;
  }

  async delete(id: UserId): Promise<boolean> {
    const query = `
      DELETE FROM users
      WHERE id = ?
    `;
    
    const result = await db.query(query, [id]);
    
    return result && result.affectedRows > 0;
  }
}