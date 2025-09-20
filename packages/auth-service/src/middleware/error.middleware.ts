import type { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { AppError } from '../utils/errors.js';

/**
 * Global error handler for Fastify
 */
export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  // Log error
  request.log.error(error);

  // Handle known application errors
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      }
    });
    return;
  }

  // Handle Fastify validation errors
  if (error.validation) {
    reply.status(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.validation,
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id
      }
    });
    return;
  }

  // Handle unknown errors
  reply.status(error.statusCode || 500).send({
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.id
    }
  });
}
