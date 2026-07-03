'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface SessionSummaryProps {
  results: { wordId: number; quality: number }[];
  onRestart: () => void;
}

export function SessionSummary({ results, onRestart }: SessionSummaryProps) {
  const total = results.length;
  const correct = results.filter((r) => r.quality >= 3).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="max-w-md mx-auto text-center space-y-6">
      <div className="text-5xl">🎉</div>
      <h2 className="text-2xl font-bold">Session Complete!</h2>

      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-xs text-[var(--text-muted)]">Reviewed</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-[var(--success)]">{correct}</div>
          <div className="text-xs text-[var(--text-muted)]">Correct</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold">{accuracy}%</div>
          <div className="text-xs text-[var(--text-muted)]">Accuracy</div>
        </Card>
      </div>

      <div className="flex gap-3 justify-center">
        <Button onClick={onRestart}>Practice Again</Button>
        <Link href="/">
          <Button variant="secondary">Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
