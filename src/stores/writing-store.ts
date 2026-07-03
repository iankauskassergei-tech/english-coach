import { create } from 'zustand';

interface WritingState {
  draft: string;
  feedback: any | null;
  isChecking: boolean;
  setDraft: (draft: string) => void;
  setFeedback: (feedback: any) => void;
  setIsChecking: (v: boolean) => void;
  reset: () => void;
}

export const useWritingStore = create<WritingState>((set) => ({
  draft: '',
  feedback: null,
  isChecking: false,
  setDraft: (draft) => set({ draft }),
  setFeedback: (feedback) => set({ feedback }),
  setIsChecking: (isChecking) => set({ isChecking }),
  reset: () => set({ draft: '', feedback: null, isChecking: false }),
}));
