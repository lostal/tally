/**
 * Restaurant Configuration Types
 *
 * Each restaurant has its own theme and branding configuration
 * that is loaded dynamically based on the URL slug.
 */

/** Restaurant theme configuration for white-label styling */
export interface RestaurantTheme {
  /** Primary brand color in HSL format (hue, saturation, lightness) */
  primaryHue: number;
  primarySaturation: number;
  primaryLightness: number;
  /** Border radius multiplier (1 = default, higher = more rounded) */
  radiusMultiplier?: number;
}

/** Full restaurant configuration */
export interface Restaurant {
  /** Unique identifier (UUID) */
  id: string;
  /** URL-safe identifier (e.g., "trattoria-mario") */
  slug: string;
  /** Display name */
  name: string;
  /** Restaurant description (optional) */
  description?: string;
  /** Logo URL (optional) */
  logoUrl?: string;
  /** Cover image URL (optional) */
  coverImageUrl?: string;
  /** Physical address */
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  /** Theme configuration for white-label styling */
  theme: RestaurantTheme;
  /** Currency code (ISO 4217) */
  currency: 'EUR' | 'CHF' | 'GBP' | 'USD';
  /** Supported languages */
  supportedLocales: ('es' | 'en' | 'de')[];
  /** Default tip percentages to show */
  tipOptions: number[];
  /** Is the restaurant verified? */
  isVerified: boolean;
  /** When the restaurant was created */
  createdAt: string;
  /** When the restaurant was last updated */
  updatedAt: string;
}

/** Restaurant table information */
export interface Table {
  /** Unique identifier */
  id: string;
  /** Restaurant this table belongs to */
  restaurantId: string;
  /** Table number or name (e.g., "7", "Terraza 3") */
  number: string;
  /** Number of seats */
  seats?: number;
  /** QR code identifier for this table */
  qrCodeId: string;
}
