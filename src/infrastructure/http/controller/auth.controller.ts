import { Request, Response } from 'express';

import { createLogger } from '../../../infrastructure/logger';
import { LoginUseCase } from '@/application/use-cases/auth/login';
import { RegisterUseCase } from '@/application/use-cases/auth/register';

const logger = createLogger('auth-controller');
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario (debe ser único)
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña (mínimo 8 caracteres)
 *               role:
 *                 type: string
 *                 enum: [CUSTOMER, ADMIN, DRIVER]
 *                 description: Rol del usuario (opcional, por defecto es CUSTOMER)
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Datos de registro inválidos
 *       409:
 *         description: El correo electrónico ya está registrado
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión en el sistema
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT para autenticación
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Datos de login inválidos
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 */
export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUserUseCase: LoginUseCase,
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.registerUseCase.execute(req.body);

      res.status(201).json({
        message: 'User registered successfully',
        user,
      });
    } catch (error: any) {
      logger.error('Error in register controller', error);
      res.status(500).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const authResponse = await this.loginUserUseCase.execute(req.body);

      res.status(200).json(authResponse);
    } catch (error: any) {
      logger.error('Error in login controller', error);
      res.status(500).json({ message: error.message });
    }
  }
}
