import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'accent' | 'success' | 'warning';
}

export function ProgressBar({ value, max = 100, className, color = 'accent' }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className={cn('h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', {
          'bg-[var(--accent)]': color === 'accent',
          'bg-[var(--success)]': color === 'success',
          'bg-[var(--warning)]': color === 'warning',
        })}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
