import type { FastifyRequest, FastifyReply } from 'fastify';
import { JWTUtils } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';
import config from '../utils/config.js';

/**
 * Middleware to validate JWT token and extract user information
 */
export async function authMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    const token = JWTUtils.extractBearerToken(authHeader);

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const payload = JWTUtils.verifyToken(token, config.JWT_SECRET);

    // Attach user info to request
    (request as any).user = payload;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Invalid or expired token');
  }
}
