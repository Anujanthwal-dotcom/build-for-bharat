import { create } from 'zustand';
import type { TemplateDef } from '@/lib/constants';

interface UIState {
  isDumpWindowOpen: boolean;
  openDumpWindow: () => void;
  closeDumpWindow: () => void;

  isTemplateInputOpen: boolean;
  selectedTemplate: TemplateDef | null;
  openTemplateInput: (template: TemplateDef) => void;
  closeTemplateInput: () => void;

  isOnboardingTourOpen: boolean;
  completeOnboardingTour: () => void;
  startOnboardingTour: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isDumpWindowOpen: false,
  openDumpWindow: () => set({ isDumpWindowOpen: true }),
  closeDumpWindow: () => set({ isDumpWindowOpen: false }),

  isTemplateInputOpen: false,
  selectedTemplate: null,
  openTemplateInput: (template) => set({ isTemplateInputOpen: true, selectedTemplate: template }),
  closeTemplateInput: () => set({ isTemplateInputOpen: false, selectedTemplate: null }),

  isOnboardingTourOpen: false, // Default to true if you want it on first load
  completeOnboardingTour: () => set({ isOnboardingTourOpen: false }),
  startOnboardingTour: () => set({ isOnboardingTourOpen: true }),
}));
