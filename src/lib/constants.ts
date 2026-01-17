/**
 * App Constants
 *
 * Centralized constants to avoid magic numbers and strings.
 */

// =============================================================================
// Time Constants
// =============================================================================

/** Trial period in days */
export const TRIAL_PERIOD_DAYS = 14;

/** Trial period in milliseconds */
export const TRIAL_PERIOD_MS = TRIAL_PERIOD_DAYS * 24 * 60 * 60 * 1000;

/** Session timeout in minutes */
export const SESSION_TIMEOUT_MINUTES = 30;

/** Session timeout in milliseconds */
export const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_MINUTES * 60 * 1000;

// =============================================================================
// Pagination Constants
// =============================================================================

/** Default page size for lists */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum page size allowed */
export const MAX_PAGE_SIZE = 100;

// =============================================================================
// Validation Constants
// =============================================================================

/** Minimum password length */
export const MIN_PASSWORD_LENGTH = 8;

/** Maximum file upload size in bytes (5MB) */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** Allowed image MIME types */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

// =============================================================================
// Business Constants
// =============================================================================

/** Maximum tables per restaurant */
export const MAX_TABLES_PER_RESTAURANT = 50;

/** Default table capacity */
export const DEFAULT_TABLE_CAPACITY = 4;

/** Maximum tip percentage */
export const MAX_TIP_PERCENTAGE = 30;

/** Default tip options */
export const TIP_OPTIONS = [0, 5, 10, 15, 20] as const;

// =============================================================================
// API Constants
// =============================================================================

/** API rate limit - requests per minute */
export const API_RATE_LIMIT_PER_MINUTE = 60;

/** Maximum retry attempts for failed operations */
export const MAX_RETRY_ATTEMPTS = 3;

/** Retry delay in milliseconds */
export const RETRY_DELAY_MS = 1000;
