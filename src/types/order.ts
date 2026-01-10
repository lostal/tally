/**
 * Order and Bill Types
 *
 * Represents items on a restaurant bill and their selection state.
 */

/** Single item on the bill */
export interface OrderItem {
  /** Unique identifier */
  id: string;
  /** Item name */
  name: string;
  /** Item description (optional) */
  description?: string;
  /** Unit price in cents (to avoid floating point issues) */
  unitPriceCents: number;
  /** Quantity ordered */
  quantity: number;
  /** Category (e.g., "Entrantes", "Principales", "Bebidas") */
  category?: string;
}

/** Item with selection state for bill splitting */
export interface SelectableOrderItem extends OrderItem {
  /** Whether this item is selected by the current user */
  isSelected: boolean;
  /** How many of this item the user is claiming (default: quantity) */
  claimedQuantity: number;
  /** User IDs who have claimed this item (for multi-user) */
  claimedBy: string[];
}

/** Complete bill/order for a table */
export interface Bill {
  /** Unique identifier */
  id: string;
  /** Session this bill belongs to */
  sessionId: string;
  /** Restaurant ID */
  restaurantId: string;
  /** Table ID */
  tableId: string;
  /** All items on the bill */
  items: OrderItem[];
  /** Subtotal in cents (before tip) */
  subtotalCents: number;
  /** Tax amount in cents (if applicable) */
  taxCents: number;
  /** Total in cents (subtotal + tax, before tip) */
  totalCents: number;
  /** Currency code */
  currency: 'EUR' | 'CHF' | 'GBP' | 'USD';
  /** When the bill was created */
  createdAt: string;
  /** When the bill was last updated */
  updatedAt: string;
}

/** Summary of what a user owes */
export interface UserBillSummary {
  /** User/participant ID */
  participantId: string;
  /** Selected items with quantities */
  selectedItems: {
    itemId: string;
    quantity: number;
    amountCents: number;
  }[];
  /** Subtotal for this user in cents */
  subtotalCents: number;
  /** Tip amount in cents */
  tipCents: number;
  /** Total amount to pay in cents */
  totalCents: number;
  /** Tip percentage selected */
  tipPercentage: number;
}
