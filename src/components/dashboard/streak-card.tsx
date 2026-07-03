import { Card } from '@/components/ui/card';

interface StreakCardProps {
  streak: number;
}

export function StreakCard({ streak }: StreakCardProps) {
  return (
    <Card className="text-center">
      <div className="text-4xl font-bold text-[var(--accent)]">{streak}</div>
      <div className="text-sm text-[var(--text-secondary)] mt-1">Day Streak</div>
      <div className="text-2xl mt-2">🔥</div>
    </Card>
  );
}
