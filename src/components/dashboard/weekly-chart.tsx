import { Card } from '@/components/ui/card';

interface WeeklyChartProps {
  data: { date: string; reviews_done: number }[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const maxReviews = Math.max(...data.map((d) => d.reviews_done), 1);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const found = data.find((x) => x.date === dateStr);
    return {
      day: days[d.getDay() === 0 ? 6 : d.getDay() - 1],
      count: found?.reviews_done || 0,
    };
  });

  return (
    <Card>
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Weekly Activity</h3>
      <div className="flex items-end justify-between gap-2 h-32">
        {last7.map((d, i) => (
          <div key={i} className="flex flex-col items-center flex-1 gap-1">
            <div className="text-xs text-[var(--text-muted)]">{d.count}</div>
            <div
              className="w-full rounded-t-md bg-[var(--accent)] transition-all duration-500"
              style={{ height: `${Math.max(4, (d.count / maxReviews) * 100)}%` }}
            />
            <div className="text-xs text-[var(--text-muted)]">{d.day}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
