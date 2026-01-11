import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'tally',
    short_name: 'tally',
    description: 'Paga sin levantarte. Escanea, divide y paga en segundos.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/manifest-icon/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/manifest-icon/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
