'use client';

import { cn } from '@/lib/utils';

interface FlashcardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped: boolean;
  onFlip: () => void;
}

export function Flashcard({ front, back, isFlipped, onFlip }: FlashcardProps) {
  return (
    <div className="flip-card w-full max-w-md mx-auto h-64 cursor-pointer" onClick={onFlip}>
      <div className={cn('flip-card-inner relative w-full h-full', isFlipped && 'flipped')}>
        <div className="flip-card-front absolute inset-0 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 flex flex-col items-center justify-center">
          {front}
        </div>
        <div className="flip-card-back absolute inset-0 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-6 flex flex-col items-center justify-center">
          {back}
        </div>
      </div>
    </div>
  );
}
