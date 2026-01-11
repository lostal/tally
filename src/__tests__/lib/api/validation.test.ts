import { describe, it, expect, vi } from 'vitest';
import { validateBody, unauthorized, forbidden, notFound, serverError } from '@/lib/api/validation';
import { z } from 'zod';

describe('API Validation Utilities', () => {
  describe('validateBody', () => {
    const testSchema = z.object({
      name: z.string().min(1),
      age: z.number().int().positive(),
    });

    it('should parse valid JSON body', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({ name: 'John', age: 25 }),
      } as unknown as Request;

      const result = await validateBody(mockRequest, testSchema);

      expect(result.error).toBeNull();
      expect(result.data).toEqual({ name: 'John', age: 25 });
    });

    it('should return validation error for invalid data', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({ name: '', age: -5 }),
      } as unknown as Request;

      const result = await validateBody(mockRequest, testSchema);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      // Check that it's a Response with status 400
      expect(result.error?.status).toBe(400);
    });

    it('should return error for invalid JSON', async () => {
      const mockRequest = {
        json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
      } as unknown as Request;

      const result = await validateBody(mockRequest, testSchema);

      expect(result.data).toBeNull();
      expect(result.error?.status).toBe(400);
    });
  });

  describe('Error Response Helpers', () => {
    it('unauthorized should return 401', () => {
      const response = unauthorized();
      expect(response.status).toBe(401);
    });

    it('unauthorized with custom message should include message', async () => {
      const response = unauthorized('Custom message');
      const body = await response.json();
      expect(body.error).toBe('Custom message');
    });

    it('forbidden should return 403', () => {
      const response = forbidden();
      expect(response.status).toBe(403);
    });

    it('notFound should return 404', () => {
      const response = notFound();
      expect(response.status).toBe(404);
    });

    it('serverError should return 500', () => {
      const response = serverError();
      expect(response.status).toBe(500);
    });
  });
});
