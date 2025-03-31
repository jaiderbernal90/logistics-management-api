import { CreateUserDto } from '@/application/dtos/user/user.dto';
import { User } from '@/domain/entities/user.entity';

export interface UserRepository {
  findById(id: number): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  create(user: CreateUserDto): Promise<User>;
  update(id: number, user: Partial<User>): Promise<User | null>;
}
