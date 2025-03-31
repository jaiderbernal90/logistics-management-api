import { User } from '@/domain/entities/user.entity';

export const AUTH_REPOSITORY_TOKEN = 'AUTH_REPOSITORY_TOKEN';

export interface AuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  validatePassword(password: string, hashedPassword: string): Promise<boolean>;
}
