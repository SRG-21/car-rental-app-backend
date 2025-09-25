import type { FastifyRequest, FastifyReply } from 'fastify';
import { JWTUtils } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
    };
  }
}

/**
 * Authentication middleware - Verifies JWT token from Authorization header
 */
export async function authMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);

  try {
    const payload = JWTUtils.verifyToken(token, process.env.JWT_SECRET!);
    request.user = { id: payload.userId, email: payload.email };
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
