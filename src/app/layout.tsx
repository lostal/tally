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
    default: 'tally: Paga sin levantarte',
    template: '%s | tally',
  },
  description: 'Paga sin levantarte. Escanea, divide y paga en segundos.',
  keywords: ['restaurante', 'pago', 'dividir cuenta', 'código QR', 'pago móvil'],
  authors: [{ name: 'tally' }],
  creator: 'tally',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'tally.',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F5' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1816' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontSerif.variable}`}>
      <body className="min-h-dvh font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
