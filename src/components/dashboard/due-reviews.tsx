import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DueReviewsProps {
  count: number;
}

export function DueReviews({ count }: DueReviewsProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">Cards Due</h3>
          <div className="text-3xl font-bold mt-1">{count}</div>
        </div>
        <Link href="/flashcards">
          <Button disabled={count === 0}>
            {count > 0 ? 'Start Review' : 'All done!'}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
