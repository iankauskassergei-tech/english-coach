'use client';

import { Button } from '@/components/ui/button';

interface DifficultyButtonsProps {
  onSelect: (quality: number) => void;
}

export function DifficultyButtons({ onSelect }: DifficultyButtonsProps) {
  return (
    <div className="flex gap-2 justify-center mt-4">
      <Button variant="danger" size="sm" onClick={() => onSelect(0)}>Again</Button>
      <Button variant="secondary" size="sm" onClick={() => onSelect(3)}>Hard</Button>
      <Button variant="primary" size="sm" onClick={() => onSelect(4)}>Good</Button>
      <Button variant="ghost" size="sm" onClick={() => onSelect(5)}>Easy</Button>
    </div>
  );
}
