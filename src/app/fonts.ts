// app/fonts.ts

import { Geist, Geist_Mono } from 'next/font/google';

/**
 * Geist Sans: Nueva tipografía de Vercel
 * - Excelente legibilidad en pantallas
 * - Números tabulares perfectos (crítico para precios)
 * - Weights: 100-900 (usaremos 300, 400, 600)
 *
 * Por qué NO Inter:
 * - Demasiado común (parece template)
 * - Geist es más contemporáneo (2023)
 * - Mejor rendering de números
 */

export const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// Para restaurantes con tipografía custom (fase futura)
export const customFonts = {
  // Ejemplo: Restaurante japonés podría usar:
  // notoSansJP: Noto_Sans_JP({ ... })
};
