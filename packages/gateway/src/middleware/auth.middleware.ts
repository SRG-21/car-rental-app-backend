import type { FastifyRequest, FastifyReply } from 'fastify';
import { JWTUtils } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';
import config from '../utils/config.js';

/**
 * Middleware to validate JWT token in API Gateway
 */
export async function jwtValidationMiddleware(
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

    // Attach user info to request for downstream services
    (request as any).user = payload;

    // Add user info to headers for proxied requests
    request.headers['x-user-id'] = payload.userId;
    request.headers['x-user-email'] = payload.email;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Invalid or expired token');
  }
}
