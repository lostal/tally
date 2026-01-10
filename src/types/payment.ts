/**
 * Payment Types
 *
 * Represents payment intents, transactions, and receipts.
 */

/** Payment method type */
export type PaymentMethod = 'APPLE_PAY' | 'GOOGLE_PAY' | 'CARD';

/** Payment status */
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'requires_action'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded';

/** Payment intent (before payment is processed) */
export interface PaymentIntent {
  /** Unique identifier */
  id: string;
  /** Session ID */
  sessionId: string;
  /** Participant ID */
  participantId: string;
  /** Amount in cents */
  amountCents: number;
  /** Currency */
  currency: 'EUR' | 'CHF' | 'GBP' | 'USD';
  /** Tip amount included (in cents) */
  tipAmountCents: number;
  /** Payment method selected */
  paymentMethod: PaymentMethod;
  /** Current status */
  status: PaymentStatus;
  /** Stripe payment intent ID (when created) */
  stripePaymentIntentId?: string;
  /** Stripe client secret (for frontend confirmation) */
  stripeClientSecret?: string;
  /** Error message if failed */
  errorMessage?: string;
  /** Created at */
  createdAt: string;
  /** Updated at */
  updatedAt: string;
}

/** Completed payment record */
export interface Payment {
  /** Unique identifier */
  id: string;
  /** Payment intent ID */
  paymentIntentId: string;
  /** Session ID */
  sessionId: string;
  /** Participant ID */
  participantId: string;
  /** Amount paid in cents */
  amountCents: number;
  /** Tip amount in cents */
  tipAmountCents: number;
  /** Currency */
  currency: 'EUR' | 'CHF' | 'GBP' | 'USD';
  /** Payment method used */
  paymentMethod: PaymentMethod;
  /** Stripe charge ID */
  stripeChargeId?: string;
  /** Last 4 digits of card (if card payment) */
  cardLast4?: string;
  /** Card brand (if card payment) */
  cardBrand?: string;
  /** Receipt number/ID */
  receiptNumber: string;
  /** Payment completed at */
  completedAt: string;
}

/** Digital receipt for a payment */
export interface Receipt {
  /** Unique receipt number */
  receiptNumber: string;
  /** Restaurant info */
  restaurant: {
    name: string;
    address?: string;
    taxId?: string;
  };
  /** Table number */
  tableNumber: string;
  /** Items paid for */
  items: {
    name: string;
    quantity: number;
    unitPriceCents: number;
    totalCents: number;
  }[];
  /** Subtotal in cents */
  subtotalCents: number;
  /** Tip in cents */
  tipCents: number;
  /** Total paid in cents */
  totalCents: number;
  /** Currency */
  currency: 'EUR' | 'CHF' | 'GBP' | 'USD';
  /** Payment method description */
  paymentMethodDisplay: string;
  /** Masked card number (if applicable) */
  maskedCardNumber?: string;
  /** Payment date/time */
  paidAt: string;
  /** Receipt generated at */
  generatedAt: string;
}
