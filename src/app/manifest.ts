import { MetadataRoute } from 'next';

/**
 * Web App Manifest
 *
 * PWA configuration following 2026 standards:
 * - SVG icon with fallback PNGs
 * - Maskable icons for Android adaptive icons
 * - Theme colors matching brand
 *
 * @see https://web.dev/articles/add-manifest
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'tally',
    short_name: 'tally',
    description: 'Sistema de pagos para restaurantes. Cobra más rápido, rota más mesas.',
    start_url: '/',
    display: 'standalone',
    background_color: '#2d2a26',
    theme_color: '#2d2a26',
    orientation: 'portrait',
    categories: ['business', 'finance', 'food'],
    icons: [
      {
        src: '/app-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/manifest-icon/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/manifest-icon/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/manifest-icon/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
