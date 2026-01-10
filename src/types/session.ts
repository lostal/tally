/**
 * Session Types
 *
 * A session represents a group of people splitting a bill at a table.
 * Session state is synchronized in real-time via Supabase.
 */

/** Session status */
export type SessionStatus =
  | 'active' // Session is open, users can join
  | 'locked' // All users ready, waiting for payment
  | 'processing' // Payment is being processed
  | 'completed' // All payments successful
  | 'expired'; // Session timed out

/** Participant in a session */
export interface Participant {
  /** Unique identifier */
  id: string;
  /** Session this participant belongs to */
  sessionId: string;
  /** Display name (optional, can be anonymous) */
  name?: string;
  /** Avatar URL or initials */
  avatar?: string;
  /** Participant color for UI (assigned automatically) */
  color: string;
  /** When the participant joined */
  joinedAt: string;
  /** Whether the participant has confirmed their selection */
  isReady: boolean;
  /** Payment method selected (once at payment stage) */
  paymentMethod?: 'APPLE_PAY' | 'GOOGLE_PAY' | 'CARD';
  /** Selected items (for item-based splitting) */
  selectedItemIds: string[];
  /** Fixed amount in cents (for amount-based splitting) */
  fixedAmountCents?: number;
  /** Split method chosen by this participant */
  splitMethod: 'BY_ITEMS' | 'BY_AMOUNT' | 'EQUAL';
  /** Tip percentage */
  tipPercentage: number;
  /** Payment status */
  paymentStatus: 'pending' | 'processing' | 'success' | 'failed';
}

/** Table session for bill splitting */
export interface Session {
  /** Unique identifier */
  id: string;
  /** Restaurant ID */
  restaurantId: string;
  /** Table ID */
  tableId: string;
  /** Bill associated with this session */
  billId: string;
  /** Current session status */
  status: SessionStatus;
  /** All participants in this session */
  participants: Participant[];
  /** Total number of expected participants (optional) */
  expectedParticipants?: number;
  /** Session created at */
  createdAt: string;
  /** Session expires at (for cleanup) */
  expiresAt: string;
  /** When the session was last updated */
  updatedAt: string;
}

/** Real-time session update event */
export interface SessionEvent {
  type:
    | 'PARTICIPANT_JOINED'
    | 'PARTICIPANT_LEFT'
    | 'PARTICIPANT_READY'
    | 'PARTICIPANT_UPDATED'
    | 'SESSION_LOCKED'
    | 'PAYMENT_STARTED'
    | 'PAYMENT_COMPLETED'
    | 'SESSION_EXPIRED';
  sessionId: string;
  participantId?: string;
  payload?: Record<string, unknown>;
  timestamp: string;
}
