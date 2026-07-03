import { getDb } from '@/lib/db';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default function ReadingPage() {
  const db = getDb();
  const texts = db.prepare('SELECT * FROM reading_texts ORDER BY level, title').all() as any[];

  const levelColors: Record<string, string> = {
    short: 'success',
    intermediate: 'warning',
    business: 'accent',
  };

  return (
    <div>
      <Header title="Reading Practice" subtitle="Improve reading comprehension with curated texts" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {texts.map((text) => (
          <Link key={text.id} href={`/reading/${text.id}`}>
            <Card className="h-full hover:border-[var(--accent)] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{text.title}</h3>
                <Badge variant={levelColors[text.level] as any || 'default'}>{text.level}</Badge>
              </div>
              <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-2">
                {text.body.substring(0, 120)}...
              </p>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span>{text.word_count} words</span>
                {text.category && <Badge variant="default">{text.category}</Badge>}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
