import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://paytally.app',

  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },

  // Prefetching optimized for performance
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },

  // Build output
  output: 'static',

  // Development server
  server: {
    port: 4321,
    host: true,
  },

  // Image optimization
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
});
