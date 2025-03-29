import { UserRole } from '@/domain/entities/user.entity';

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface UserDto {
  id: number;
  email: string;
  name: string;
  role?: UserRole;
}
