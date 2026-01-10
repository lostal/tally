import { create } from 'zustand';

type ModalType = 'split-method' | 'tip' | 'payment' | 'confirm' | null;

interface UIState {
  /** Currently open modal */
  activeModal: ModalType;
  /** Whether app is in dark mode */
  isDarkMode: boolean;
  /** Current step in the flow (for progress indicator) */
  currentStep: 'trust' | 'bill' | 'waiting' | 'payment' | 'success';
  /** Toast messages queue */
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];

  // Actions
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  setCurrentStep: (step: UIState['currentStep']) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

/**
 * UI Store
 *
 * Manages UI state like modals, dark mode, toasts.
 */
export const useUIStore = create<UIState>()((set) => ({
  activeModal: null,
  isDarkMode: false,
  currentStep: 'trust',
  toasts: [],

  openModal: (modal) => set({ activeModal: modal }),

  closeModal: () => set({ activeModal: null }),

  toggleDarkMode: () =>
    set((state) => {
      const newValue = !state.isDarkMode;
      // Update DOM
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', newValue);
      }
      return { isDarkMode: newValue };
    }),

  setDarkMode: (enabled) =>
    set(() => {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', enabled);
      }
      return { isDarkMode: enabled };
    }),

  setCurrentStep: (step) => set({ currentStep: step }),

  addToast: (message, type = 'info') =>
    set((state) => ({
      toasts: [...state.toasts, { id: crypto.randomUUID(), message, type }],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// Selectors
export const useActiveModal = () => useUIStore((s) => s.activeModal);
export const useIsDarkMode = () => useUIStore((s) => s.isDarkMode);
export const useCurrentStep = () => useUIStore((s) => s.currentStep);
export const useToasts = () => useUIStore((s) => s.toasts);
