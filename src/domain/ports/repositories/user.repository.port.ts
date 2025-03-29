import { CreateUserDto } from '@/application/dtos/user/user.dto';
import { User } from '@/domain/entities/user.entity';
import { UserValue } from '@/domain/values/user.value';

export interface UserRepository {
  findById(id: number): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  create(user: CreateUserDto): Promise<User>;
  update(id: number, user: Partial<User>): Promise<User | null>;
}
