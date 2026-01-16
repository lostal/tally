import type { Metadata, Viewport } from 'next';
import { Inter, Lora } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import './globals.css';

/**
 * Typography System - Warm Minimalism
 *
 * Inter: Clean sans-serif for body text, buttons, labels
 * Lora: Elegant serif for headlines, prices, emphasis
 */
const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontSerif = Lora({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'tally - sistema de pagos para restaurantes',
    template: '%s | tally',
  },
  description: 'Sistema de pagos para restaurantes. Cobra más rápido, rota más mesas, gana más.',
  keywords: [
    'restaurante',
    'pago',
    'dividir cuenta',
    'código QR',
    'pago móvil',
    'pos',
    'hostelería',
  ],
  authors: [{ name: 'tally' }],
  creator: 'tally',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/manifest-icon/32', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'tally',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2d2a26' },
    { media: '(prefers-color-scheme: dark)', color: '#2d2a26' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Script to prevent flash - runs before React hydration
  // Only applies 'dark' class if explicitly set in localStorage
  const themeScript = `
    (function() {
      try {
        var mode = localStorage.getItem('tally-theme-mode');
        if (mode === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        }
        // If 'light' or no preference, do nothing (default is light)
      } catch (e) {}
    })();
  `;

  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-background text-foreground min-h-dvh font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
