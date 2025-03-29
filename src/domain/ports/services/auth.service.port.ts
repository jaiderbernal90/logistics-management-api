
export const AUTH_SERVICE_TOKEN = 'AUTH_SERVICE_TOKEN';

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export interface IAuthService {
  generateToken(user: TokenPayload): string;
  verifyToken(token: string): Promise<boolean | TokenPayload>;
}
