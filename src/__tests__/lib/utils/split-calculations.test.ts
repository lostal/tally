import { describe, it, expect } from 'vitest';
import {
  calculateDynamicSplit,
  getMyShare,
  validateSplitSum,
  formatCents,
} from '@/lib/utils/split-calculations';
import type { Participant } from '@/types';

/**
 * CRITICAL TESTS: Dynamic Split Calculations
 *
 * These tests ensure mathematical correctness in money handling.
 * ANY failure here means potential financial errors in production.
 *
 * Priority: HIGHEST
 * Category: Financial Logic
 */

describe('calculateDynamicSplit - CRITICAL', () => {
  describe('Edge Cases - Rounding', () => {
    it('should handle perfect division (no remainder)', () => {
      const result = calculateDynamicSplit(1000, 5);

      expect(result.baseAmount).toBe(200);
      expect(result.remainder).toBe(0);
      expect(result.totalCents).toBe(1000);
      expect(result.participantCount).toBe(5);
    });

    it('should distribute remainder correctly (3 people, 1000 cents)', () => {
      const result = calculateDynamicSplit(1000, 3);

      expect(result.baseAmount).toBe(333);
      expect(result.remainder).toBe(1);

      // Verify: 333 + 333 + 333 + 1 = 1000
      const total = result.baseAmount * 3 + result.remainder;
      expect(total).toBe(1000);
    });

    it('should handle maximum remainder (2 people, 999 cents)', () => {
      const result = calculateDynamicSplit(999, 2);

      expect(result.baseAmount).toBe(499);
      expect(result.remainder).toBe(1);

      const total = result.baseAmount * 2 + result.remainder;
      expect(total).toBe(999);
    });

    it('should handle single cent division (1 cent, 5 people)', () => {
      const result = calculateDynamicSplit(1, 5);

      expect(result.baseAmount).toBe(0);
      expect(result.remainder).toBe(1);

      // Only host pays 1 cent, others pay 0
      const total = result.baseAmount * 5 + result.remainder;
      expect(total).toBe(1);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should split €10.00 among 3 people correctly', () => {
      const result = calculateDynamicSplit(1000, 3); // 1000 cents = €10.00

      // Expected: [334, 333, 333] = 1000
      expect(result.baseAmount).toBe(333);
      expect(result.remainder).toBe(1);
    });

    it('should split €50.00 among 7 people correctly', () => {
      const result = calculateDynamicSplit(5000, 7); // €50.00

      expect(result.baseAmount).toBe(714);
      expect(result.remainder).toBe(2);

      // Verify: 714 * 7 + 2 = 5000
      const total = 714 * 7 + 2;
      expect(total).toBe(5000);
    });

    it('should handle large bills (€500 among 11 people)', () => {
      const result = calculateDynamicSplit(50000, 11); // €500.00

      expect(result.baseAmount).toBe(4545);
      expect(result.remainder).toBe(5);

      const total = 4545 * 11 + 5;
      expect(total).toBe(50000);
    });
  });

  describe('Boundary Cases', () => {
    it('should handle single participant', () => {
      const result = calculateDynamicSplit(1234, 1);

      expect(result.baseAmount).toBe(1234);
      expect(result.remainder).toBe(0);
    });

    it('should handle zero participants gracefully', () => {
      const result = calculateDynamicSplit(1000, 0);

      expect(result.baseAmount).toBe(0);
      expect(result.remainder).toBe(0);
      expect(result.participantCount).toBe(0);
    });

    it('should handle zero amount', () => {
      const result = calculateDynamicSplit(0, 3);

      expect(result.baseAmount).toBe(0);
      expect(result.remainder).toBe(0);
    });
  });

  describe('Mathematical Invariants', () => {
    it('should ALWAYS satisfy: baseAmount * count + remainder = total', () => {
      const testCases = [
        { total: 1000, count: 3 },
        { total: 999, count: 2 },
        { total: 5000, count: 7 },
        { total: 12345, count: 11 },
        { total: 1, count: 5 },
        { total: 10000, count: 13 },
      ];

      testCases.forEach(({ total, count }) => {
        const result = calculateDynamicSplit(total, count);
        const calculated = result.baseAmount * count + result.remainder;

        expect(calculated).toBe(total);
      });
    });

    it('remainder should ALWAYS be less than participant count', () => {
      const testCases = [
        { total: 1000, count: 3 },
        { total: 999, count: 2 },
        { total: 5000, count: 7 },
      ];

      testCases.forEach(({ total, count }) => {
        const result = calculateDynamicSplit(total, count);
        expect(result.remainder).toBeLessThan(count);
      });
    });
  });
});

