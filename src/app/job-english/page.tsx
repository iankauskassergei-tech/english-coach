'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const categories = [
  { slug: 'customer-support', name: 'Customer Support', icon: '🎧', desc: 'Help desk, tickets, escalations' },
  { slug: 'account-management', name: 'Account Management', icon: '👥', desc: 'Client relationships, renewals' },
  { slug: 'project-management', name: 'Project Management', icon: '📋', desc: 'Agile, sprints, planning' },
  { slug: 'operations', name: 'Operations', icon: '⚙️', desc: 'Processes, efficiency, KPIs' },
  { slug: 'business-communication', name: 'Business Communication', icon: '💬', desc: 'Meetings, emails, updates' },
  { slug: 'email-writing', name: 'Email Writing', icon: '✉️', desc: 'Professional correspondence' },
  { slug: 'saas-terminology', name: 'SaaS', icon: '☁️', desc: 'Metrics, subscriptions, APIs' },
  { slug: 'remote-work', name: 'Remote Work', icon: '🏠', desc: 'Distributed teams, async' },
];

export default function JobEnglishPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Job English</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Professional vocabulary for remote jobs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link key={cat.slug} href={`/job-english/${cat.slug}`}>
            <Card className="h-full hover:border-[var(--accent)] transition-colors">
              <div className="text-3xl mb-2">{cat.icon}</div>
              <h3 className="font-semibold mb-1">{cat.name}</h3>
              <p className="text-xs text-[var(--text-muted)]">{cat.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
