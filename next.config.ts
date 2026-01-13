import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Supabase Storage
      },
    ],
  },

  // Optimización para producción 2026
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
    ],
  },

  // PWA headers y configuración de cacheo
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      // Configuración de cacheo para assets estáticos
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Configuración para producción multi-tenant
  output: 'standalone', // Optimización para Docker/self-hosting
  compress: true, // Habilitar compresión gzip
  poweredByHeader: false, // Seguridad: quitar header X-Powered-By

  // Configuración para Turbopack (Next.js 16)
  turbopack: {
    // Configuración vacía para evitar errores
  },
};

export default nextConfig;
