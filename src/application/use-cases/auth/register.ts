import { UserRepository } from "@/domain/ports/repositories/user.repository.port";
import { RegisterUserDto } from "../../dtos/auth/auth.dto";
import { User, UserRole } from "@/domain/entities/user.entity";
import { generateHash } from "@/infrastructure/utils/handleBycript";

export class RegisterUseCase {
  constructor(
    private userRepository: UserRepository
  ) {}

  async execute(userData: RegisterUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado');
    }

    const hashedPassword = await generateHash(userData.password);

    const newUser: RegisterUserDto = {
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      role: (userData.role as UserRole) || UserRole.CUSTOMER
    };

    return await this.userRepository.create(newUser);
  }
}