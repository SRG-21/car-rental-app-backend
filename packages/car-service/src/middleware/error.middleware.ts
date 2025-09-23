import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import {
  ValidationError,
  NotFoundError,
  ConflictError
} from '../utils/errors.js';
import { ZodError } from 'zod';

/**
 * Global error handler for the Car service
 */
export async function errorMiddleware(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  request.log.error(error);

  // Zod validation errors
  if (error instanceof ZodError) {
    reply.code(400).send({
      success: false,
      error: {
        message: 'Validation failed',
        details: error.errors
      }
    });
    return;
  }

  // Custom application errors
  if (error instanceof ValidationError) {
    reply.code(400).send({
      success: false,
      error: { message: error.message }
    });
    return;
  }

  if (error instanceof NotFoundError) {
    reply.code(404).send({
      success: false,
      error: { message: error.message }
    });
    return;
  }

  if (error instanceof ConflictError) {
    reply.code(409).send({
      success: false,
      error: { message: error.message }
    });
    return;
  }

  // Default 500 error
  reply.code(500).send({
    success: false,
    error: {
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && {
        details: error.message
      })
    }
  });
}
