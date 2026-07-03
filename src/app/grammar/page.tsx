import { getDb } from '@/lib/db';
import { Header } from '@/components/layout/header';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

const topicInfo: Record<string, { icon: string; name: string; desc: string }> = {
  'tenses': { icon: '⏰', name: 'Tenses', desc: 'Present, Past, Future forms' },
  'articles': { icon: '📰', name: 'Articles', desc: 'a, an, the usage' },
  'prepositions': { icon: '📍', name: 'Prepositions', desc: 'in, on, at, with, for' },
  'conditionals': { icon: '🔀', name: 'Conditionals', desc: 'If clauses, wishes' },
  'passive-voice': { icon: '🔄', name: 'Passive Voice', desc: 'was done, has been done' },
  'reported-speech': { icon: '💬', name: 'Reported Speech', desc: 'He said that...' },
  'phrasal-verbs': { icon: '🧩', name: 'Phrasal Verbs', desc: 'look into, put off' },
};

export default function GrammarPage() {
  const db = getDb();

  const topicCounts = db.prepare(
    'SELECT topic, COUNT(*) as count FROM grammar_exercises GROUP BY topic'
  ).all() as { topic: string; count: number }[];

  const progressMap = new Map(
    (db.prepare('SELECT * FROM grammar_progress').all() as any[]).map(p => [p.topic, p])
  );

  const topics = Object.entries(topicInfo).map(([slug, info]) => {
    const count = topicCounts.find(t => t.topic === slug)?.count || 0;
    const progress = progressMap.get(slug);
    return { slug, ...info, count, progress };
  });

  return (
    <div>
      <Header title="Grammar Trainer" subtitle="Master English grammar with practice exercises" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic) => (
          <Link key={topic.slug} href={`/grammar/${topic.slug}`}>
            <Card className="h-full hover:border-[var(--accent)] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="text-3xl">{topic.icon}</div>
                <Badge>{topic.count} exercises</Badge>
              </div>
              <h3 className="font-semibold mb-1">{topic.name}</h3>
              <p className="text-xs text-[var(--text-muted)]">{topic.desc}</p>
              {topic.progress && (
                <div className="mt-2">
                  <div className="text-xs text-[var(--text-muted)]">
                    {topic.progress.correct}/{topic.progress.exercises_done} correct
                  </div>
                </div>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
