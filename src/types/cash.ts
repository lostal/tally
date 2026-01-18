/**
 * Cash Management Types
 *
 * Types for cash register management and Z-Report generation.
 * Used until database types are regenerated from schema.
 */

import { z } from 'zod';

// ============================================
// Cash Register Types
// ============================================

export interface CashRegister {
  id: string;
  restaurant_id: string;
  opened_by: string;
  closed_by: string | null;
  opening_amount_cents: number;
  expected_cash_cents: number | null;
  actual_cash_cents: number | null;
  difference_cents: number | null;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at: string | null;
  z_report: ZReport | null;
  created_at: string;
  updated_at: string;
}

export interface CashTransaction {
  id: string;
  register_id: string;
  user_id: string;
  restaurant_id: string;
  type: 'entry' | 'exit';
  amount_cents: number;
  reason: string;
  notes: string | null;
  created_at: string;
}

// ============================================
// Z-Report Types
// ============================================

export interface ZReport {
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
  openingAmount: number;
  sales: {
    card: { count: number; totalCents: number };
    cash: { count: number; totalCents: number };
  };
  tips: {
    totalCents: number;
  };
  transactions: {
    entries: number;
    entriesCents: number;
    exits: number;
    exitsCents: number;
    netCents: number;
  };
  totals: {
    grossSalesCents: number;
    tipsCents: number;
  };
}

// ============================================
// API Request/Response Schemas
// ============================================

// Open register
export const openRegisterSchema = z.object({
  openingAmountCents: z.number().int().min(0),
});
export type OpenRegisterRequest = z.infer<typeof openRegisterSchema>;

// Add transaction
export const addTransactionSchema = z.object({
  type: z.enum(['entry', 'exit']),
  amountCents: z.number().int().positive(),
  reason: z.string().min(1).max(255),
  notes: z.string().max(500).optional(),
});
export type AddTransactionRequest = z.infer<typeof addTransactionSchema>;

// Close register
export const closeRegisterSchema = z.object({
  actualCashCents: z.number().int().min(0),
});
export type CloseRegisterRequest = z.infer<typeof closeRegisterSchema>;

// ============================================
// API Responses
// ============================================

export interface CashRegisterWithTransactions extends CashRegister {
  transactions: CashTransaction[];
  openedByUser?: { name: string };
  closedByUser?: { name: string };
}
