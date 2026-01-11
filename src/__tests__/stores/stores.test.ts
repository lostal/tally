import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/stores/ui-store';
import { useBillStore } from '@/stores/bill-store';
import { useParticipantStore } from '@/stores/participant-store';
import { useSessionStore } from '@/stores/session-store';

describe('Zustand Stores', () => {
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
});
