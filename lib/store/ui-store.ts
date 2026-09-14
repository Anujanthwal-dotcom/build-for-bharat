import { create } from 'zustand';

interface UIState {
  isDumpWindowOpen: boolean;
  openDumpWindow: () => void;
  closeDumpWindow: () => void;
  
  isOnboardingTourOpen: boolean;
  completeOnboardingTour: () => void;
  startOnboardingTour: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isDumpWindowOpen: false,
  openDumpWindow: () => set({ isDumpWindowOpen: true }),
  closeDumpWindow: () => set({ isDumpWindowOpen: false }),

  isOnboardingTourOpen: false, // Default to true if you want it on first load
  completeOnboardingTour: () => set({ isOnboardingTourOpen: false }),
  startOnboardingTour: () => set({ isOnboardingTourOpen: true }),
}));