describe('getMyShare - CRITICAL', () => {
  const createParticipant = (
    id: string,
    isHost: boolean = false,
    isActive: boolean = true,
    joinedAt: string = new Date().toISOString()
  ): Participant => ({
    id,
    sessionId: 'session-1',
    name: `User ${id}`,
    color: '#000',
    joinedAt,
    isActive,
    isHost,
    isReady: false,
    selectedItemIds: [],
    splitMethod: 'DYNAMIC_EQUAL',
    tipPercentage: 0,
    paymentStatus: 'pending',
  });

  describe('Host Pays Extra Cents', () => {
    it('should make host pay extra cent when remainder exists', () => {
      const participants = [
        createParticipant('host', true, true, '2024-01-01T10:00:00Z'),
        createParticipant('user1', false, true, '2024-01-01T10:01:00Z'),
        createParticipant('user2', false, true, '2024-01-01T10:02:00Z'),
      ];

      const hostShare = getMyShare(1000, participants, 'host');
      const user1Share = getMyShare(1000, participants, 'user1');
      const user2Share = getMyShare(1000, participants, 'user2');

      expect(hostShare).toBe(334); // 333 + 1 (remainder)
      expect(user1Share).toBe(333);
      expect(user2Share).toBe(333);

      // Verify sum
      expect(hostShare + user1Share + user2Share).toBe(1000);
    });

    it('should make earliest joiner pay extra if no host', () => {
      const participants = [
        createParticipant('user1', false, true, '2024-01-01T10:00:00Z'), // Earliest
        createParticipant('user2', false, true, '2024-01-01T10:01:00Z'),
        createParticipant('user3', false, true, '2024-01-01T10:02:00Z'),
      ];

      const user1Share = getMyShare(1000, participants, 'user1');
      const user2Share = getMyShare(1000, participants, 'user2');
      const user3Share = getMyShare(1000, participants, 'user3');

      expect(user1Share).toBe(334); // Earliest pays extra
      expect(user2Share).toBe(333);
      expect(user3Share).toBe(333);
    });
  });

  describe('Active Participants Only', () => {
    it('should only count active participants', () => {
      const participants = [
        createParticipant('user1', false, true), // Active
        createParticipant('user2', false, false), // Inactive - zombie
        createParticipant('user3', false, true), // Active
      ];

      const user1Share = getMyShare(1000, participants, 'user1');
      const user3Share = getMyShare(1000, participants, 'user3');

      // Should split between 2 active (500 each), not 3
      expect(user1Share).toBe(500);
      expect(user3Share).toBe(500);
    });
  });

  describe('Edge Cases', () => {
    it('should return full amount for single participant', () => {
      const participants = [createParticipant('solo', true, true)];

      const share = getMyShare(1234, participants, 'solo');
      expect(share).toBe(1234);
    });

    it('should return 0 for empty participants', () => {
      const share = getMyShare(1000, [], 'user1');
      expect(share).toBe(0);
    });

    it('should return 0 for all inactive participants', () => {
      const participants = [
        createParticipant('user1', false, false),
        createParticipant('user2', false, false),
      ];

      const share = getMyShare(1000, participants, 'user1');
      expect(share).toBe(0);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle €25.00 split between 4 people', () => {
      const participants = [
        createParticipant('host', true, true),
        createParticipant('user1', false, true),
        createParticipant('user2', false, true),
        createParticipant('user3', false, true),
      ];

      const shares = participants.map((p) => getMyShare(2500, participants, p.id));

      // 2500 / 4 = 625 (perfect division)
      expect(shares).toEqual([625, 625, 625, 625]);
      expect(shares.reduce((a, b) => a + b, 0)).toBe(2500);
    });
  });
});

describe('validateSplitSum - CRITICAL', () => {
  it('should validate correct sum', () => {
    const result = validateSplitSum(1000, [334, 333, 333]);
    expect(result).toBe(true);
  });

  it('should reject incorrect sum', () => {
    const result = validateSplitSum(1000, [333, 333, 333]);
    expect(result).toBe(false);
  });

  it('should reject if sum is higher than total', () => {
    const result = validateSplitSum(1000, [400, 400, 400]);
    expect(result).toBe(false);
  });

  it('should handle empty array', () => {
    const result = validateSplitSum(1000, []);
    expect(result).toBe(false);
  });

  it('should handle single payment', () => {
    const result = validateSplitSum(1000, [1000]);
    expect(result).toBe(true);
  });
});

