import { Card } from '@/components/ui/card';

interface StatsGridProps {
  totalWords: number;
  mastered: number;
  accuracy: number | null;
  dueNow: number;
}

export function StatsGrid({ totalWords, mastered, accuracy, dueNow }: StatsGridProps) {
  const stats = [
    { label: 'Total Words', value: totalWords, icon: '📚' },
    { label: 'Mastered', value: mastered, icon: '✅' },
    { label: 'Accuracy', value: accuracy !== null ? `${accuracy}%` : '—', icon: '🎯' },
    { label: 'Due Now', value: dueNow, icon: '⏰' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="text-center">
          <div className="text-2xl mb-1">{stat.icon}</div>
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="text-xs text-[var(--text-secondary)]">{stat.label}</div>
        </Card>
      ))}
    </div>
  );
}
