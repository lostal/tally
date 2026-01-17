/**
 * Hooks Index
 *
 * Re-exports all custom hooks for convenient imports.
 */

// Realtime subscription hook
export { useRealtime, useConnectionIndicator, type ConnectionStatus } from './use-realtime';

// Session management hook
export {
  useSession,
  useSessionHook,
  useParticipants,
  useSessionStatus,
  useIsSessionLoading,
} from './use-session';

// Participant (current user) hook
export {
  useParticipant,
  useSelectedItems,
  useSplitMethod,
  useTipPercentage,
  useIsReady,
} from './use-participant';

// Media query and responsive hooks
export {
  useMediaQuery,
  useBreakpoint,
  useReducedMotion,
  usePrefersDark,
  breakpoints,
} from './use-media-query';

// Order items realtime hook
export { useOrderRealtime } from './use-order-realtime';

// Offline queue hook
export { useOfflineQueue, useQueueOperation } from './use-offline-queue';

// Participant heartbeat and sync hooks
export { useParticipantHeartbeat } from './use-participant-heartbeat';
export { useParticipantSync } from './use-participant-sync';