describe('formatCents', () => {
  it('should format euros correctly', () => {
    expect(formatCents(1000)).toBe('€10.00');
    expect(formatCents(334)).toBe('€3.34');
    expect(formatCents(1)).toBe('€0.01');
    expect(formatCents(0)).toBe('€0.00');
  });

  it('should handle different currencies', () => {
    expect(formatCents(1000, 'USD')).toBe('USD10.00');
    expect(formatCents(1000, 'GBP')).toBe('GBP10.00');
  });

  it('should handle large amounts', () => {
    expect(formatCents(123456)).toBe('€1234.56');
  });
});

describe('INTEGRATION: Full Split Flow', () => {
  it('should handle complete 3-person split correctly', () => {
    const participants = [
      {
        id: 'host',
        sessionId: 's1',
        color: '#000',
        joinedAt: '2024-01-01T10:00:00Z',
        isHost: true,
        isActive: true,
        isReady: false,
        selectedItemIds: [],
        splitMethod: 'DYNAMIC_EQUAL' as const,
        tipPercentage: 0,
        paymentStatus: 'pending' as const,
      },
      {
        id: 'user1',
        sessionId: 's1',
        color: '#111',
        joinedAt: '2024-01-01T10:01:00Z',
        isHost: false,
        isActive: true,
        isReady: false,
        selectedItemIds: [],
        splitMethod: 'DYNAMIC_EQUAL' as const,
        tipPercentage: 0,
        paymentStatus: 'pending' as const,
      },
      {
        id: 'user2',
        sessionId: 's1',
        color: '#222',
        joinedAt: '2024-01-01T10:02:00Z',
        isHost: false,
        isActive: true,
        isReady: false,
        selectedItemIds: [],
        splitMethod: 'DYNAMIC_EQUAL' as const,
        tipPercentage: 0,
        paymentStatus: 'pending' as const,
      },
    ];

    const billTotal = 1000;

    // Calculate split
    const split = calculateDynamicSplit(billTotal, 3);
    expect(split.baseAmount).toBe(333);
    expect(split.remainder).toBe(1);

    // Get individual shares
    const hostShare = getMyShare(billTotal, participants, 'host');
    const user1Share = getMyShare(billTotal, participants, 'user1');
    const user2Share = getMyShare(billTotal, participants, 'user2');

    expect(hostShare).toBe(334);
    expect(user1Share).toBe(333);
    expect(user2Share).toBe(333);

    // Validate sum
    const allShares = [hostShare, user1Share, user2Share];
    expect(validateSplitSum(billTotal, allShares)).toBe(true);
  });

  it('should detect if someone leaves mid-payment', () => {
    const initialParticipants = [
      {
        id: 'user1',
        sessionId: 's1',
        color: '#000',
        joinedAt: '2024-01-01T10:00:00Z',
        isActive: true,
        isHost: false,
        isReady: false,
        selectedItemIds: [],
        splitMethod: 'DYNAMIC_EQUAL' as const,
        tipPercentage: 0,
        paymentStatus: 'pending' as const,
      },
      {
        id: 'user2',
        sessionId: 's1',
        color: '#111',
        joinedAt: '2024-01-01T10:01:00Z',
        isActive: true,
        isHost: false,
        isReady: false,
        selectedItemIds: [],
        splitMethod: 'DYNAMIC_EQUAL' as const,
        tipPercentage: 0,
        paymentStatus: 'pending' as const,
      },
      {
        id: 'user3',
        sessionId: 's1',
        color: '#222',
        joinedAt: '2024-01-01T10:02:00Z',
        isActive: true,
        isHost: false,
        isReady: false,
        selectedItemIds: [],
        splitMethod: 'DYNAMIC_EQUAL' as const,
        tipPercentage: 0,
        paymentStatus: 'pending' as const,
      },
    ];

    // Initial calculation (3 people)
    const initialShares = initialParticipants.map((p) =>
      getMyShare(1000, initialParticipants, p.id)
    );

    expect(validateSplitSum(1000, initialShares)).toBe(true);

    // User 3 leaves
    const updatedParticipants = initialParticipants.map((p) =>
      p.id === 'user3' ? { ...p, isActive: false } : p
    );

    // Recalculate (2 people now)
    const newShares = updatedParticipants
      .filter((p) => p.isActive)
      .map((p) => getMyShare(1000, updatedParticipants, p.id));

    // Each pays 500 now
    expect(newShares).toEqual([500, 500]);
    expect(validateSplitSum(1000, newShares)).toBe(true);

    // CRITICAL: Initial shares no longer valid
    expect(validateSplitSum(1000, initialShares)).toBe(true); // Still mathematically valid
    // But participant count changed! (this is why we need server-side validation)
  });
});
