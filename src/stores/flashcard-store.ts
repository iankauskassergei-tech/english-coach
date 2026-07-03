'use client';

import { create } from 'zustand';

interface FlashcardState {
  mode: 'en-ru' | 'ru-en' | 'fill-blank' | 'mcq';
  deck: 'due' | 'new' | 'all';
  cards: any[];
  currentIndex: number;
  isFlipped: boolean;
  answer: string;
  quality: number | null;
  results: { wordId: number; quality: number }[];
  setMode: (mode: FlashcardState['mode']) => void;
  setDeck: (deck: FlashcardState['deck']) => void;
  setCards: (cards: any[]) => void;
  flip: () => void;
  setAnswer: (answer: string) => void;
  setQuality: (quality: number) => void;
  next: () => void;
  reset: () => void;
  addResult: (wordId: number, quality: number) => void;
}

export const useFlashcardStore = create<FlashcardState>((set) => ({
  mode: 'en-ru',
  deck: 'due',
  cards: [],
  currentIndex: 0,
  isFlipped: false,
  answer: '',
  quality: null,
  results: [],
  setMode: (mode) => set({ mode }),
  setDeck: (deck) => set({ deck }),
  setCards: (cards) => set({ cards, currentIndex: 0, isFlipped: false, results: [] }),
  flip: () => set((s) => ({ isFlipped: !s.isFlipped })),
  setAnswer: (answer) => set({ answer }),
  setQuality: (quality) => set({ quality }),
  next: () => set((s) => ({
    currentIndex: s.currentIndex + 1,
    isFlipped: false,
    answer: '',
    quality: null,
  })),
  reset: () => set({ cards: [], currentIndex: 0, isFlipped: false, answer: '', quality: null, results: [] }),
  addResult: (wordId, quality) => set((s) => ({
    results: [...s.results, { wordId, quality }],
  })),
}));
