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
    default: 'tally. | Pay your bill, your way',
    template: '%s | tally.',
  },
  description: 'Split the bill, pay with ease. Scan, select, and go.',
  keywords: ['restaurant', 'payment', 'split bill', 'QR code', 'mobile payment'],
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
