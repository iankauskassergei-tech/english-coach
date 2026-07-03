'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/vocabulary', label: 'Vocabulary', icon: '📚' },
  { href: '/flashcards', label: 'Flashcards', icon: '🃏' },
  { href: '/job-english', label: 'Job English', icon: '💼' },
  { href: '/reading', label: 'Reading', icon: '📖' },
  { href: '/writing', label: 'Writing', icon: '✍️' },
  { href: '/speaking', label: 'Speaking', icon: '🎤' },
  { href: '/grammar', label: 'Grammar', icon: '📝' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-[var(--border)] bg-[var(--bg-secondary)] h-screen sticky top-0">
      <div className="p-6 border-b border-[var(--border)]">
        <h1 className="text-xl font-bold text-[var(--accent)]">EnglishCoach</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">B2 → C1</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-[var(--accent-light)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-[var(--border)]">
        <ThemeToggle />
      </div>
    </aside>
  );
}

function ThemeToggle() {
  const toggleTheme = () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
    >
      <span>🌙</span>
      Toggle theme
    </button>
  );
}
