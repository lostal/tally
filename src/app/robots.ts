import { MetadataRoute } from 'next';

/**
 * Robots.txt configuration
 *
 * Instructs search engine crawlers about which pages to crawl.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/hub/', '/auth/callback'],
      },
    ],
    sitemap: 'https://paytally.app/sitemap.xml',
  };
}
