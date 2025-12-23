import { BadRequestError } from '../errors/customErrors.js';

// Regex for validating any UUID version (1-5) with correct variant
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateUUID(id: string): void {
  if (!id || typeof id !== 'string' || !uuidRegex.test(id.trim())) {
    throw new BadRequestError('Invalid UUID format');
  }
}