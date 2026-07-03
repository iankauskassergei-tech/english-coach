import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';

interface GoalTrackerProps {
  current: number;
  goal: number;
}

export function GoalTracker({ current, goal }: GoalTrackerProps) {
  const pct = Math.min(100, Math.round((current / goal) * 100));

  return (
    <Card>
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Daily Goal</h3>
      <div className="text-center mb-3">
        <span className="text-3xl font-bold text-[var(--accent)]">{current}</span>
        <span className="text-sm text-[var(--text-muted)]"> / {goal}</span>
      </div>
      <ProgressBar value={pct} color={pct >= 100 ? 'success' : 'accent'} />
      <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
        {pct >= 100 ? 'Goal reached! 🎉' : `${goal - current} more to reach your goal`}
      </p>
    </Card>
  );
}
