import {
  AuthResponseDto,
  LoginUserDto,
} from '@/application/dtos/auth/auth.dto';
import { UserDto } from '@/application/dtos/user/user.dto';
import { UserRepository } from '@/domain/ports/repositories/user.repository.port';
import { IAuthService } from '@/domain/ports/services/auth.service.port';
import { compareHash } from '@/infrastructure/utils/handleBycript';

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authSvc: IAuthService,
  ) {}

  async execute(credentials: LoginUserDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await compareHash(
      credentials.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.authSvc.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });


    const userDto: UserDto = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return {
      token,
      user: userDto,
    };
  }
}
