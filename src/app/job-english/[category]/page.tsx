import { getDb } from '@/lib/db';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SaveButton } from './save-button';

export const dynamic = 'force-dynamic';

const categoryNames: Record<string, string> = {
  'customer-support': 'Customer Support',
  'account-management': 'Account Management',
  'project-management': 'Project Management',
  'operations': 'Operations',
  'business-communication': 'Business Communication',
  'email-writing': 'Email Writing',
  'saas-terminology': 'SaaS',
  'remote-work': 'Remote Work',
};

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const db = getDb();

  const terms = db.prepare(
    "SELECT * FROM words WHERE source = 'job-english' AND category = ? ORDER BY difficulty, word"
  ).all(category) as any[];

  return (
    <div>
      <div className="mb-6">
        <Link href="/job-english" className="text-sm text-[var(--accent)] hover:underline">← Back to categories</Link>
        <Header title={categoryNames[category] || category} subtitle={`${terms.length} terms`} />
      </div>

      <div className="space-y-3">
        {terms.map((term) => {
          const examples: string[] = JSON.parse(term.examples || '[]');
          return (
            <div key={term.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg">{term.word}</span>
                    {term.ipa && <span className="text-sm text-[var(--text-muted)]">{term.ipa}</span>}
                    <Badge variant="accent">{term.pos}</Badge>
                    <Badge>Level {term.difficulty}</Badge>
                  </div>
                  <div className="text-[var(--text-secondary)] mb-2">{term.translation}</div>
                  {examples[0] && (
                    <div className="text-sm italic text-[var(--text-muted)]">"{examples[0]}"</div>
                  )}
                </div>
                <SaveButton wordId={term.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
