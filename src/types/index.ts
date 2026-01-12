/**
 * Tally Type Definitions
 *
 * Central export for all TypeScript types used in the application.
 */

// Restaurant and configuration
export type { Restaurant, RestaurantTheme, Table } from './restaurant';

// Orders and bills
export type { OrderItem, SelectableOrderItem, Bill, UserBillSummary } from './order';

// Sessions and participants
export type { Session, SessionStatus, Participant, SessionEvent } from './session';

// Payments
export type { PaymentMethod, PaymentStatus, PaymentIntent, Payment, Receipt } from './payment';

// Fiscal
export type {
  VATRate,
  TaxBreakdownItem,
  InvoiceStatus,
  Invoice,
  InvoiceItem,
  RestaurantFiscalInfo,
} from './fiscal';
export { VAT_RATES } from './fiscal';

// Subscriptions
export type {
  SubscriptionPlan,
  SubscriptionStatus,
  Subscription,
  PricingPlan,
} from './subscription';
export { PRICING_PLANS, getPlanById, isSubscriptionActive } from './subscription';
