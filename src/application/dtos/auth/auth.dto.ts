import { CreateUserDto, UserDto } from '../user/user.dto';

export interface RegisterUserDto extends CreateUserDto {}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  user: UserDto;
}
