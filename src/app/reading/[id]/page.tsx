'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function ReadingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('');
  const [text, setText] = useState<any>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/reading/${id}`).then(r => r.json()).then(setText);
  }, [id]);

  if (!text) return <div className="p-8 text-center text-[var(--text-muted)]">Loading...</div>;

  const vocabHighlights: string[] = JSON.parse(text.vocab_ids || '[]');
  const questions = text.questions ? JSON.parse(text.questions) : [];

  const renderText = () => {
    const words = text.body.split(/(\s+)/);
    return words.map((word: string, i: number) => {
      const clean = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
      const isHighlighted = vocabHighlights.some((v) => v.toLowerCase() === clean);
      if (isHighlighted) {
        return (
          <span
            key={i}
            className="cursor-pointer bg-[var(--accent-light)] text-[var(--accent)] px-0.5 rounded hover:bg-[var(--accent)] hover:text-white transition-colors"
            onClick={() => setSelectedWord(word.replace(/[^a-zA-Z]/g, ''))}
          >
            {word}
          </span>
        );
      }
      return <span key={i}>{word}</span>;
    });
  };

  const handleSubmit = () => setSubmitted(true);
  const correctCount = questions.filter((q: any, i: number) => answers[i] === q.answer).length;

  return (
    <div>
      <Link href="/reading" className="text-sm text-[var(--accent)] hover:underline">← Back to texts</Link>

      <div className="mt-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold">{text.title}</h1>
          <Badge variant="accent">{text.level}</Badge>
        </div>
        <p className="text-sm text-[var(--text-muted)]">{text.word_count} words • {text.category}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="text-base leading-relaxed">
              {renderText()}
            </div>
          </Card>

          {selectedWord && (
            <Card className="mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedWord}</h3>
                  <p className="text-sm text-[var(--text-muted)]">Click "Save" to add to your vocabulary</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setSelectedWord(null)}>Close</Button>
                  <Button size="sm" onClick={() => {
                    fetch('/api/words', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ word: selectedWord }),
                    });
                    setSelectedWord(null);
                  }}>Save to Vocab</Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <h3 className="font-semibold mb-4">Comprehension</h3>
            {questions.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No questions for this text.</p>
            ) : (
              <div className="space-y-4">
                {questions.map((q: any, i: number) => (
                  <div key={i}>
                    <p className="text-sm font-medium mb-2">{q.q}</p>
                    <div className="space-y-1">
                      {q.options.map((opt: string, j: number) => (
                        <button
                          key={j}
                          className={`w-full text-left p-2 rounded text-sm border transition-colors ${
                            answers[i] === j
                              ? submitted
                                ? j === q.answer
                                  ? 'border-[var(--success)] bg-emerald-50 dark:bg-emerald-900/20'
                                  : 'border-[var(--error)] bg-red-50 dark:bg-red-900/20'
                                : 'border-[var(--accent)] bg-[var(--accent-light)]'
                              : submitted && j === q.answer
                              ? 'border-[var(--success)] bg-emerald-50 dark:bg-emerald-900/20'
                              : 'border-[var(--border)] hover:bg-[var(--bg-tertiary)]'
                          }`}
                          onClick={() => !submitted && setAnswers({ ...answers, [i]: j })}
                          disabled={submitted}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {!submitted ? (
                  <Button className="w-full" onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length}>
                    Check Answers
                  </Button>
                ) : (
                  <div className="text-center">
                    <p className="text-lg font-bold">{correctCount} / {questions.length}</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {correctCount === questions.length ? 'Perfect! 🎉' : 'Keep practicing!'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
