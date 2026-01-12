/**
 * Fiscal Calculation Utilities
 *
 * Functions for calculating VAT, generating invoices, and tax breakdown.
 * Follows Spanish fiscal regulations.
 */

import type { TaxBreakdownItem } from '@/types/fiscal';

/**
 * Calculate tax from base amount
 */
export function calculateTax(baseCents: number, taxRate: number): number {
  return Math.round((baseCents * taxRate) / 100);
}

/**
 * Calculate base amount from total (price includes tax)
 */
export function calculateBaseFromTotal(totalCents: number, taxRate: number): number {
  return Math.round(totalCents / (1 + taxRate / 100));
}

/**
 * Generate tax breakdown from order items
 */
export function generateTaxBreakdown(
  items: Array<{
    unitPriceCents: number;
    quantity: number;
    taxRate: number;
  }>
): TaxBreakdownItem[] {
  // Group items by tax rate
  const byRate = items.reduce(
    (acc, item) => {
      const rate = item.taxRate;
      const baseCents = item.unitPriceCents * item.quantity;

      if (!acc[rate]) {
        acc[rate] = { rate, baseCents: 0, taxCents: 0 };
      }

      acc[rate].baseCents += baseCents;
      acc[rate].taxCents += calculateTax(baseCents, rate);

      return acc;
    },
    {} as Record<number, TaxBreakdownItem>
  );

  return Object.values(byRate).sort((a, b) => b.rate - a.rate);
}

/**
 * Calculate totals from items
 */
export function calculateOrderTotals(
  items: Array<{
    unitPriceCents: number;
    quantity: number;
    taxRate: number;
  }>
): {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  breakdown: TaxBreakdownItem[];
} {
  const breakdown = generateTaxBreakdown(items);

  const subtotalCents = breakdown.reduce((sum, item) => sum + item.baseCents, 0);
  const taxCents = breakdown.reduce((sum, item) => sum + item.taxCents, 0);
  const totalCents = subtotalCents + taxCents;

  return {
    subtotalCents,
    taxCents,
    totalCents,
    breakdown,
  };
}

/**
 * Format currency for display (euros)
 */
export function formatCurrency(cents: number, currency: string = 'EUR'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format tax rate for display
 */
export function formatTaxRate(rate: number): string {
  return `${rate.toFixed(rate % 1 === 0 ? 0 : 2)}%`;
}

/**
 * Validate Spanish NIF/CIF
 */
export function validateSpanishTaxId(taxId: string): boolean {
  if (!taxId) return false;

  // Clean input
  const clean = taxId.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // NIF: 8 digits + letter
  const nifPattern = /^[0-9]{8}[A-Z]$/;
  // CIF: letter + 7 digits + control
  const cifPattern = /^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$/;
  // NIE: X/Y/Z + 7 digits + letter
  const niePattern = /^[XYZ][0-9]{7}[A-Z]$/;

  return nifPattern.test(clean) || cifPattern.test(clean) || niePattern.test(clean);
}

/**
 * Generate invoice number for display
 * Format: YYYY-S-NNNNNN (e.g., 2025-A-000001)
 */
export function formatInvoiceNumber(number: string): string {
  return number; // Already formatted by database function
}
