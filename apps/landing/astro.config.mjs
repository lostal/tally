import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://paytally.app',

  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },

  // Prefetching for instant navigation
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },

  // Build output
  output: 'static',

  // Development server
  server: {
    port: 4321,
    host: true,
  },
});
