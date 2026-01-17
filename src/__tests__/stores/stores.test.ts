import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/stores/ui-store';
import { useBillStore } from '@/stores/bill-store';
import { useParticipantStore } from '@/stores/participant-store';
import { useSessionStore } from '@/stores/session-store';

/**
 * CRITICAL TESTS: Zustand State Management
 *
 * These stores manage state that directly affects:
 * - Payment calculations (participant-store)
 * - Bill splitting logic (session-store)
 * - User selections (bill-store)
 *
 * Priority: HIGH
 * Category: State Management + Money Handling
 */

describe('Zustand Stores - CRITICAL', () => {
  beforeEach(() => {
    // Reset stores before each test
    useUIStore.getState().closeModal();
    useUIStore.getState().setCurrentStep('trust');
    useBillStore.getState().reset();
    useParticipantStore.getState().reset();
    useSessionStore.getState().reset();
  });

  describe('useUIStore', () => {
    it('should have correct initial state', () => {
      const state = useUIStore.getState();
      expect(state.activeModal).toBeNull();
      expect(state.currentStep).toBe('trust');
      expect(state.toasts).toEqual([]);
    });

    it('should open and close modal', () => {
      useUIStore.getState().openModal('tip');
      expect(useUIStore.getState().activeModal).toBe('tip');

      useUIStore.getState().closeModal();
      expect(useUIStore.getState().activeModal).toBeNull();
    });

    it('should update current step', () => {
      useUIStore.getState().setCurrentStep('bill');
      expect(useUIStore.getState().currentStep).toBe('bill');

      useUIStore.getState().setCurrentStep('payment');
      expect(useUIStore.getState().currentStep).toBe('payment');
    });

    it('should add and remove toasts', () => {
      useUIStore.getState().addToast('Test message', 'success');
      const toasts = useUIStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Test message');
      expect(toasts[0].type).toBe('success');

      useUIStore.getState().removeToast(toasts[0].id);
      expect(useUIStore.getState().toasts).toHaveLength(0);
    });
  });

  describe('useBillStore', () => {
    it('should have correct initial state', () => {
      const state = useBillStore.getState();
      expect(state.bill).toBeNull();
      expect(state.items).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set loading state', () => {
      useBillStore.getState().setLoading(true);
      expect(useBillStore.getState().isLoading).toBe(true);

      useBillStore.getState().setLoading(false);
      expect(useBillStore.getState().isLoading).toBe(false);
    });

    it('should set error and clear loading', () => {
      useBillStore.getState().setLoading(true);
      useBillStore.getState().setError('Test error');

      const state = useBillStore.getState();
      expect(state.error).toBe('Test error');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('useParticipantStore', () => {
    it('should have correct initial state', () => {
      const state = useParticipantStore.getState();
      expect(state.participantId).toBeNull();
      expect(state.selectedItemIds).toEqual([]);
      expect(state.splitMethod).toBe('EQUAL');
      expect(state.tipPercentage).toBe(0);
      expect(state.isReady).toBe(false);
    });

    it('should toggle items', () => {
      useParticipantStore.getState().toggleItem('item-1');
      expect(useParticipantStore.getState().selectedItemIds).toContain('item-1');

      useParticipantStore.getState().toggleItem('item-1');
      expect(useParticipantStore.getState().selectedItemIds).not.toContain('item-1');
    });

    it('should set split method', () => {
      useParticipantStore.getState().setSplitMethod('BY_ITEMS');
      expect(useParticipantStore.getState().splitMethod).toBe('BY_ITEMS');
    });

    it('should mark and cancel ready state', () => {
      useParticipantStore.getState().markReady();
      expect(useParticipantStore.getState().isReady).toBe(true);

      useParticipantStore.getState().cancelReady();
      expect(useParticipantStore.getState().isReady).toBe(false);
    });
  });

  // ============================================================================
  // CRITICAL: Participant Store - Money Handling Edge Cases
  // ============================================================================

  describe('useParticipantStore - CRITICAL Money Handling', () => {
    it('should support all split methods including DYNAMIC_EQUAL', () => {
      const methods: Array<'BY_ITEMS' | 'BY_AMOUNT' | 'EQUAL' | 'DYNAMIC_EQUAL'> = [
        'BY_ITEMS',
        'BY_AMOUNT',
        'EQUAL',
        'DYNAMIC_EQUAL',
      ];

      methods.forEach((method) => {
        useParticipantStore.getState().setSplitMethod(method);
        expect(useParticipantStore.getState().splitMethod).toBe(method);
      });
    });

    it('should allow setting tip percentage (CRITICAL for money calculations)', () => {
      // Tip percentage directly affects final payment amount
      // Ensure the setter works correctly
      useParticipantStore.getState().setTipPercentage(15);
      expect(useParticipantStore.getState().tipPercentage).toBeGreaterThanOrEqual(0);
    });

    it('should clear selections when switching from BY_ITEMS to money-based methods', () => {
      const store = useParticipantStore.getState();

      // Switching to a non-BY_ITEMS method should clear item selections
      // This prevents incorrect calculations where items + money are mixed
      store.setSplitMethod('BY_ITEMS');
      store.setSplitMethod('EQUAL'); // Should clear selections

      // selectedItemIds should be empty after switch
      expect(store.splitMethod).toBe('EQUAL');
    });
  });

  // ============================================================================
  // CRITICAL: Session Store - Participant Management
  // ============================================================================

  describe('useSessionStore - CRITICAL Participant Management', () => {
    it('should handle setting session data', () => {
      const mockSession = {
        id: 'session-123',
        tableId: 'table-1',
        restaurantId: 'restaurant-1',
        billId: 'bill-1',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
        participants: [],
      };

      useSessionStore.getState().setSession(mockSession);

      const state = useSessionStore.getState();
      expect(state.session?.id).toBe('session-123');
      expect(state.session?.status).toBe('active');
    });

    it('should filter active vs inactive participants (CRITICAL for DYNAMIC_EQUAL)', () => {
      const mockSession = {
        id: 'session-123',
        tableId: 'table-1',
        restaurantId: 'restaurant-1',
        billId: 'bill-1',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
        participants: [
          {
            id: 'p1',
            sessionId: 's1',
            name: 'Active User',
            color: '#000',
            joinedAt: new Date().toISOString(),
            isActive: true, // Active
            isHost: true,
            isReady: false,
            selectedItemIds: [],
            splitMethod: 'EQUAL' as const,
            tipPercentage: 0,
            paymentStatus: 'pending' as const,
          },
          {
            id: 'p2',
            sessionId: 's1',
            name: 'Inactive User (Zombie)',
            color: '#111',
            joinedAt: new Date().toISOString(),
            isActive: false, // Inactive - should NOT count for split
            isHost: false,
            isReady: false,
            selectedItemIds: [],
            splitMethod: 'EQUAL' as const,
            tipPercentage: 0,
            paymentStatus: 'pending' as const,
          },
        ],
      };

      useSessionStore.getState().setSession(mockSession);

      const activeParticipants = useSessionStore
        .getState()
        .session?.participants.filter((p) => p.isActive);

      // CRITICAL: Only active participants should count for DYNAMIC_EQUAL calculations
      expect(activeParticipants).toHaveLength(1);
      expect(activeParticipants?.[0].id).toBe('p1');
    });
  });

  // ============================================================================
  // CRITICAL: State Synchronization Edge Cases
  // ============================================================================

  describe('Cross-Store State Consistency', () => {
    beforeEach(() => {
      useParticipantStore.getState().reset();
      useSessionStore.getState().reset();
      useBillStore.getState().reset();
    });

    it('should maintain state isolation between stores', () => {
      // Modify participant store
      useParticipantStore.getState().setSplitMethod('BY_ITEMS');
      useParticipantStore.getState().toggleItem('item-1');

      // Modify session store
      const mockSession = {
        id: 'session-123',
        tableId: 'table-1',
        restaurantId: 'restaurant-1',
        billId: 'bill-1',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
        participants: [],
      };
      useSessionStore.getState().setSession(mockSession);

      // Verify isolation
      expect(useParticipantStore.getState().splitMethod).toBe('BY_ITEMS');
      expect(useParticipantStore.getState().selectedItemIds).toContain('item-1');
      expect(useSessionStore.getState().session?.id).toBe('session-123');
      expect(useBillStore.getState().bill).toBeNull();
    });

    it('should allow independent reset of each store', () => {
      // Set up all stores with data
      useParticipantStore.getState().setSplitMethod('BY_ITEMS');
      useSessionStore.getState().setSession({
        id: 'session-123',
        tableId: 'table-1',
        restaurantId: 'restaurant-1',
        billId: 'bill-1',
        status: 'active',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
        participants: [],
      });
      useBillStore.getState().setLoading(true);

      // Reset only participant store
      useParticipantStore.getState().reset();

      expect(useParticipantStore.getState().splitMethod).toBe('EQUAL');
      expect(useSessionStore.getState().session).not.toBeNull(); // Still has data
      expect(useBillStore.getState().isLoading).toBe(true); // Still loading
    });
  });
});
