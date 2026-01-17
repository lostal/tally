import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Session, SessionStatus, Participant } from '@/types';

interface SessionState {
  /** Current session data */
  session: Session | null;
  /** Whether session is loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;

  // Actions
  setSession: (session: Session | null) => void;
  updateSessionStatus: (status: SessionStatus) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (participantId: string) => void;
  updateParticipant: (participantId: string, updates: Partial<Participant>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  session: null,
  isLoading: false,
  error: null,
};

/**
 * Session Store
 *
 * Manages the current table session state including all participants.
 * Uses immer for immutable updates.
 * Persisted to sessionStorage to survive page reloads.
 */
export const useSessionStore = create<SessionState>()(
  persist(
    immer((set) => ({
      ...initialState,

      setSession: (session) =>
        set((state) => {
          state.session = session;
          state.isLoading = false;
          state.error = null;
        }),

      updateSessionStatus: (status) =>
        set((state) => {
          if (state.session) {
            state.session.status = status;
          }
        }),

      addParticipant: (participant) =>
        set((state) => {
          if (state.session) {
            state.session.participants.push(participant);
          }
        }),

      removeParticipant: (participantId) =>
        set((state) => {
          if (state.session) {
            state.session.participants = state.session.participants.filter(
              (p) => p.id !== participantId
            );
          }
        }),

      updateParticipant: (participantId, updates) =>
        set((state) => {
          if (state.session) {
            const index = state.session.participants.findIndex((p) => p.id === participantId);
            if (index !== -1) {
              Object.assign(state.session.participants[index], updates);
            }
          }
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
          state.isLoading = false;
        }),

      reset: () => set(initialState),
    })),
    {
      name: 'tally-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        session: state.session,
        // Note: isLoading and error are NOT persisted - they are transient UI state
      }),
    }
  )
);

// Selectors for common derived state
export const useSession = () => useSessionStore((s) => s.session);
export const useParticipants = () => useSessionStore((s) => s.session?.participants ?? []);
export const useSessionStatus = () => useSessionStore((s) => s.session?.status);
export const useIsSessionLoading = () => useSessionStore((s) => s.isLoading);
