import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Card({ className, children, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 transition-shadow',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
    >
      {children}
    </div>
  );
}
