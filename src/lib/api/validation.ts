import { z, ZodSchema, ZodError } from 'zod';
import { NextResponse } from 'next/server';

/**
 * API Validation Utilities
 *
 * Zod-based validation for API routes with proper error responses.
 */

/**
 * Common validation schemas
 */
export const schemas = {
  uuid: z.string().uuid('Invalid UUID format'),
  positiveInt: z.number().int().positive(),
  email: z.string().email('Invalid email format'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
} as const;

/**
 * API Error Response
 */
export interface ApiError {
  error: string;
  details?: z.ZodIssue[];
  code?: string;
}

/**
 * Validate request body against a Zod schema
 *
 * Returns parsed data or a NextResponse with error details.
 */
export async function validateBody<T extends ZodSchema>(
  request: Request,
  schema: T
): Promise<{ data: z.infer<T>; error: null } | { data: null; error: NextResponse<ApiError> }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        data: null,
        error: NextResponse.json(
          {
            error: 'Validation failed',
            details: err.issues,
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        ),
      };
    }

    if (err instanceof SyntaxError) {
      return {
        data: null,
        error: NextResponse.json(
          {
            error: 'Invalid JSON body',
            code: 'INVALID_JSON',
          },
          { status: 400 }
        ),
      };
    }

    throw err;
  }
}

/**
 * Validate URL search params against a Zod schema
 */
export function validateParams<T extends ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): { data: z.infer<T>; error: null } | { data: null; error: NextResponse<ApiError> } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const data = schema.parse(params);
    return { data, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        data: null,
        error: NextResponse.json(
          {
            error: 'Invalid query parameters',
            details: err.issues,
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        ),
      };
    }
    throw err;
  }
}

/**
 * Create unauthorized response
 */
export function unauthorized(message = 'Unauthorized'): NextResponse<ApiError> {
  return NextResponse.json({ error: message, code: 'UNAUTHORIZED' }, { status: 401 });
}

/**
 * Create forbidden response
 */
export function forbidden(message = 'Forbidden'): NextResponse<ApiError> {
  return NextResponse.json({ error: message, code: 'FORBIDDEN' }, { status: 403 });
}

/**
 * Create not found response
 */
export function notFound(message = 'Not found'): NextResponse<ApiError> {
  return NextResponse.json({ error: message, code: 'NOT_FOUND' }, { status: 404 });
}

/**
 * Create internal server error response
 */
export function serverError(message = 'Internal server error'): NextResponse<ApiError> {
  return NextResponse.json({ error: message, code: 'INTERNAL_ERROR' }, { status: 500 });
}

/**
 * Log API error for debugging (in development or with proper logging)
 */
export function logApiError(route: string, error: unknown): void {
  console.error(`[API Error] ${route}:`, error);
}
