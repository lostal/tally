/**
 * Fiscal Types
 *
 * Types for Spanish VAT (IVA) and invoice handling
 */

/** Spanish VAT rates */
export type VATRate = 21 | 10 | 4 | 0;

/** Standard VAT rate names */
export const VAT_RATES = {
  GENERAL: 21 as const, // General rate
  REDUCED: 10 as const, // Hospitality, food
  SUPER_REDUCED: 4 as const, // Basic necessities
  EXEMPT: 0 as const, // Exempt (education, health)
} as const;

/** Tax breakdown item */
export interface TaxBreakdownItem {
  rate: number;
  baseCents: number;
  taxCents: number;
}

/** Invoice status */
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'cancelled';

/** Invoice data */
export interface Invoice {
  id: string;
  restaurantId: string;
  orderId?: string;
  invoiceNumber: string;
  series: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  taxBreakdown: TaxBreakdownItem[];
  status: InvoiceStatus;
  hash?: string;
  previousHash?: string;
  qrCode?: string;
  issuedAt: string;
  paidAt?: string;
  cancelledAt?: string;
}

/** Invoice item */
export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  taxRate: number;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}

/** Restaurant fiscal information */
export interface RestaurantFiscalInfo {
  fiscalName?: string;
  taxId?: string;
  fiscalAddress?: string;
  fiscalCity?: string;
  fiscalPostalCode?: string;
  fiscalCountry: string;
}
