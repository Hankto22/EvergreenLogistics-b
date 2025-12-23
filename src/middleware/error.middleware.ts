import type { MiddlewareHandler } from 'hono';
import { CustomError } from '../errors/customErrors.js';

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);
    if (error && typeof error === 'object' && 'statusCode' in error && 'code' in error) {
      // For CustomError instances, return consistent payload
      const customError = error as any;
      return (c.status(customError.statusCode) as any).json({
        code: customError.code,
        message: customError.message,
        details: customError.details || undefined
      });
    }

    // For unknown errors, return consistent payload
    return (c.status(500) as any).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal Server Error'
    });
  }
};