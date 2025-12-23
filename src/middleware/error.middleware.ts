import type { MiddlewareHandler } from 'hono';
import { CustomError } from '../errors/customErrors.js';

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);
    if (error && typeof error === 'object' && 'statusCode' in error) {
      // For operational errors, return the error message and status code
      return (c.status((error as any).statusCode) as any).json({ message: (error as any).message });
    }

    // For unknown errors, return generic message
    return (c.status(500) as any).json({ message: 'Internal Server Error' });
  }
};