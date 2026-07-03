'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/vocabulary', label: 'Vocab', icon: '📚' },
  { href: '/flashcards', label: 'Cards', icon: '🃏' },
  { href: '/reading', label: 'Read', icon: '📖' },
  { href: '/speaking', label: 'Speak', icon: '🎤' },
  { href: '/grammar', label: 'Grammar', icon: '📝' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-[var(--border)] z-50">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center py-2 px-3 text-xs transition-colors',
              pathname === item.href
                ? 'text-[var(--accent)]'
                : 'text-[var(--text-muted)]'
            )}
          >
            <span className="text-lg mb-0.5">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
