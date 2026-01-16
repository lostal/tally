/**
 * URL Utilities for Tally
 *
 * Uses path-based routing (not subdomains) for simplicity.
 * See docs/ROUTING.md for the complete URL architecture.
 */

/**
 * Get the base app URL
 *
 * In development: http://localhost:3000
 * In production: https://app.paytally.app (or NEXT_PUBLIC_APP_URL)
 */
export function getAppUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Get the landing/marketing site URL
 *
 * In development: http://localhost:4321 (Astro)
 * In production: https://paytally.app
 */
export function getLandingUrl(): string {
  return process.env.NEXT_PUBLIC_LANDING_URL || 'http://localhost:4321';
}

/**
 * Build a URL for a specific route
 */
export function buildUrl(path: string): string {
  const base = getAppUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Build a customer QR URL for a table
 */
export function buildQrUrl(tableSlug: string): string {
  return buildUrl(`/go/${tableSlug}`);
}
