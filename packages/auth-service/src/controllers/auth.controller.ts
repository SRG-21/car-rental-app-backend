import type { FastifyRequest, FastifyReply } from 'fastify';
import type { AuthService } from '../services/auth.service.js';
import {
  signupSchema,
  loginSchema,
  refreshSchema
} from '../utils/validation.js';
import { ValidationError } from '../utils/errors.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /signup - Create new user
   */
  signup = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const result = signupSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError('Invalid input', result.error.errors);
    }

    const authResponse = await this.authService.signup(result.data);

    reply.code(201).send({ data: authResponse });
  };

  /**
   * POST /login - Authenticate user
   */
  login = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const result = loginSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError('Invalid input', result.error.errors);
    }

    const authResponse = await this.authService.login(result.data);

    reply.code(200).send({ data: authResponse });
  };

  /**
   * POST /refresh - Refresh access token
   */
  refresh = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const result = refreshSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError('Invalid input', result.error.errors);
    }

    const refreshResponse = await this.authService.refreshToken(result.data.refreshToken);

    reply.code(200).send({ data: refreshResponse });
  };

  /**
   * GET /me - Get current user profile
   */
  me = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = (request as any).user?.userId;

    if (!userId) {
      reply.code(401).send({ error: 'Unauthorized' });
      return;
    }

    const user = await this.authService.getUserById(userId);

    reply.code(200).send({ data: user });
  };

  /**
   * POST /logout - Revoke refresh token
   */
  logout = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const result = refreshSchema.safeParse(request.body);

    if (!result.success) {
      throw new ValidationError('Invalid input', result.error.errors);
    }

    await this.authService.logout(result.data.refreshToken);

    reply.code(204).send();
  };
}
