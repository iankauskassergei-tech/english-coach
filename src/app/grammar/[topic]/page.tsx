'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import Link from 'next/link';

const topicNames: Record<string, string> = {
  'tenses': 'Tenses',
  'articles': 'Articles',
  'prepositions': 'Prepositions',
  'conditionals': 'Conditionals',
  'passive-voice': 'Passive Voice',
  'reported-speech': 'Reported Speech',
  'phrasal-verbs': 'Phrasal Verbs',
};

export default function GrammarTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const [topic, setTopic] = useState('');
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    params.then(p => setTopic(p.topic));
  }, [params]);

  useEffect(() => {
    if (!topic) return;
    fetch(`/api/grammar?topic=${topic}`).then(r => r.json()).then(setExercises);
  }, [topic]);

  const current = exercises[currentIndex];

  const checkAnswer = () => {
    if (!current) return;
    let userAnswer = '';
    if (current.type === 'mcq') {
      userAnswer = selected !== null ? current.options[selected] : '';
    } else {
      userAnswer = answer.trim();
    }

    const correct = userAnswer.toLowerCase() === current.answer.toLowerCase();
    setIsCorrect(correct);
    setChecked(true);
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  };

  const nextExercise = () => {
    setAnswer('');
    setSelected(null);
    setChecked(false);
    setIsCorrect(false);
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(exercises.length);
    }
  };

  if (!topic) return null;

  if (exercises.length === 0) {
    return (
      <div>
        <Link href="/grammar" className="text-sm text-[var(--accent)] hover:underline">← Back</Link>
        <Header title={topicNames[topic] || topic} />
        <Card className="text-center py-8">
          <p className="text-[var(--text-muted)]">No exercises available for this topic.</p>
        </Card>
      </div>
    );
  }

  if (currentIndex >= exercises.length) {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return (
      <div>
        <Link href="/grammar" className="text-sm text-[var(--accent)] hover:underline">← Back</Link>
        <div className="max-w-md mx-auto text-center mt-12 space-y-6">
          <div className="text-5xl">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚'}</div>
          <h2 className="text-2xl font-bold">Topic Complete!</h2>
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center"><div className="text-2xl font-bold">{stats.total}</div><div className="text-xs text-[var(--text-muted)]">Done</div></Card>
            <Card className="text-center"><div className="text-2xl font-bold text-[var(--success)]">{stats.correct}</div><div className="text-xs text-[var(--text-muted)]">Correct</div></Card>
            <Card className="text-center"><div className="text-2xl font-bold">{pct}%</div><div className="text-xs text-[var(--text-muted)]">Score</div></Card>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => { setCurrentIndex(0); setStats({ correct: 0, total: 0 }); }}>Practice Again</Button>
            <Link href="/grammar"><Button variant="secondary">All Topics</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/grammar" className="text-sm text-[var(--accent)] hover:underline">← Back</Link>
      <Header title={topicNames[topic] || topic} />

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[var(--text-muted)]">{currentIndex + 1} / {exercises.length}</span>
        <ProgressBar value={currentIndex + 1} max={exercises.length} className="flex-1 mx-4" />
        <Badge>{current.difficulty === 1 ? 'Easy' : current.difficulty === 2 ? 'Medium' : 'Hard'}</Badge>
      </div>

      <Card className="mb-4">
        {current.context && (
          <p className="text-sm text-[var(--text-muted)] mb-3 italic">{current.context}</p>
        )}
        <p className="text-lg font-medium mb-4">{current.prompt}</p>

        {current.type === 'mcq' && current.options ? (
          <div className="space-y-2">
            {JSON.parse(current.options).map((opt: string, i: number) => (
              <button
                key={i}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                  checked
                    ? i === JSON.parse(current.options).indexOf(current.answer)
                      ? 'border-[var(--success)] bg-emerald-50 dark:bg-emerald-900/20'
                      : selected === i
                      ? 'border-[var(--error)] bg-red-50 dark:bg-red-900/20'
                      : 'border-[var(--border)]'
                    : selected === i
                    ? 'border-[var(--accent)] bg-[var(--accent-light)]'
                    : 'border-[var(--border)] hover:bg-[var(--bg-tertiary)]'
                }`}
                onClick={() => !checked && setSelected(i)}
                disabled={checked}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="w-full p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
            disabled={checked}
            onKeyDown={(e) => e.key === 'Enter' && !checked && checkAnswer()}
          />
        )}
      </Card>

      {!checked ? (
        <Button className="w-full" onClick={checkAnswer} disabled={current.type === 'mcq' ? selected === null : !answer.trim()}>
          Check Answer
        </Button>
      ) : (
        <div className="space-y-4">
          <Card className={isCorrect ? 'border-[var(--success)]' : 'border-[var(--error)]'}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
              <span className="font-semibold">{isCorrect ? 'Correct!' : 'Incorrect'}</span>
            </div>
            {!isCorrect && (
              <p className="text-sm mb-2">Correct answer: <span className="font-medium text-[var(--success)]">{current.answer}</span></p>
            )}
            {current.explanation && (
              <p className="text-sm text-[var(--text-secondary)]">{current.explanation}</p>
            )}
          </Card>
          <Button className="w-full" onClick={nextExercise}>
            {currentIndex + 1 < exercises.length ? 'Next Exercise' : 'See Results'}
          </Button>
        </div>
      )}
    </div>
  );
}
