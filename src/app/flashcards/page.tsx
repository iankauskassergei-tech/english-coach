'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { SessionSetup } from '@/components/flashcards/session-setup';
import { Flashcard } from '@/components/flashcards/flashcard';
import { DifficultyButtons } from '@/components/flashcards/difficulty-buttons';
import { SessionSummary } from '@/components/flashcards/session-summary';
import { useFlashcardStore } from '@/stores/flashcard-store';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type SessionPhase = 'setup' | 'playing' | 'summary';

export default function FlashcardsPage() {
  const [phase, setPhase] = useState<SessionPhase>('setup');
  const { mode, deck, cards, currentIndex, isFlipped, answer, results, setCards, flip, setAnswer, next, reset, addResult } = useFlashcardStore();

  const startSession = async () => {
    let url = '/api/words?limit=200';
    if (deck === 'due') {
      const res = await fetch('/api/reviews/due');
      const data = await res.json();
      setCards(data.cards);
    } else if (deck === 'new') {
      const res = await fetch('/api/words?source=&page=1');
      const data = await res.json();
      setCards(data.words.filter((w: any) => w.state === 'new'));
    } else {
      const res = await fetch('/api/words?page=1');
      const data = await res.json();
      setCards(data.words);
    }
    setPhase('playing');
  };

  const submitAnswer = async (quality: number) => {
    const card = cards[currentIndex];
    addResult(card.id, quality);

    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word_id: card.id, quality }),
    });

    if (currentIndex + 1 >= cards.length) {
      setPhase('summary');
    } else {
      next();
    }
  };

  if (phase === 'setup') {
    return (
      <div>
        <Header title="Flashcards" subtitle="Practice vocabulary with spaced repetition" />
        <SessionSetup onStart={startSession} />
      </div>
    );
  }

  if (phase === 'summary') {
    return (
      <div>
        <SessionSummary results={results} onRestart={() => { reset(); setPhase('setup'); }} />
      </div>
    );
  }

  const card = cards[currentIndex];
  if (!card) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-muted)]">No cards available for this deck.</p>
        <Button className="mt-4" onClick={() => { reset(); setPhase('setup'); }}>Back to Setup</Button>
      </div>
    );
  }

  const examples: string[] = JSON.parse(card.examples || '[]');
  const mcqOptions = generateMcqOptions(card, cards);

  let frontContent: React.ReactNode;
  let backContent: React.ReactNode;

  if (mode === 'en-ru') {
    frontContent = (
      <>
        <div className="text-3xl font-bold mb-2">{card.word}</div>
        {card.ipa && <div className="text-sm text-[var(--text-muted)]">{card.ipa}</div>}
        {examples[0] && <div className="text-xs text-[var(--text-secondary)] mt-2 italic">"{examples[0]}"</div>}
      </>
    );
    backContent = (
      <>
        <div className="text-2xl font-bold mb-2">{card.translation}</div>
        {card.pos && <div className="text-sm text-[var(--text-muted)]">{card.pos}</div>}
      </>
    );
  } else if (mode === 'ru-en') {
    frontContent = (
      <div className="text-2xl font-bold">{card.translation}</div>
    );
    backContent = (
      <>
        <div className="text-3xl font-bold mb-2">{card.word}</div>
        {card.ipa && <div className="text-sm text-[var(--text-muted)]">{card.ipa}</div>}
      </>
    );
  } else if (mode === 'fill-blank') {
    const sentence = examples[0] || `This is a ${card.word}.`;
    const blanked = sentence.replace(new RegExp(card.word, 'gi'), '___');
    frontContent = (
      <div className="text-lg text-center">"{blanked}"</div>
    );
    backContent = (
      <>
        <div className="text-sm text-[var(--text-muted)] mb-2">Answer:</div>
        <div className="text-2xl font-bold">{card.word}</div>
        <div className="text-sm mt-2">"{sentence}"</div>
      </>
    );
  } else {
    frontContent = (
      <div className="w-full">
        <div className="text-lg font-medium mb-4">{card.translation}</div>
        <div className="space-y-2">
          {mcqOptions.map((opt, i) => (
            <div key={i} className="p-2 rounded border border-[var(--border)] text-sm">{opt}</div>
          ))}
        </div>
      </div>
    );
    backContent = (
      <div className="text-2xl font-bold">{card.word}</div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-[var(--text-muted)]">
          {currentIndex + 1} / {cards.length}
        </div>
        <ProgressBar value={currentIndex + 1} max={cards.length} className="flex-1 mx-4" />
        <Button variant="ghost" size="sm" onClick={() => { reset(); setPhase('setup'); }}>✕</Button>
      </div>

      <Flashcard front={frontContent} back={backContent} isFlipped={isFlipped} onFlip={flip} />

      {mode === 'fill-blank' && !isFlipped && (
        <div className="max-w-md mx-auto mt-4 flex gap-2">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type the missing word..."
            onKeyDown={(e) => e.key === 'Enter' && flip()}
          />
          <Button onClick={flip}>Check</Button>
        </div>
      )}

      {isFlipped && <DifficultyButtons onSelect={submitAnswer} />}

      {!isFlipped && mode !== 'fill-blank' && (
        <p className="text-center text-sm text-[var(--text-muted)] mt-4">Click the card to reveal the answer</p>
      )}
    </div>
  );
}

function generateMcqOptions(card: any, allCards: any[]): string[] {
  const correct = card.word;
  const others = allCards
    .filter((c) => c.id !== card.id)
    .map((c) => c.word)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [...others, correct].sort(() => Math.random() - 0.5);
  return options;
}
