'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFlashcardStore } from '@/stores/flashcard-store';

interface SessionSetupProps {
  onStart: () => void;
}

export function SessionSetup({ onStart }: SessionSetupProps) {
  const { mode, setMode, deck, setDeck } = useFlashcardStore();

  const modes = [
    { value: 'en-ru' as const, label: 'English → Russian', icon: '🇬🇧→🇷🇺' },
    { value: 'ru-en' as const, label: 'Russian → English', icon: '🇷🇺→🇬🇧' },
    { value: 'fill-blank' as const, label: 'Fill the Blank', icon: '📝' },
    { value: 'mcq' as const, label: 'Multiple Choice', icon: '🔘' },
  ];

  const decks = [
    { value: 'due' as const, label: 'Due Cards', desc: 'Cards ready for review' },
    { value: 'new' as const, label: 'New Cards', desc: 'Cards never reviewed' },
    { value: 'all' as const, label: 'All Cards', desc: 'Entire vocabulary' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Select Mode</h3>
        <div className="grid grid-cols-2 gap-3">
          {modes.map((m) => (
            <Card
              key={m.value}
              className={`text-center cursor-pointer ${mode === m.value ? 'ring-2 ring-[var(--accent)]' : ''}`}
              onClick={() => setMode(m.value)}
            >
              <div className="text-2xl mb-1">{m.icon}</div>
              <div className="text-sm font-medium">{m.label}</div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Select Deck</h3>
        <div className="grid grid-cols-3 gap-3">
          {decks.map((d) => (
            <Card
              key={d.value}
              className={`text-center cursor-pointer ${deck === d.value ? 'ring-2 ring-[var(--accent)]' : ''}`}
              onClick={() => setDeck(d.value)}
            >
              <div className="text-sm font-medium">{d.label}</div>
              <div className="text-xs text-[var(--text-muted)]">{d.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      <Button className="w-full" size="lg" onClick={onStart}>Start Session</Button>
    </div>
  );
}
