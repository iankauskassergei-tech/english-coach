'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';

export default function WritingPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [draft, setDraft] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    fetch('/api/writing/tasks').then(r => r.json()).then(setTasks);
  }, []);

  const checkWriting = async () => {
    if (!draft.trim()) return;
    setIsChecking(true);
    const res = await fetch('/api/writing/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: draft }),
    });
    const data = await res.json();
    setFeedback(data);
    setIsChecking(false);
  };

  return (
    <div>
      <Header title="Writing Practice" subtitle="Practice professional writing with feedback" />

      {!selectedTask ? (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">Select a task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tasks.map((task) => (
              <Card key={task.id} onClick={() => setSelectedTask(task)}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="accent">{task.type}</Badge>
                </div>
                <h4 className="font-medium mb-1">{task.scenario}</h4>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{task.prompt}</p>
              </Card>
            ))}
          </div>
          <Card className="text-center py-8">
            <p className="text-[var(--text-muted)] mb-3">Or practice with your own text</p>
            <Button onClick={() => setSelectedTask({ type: 'free', prompt: 'Write anything you want', scenario: 'Free writing practice' })}>
              Free Writing
            </Button>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedTask(null); setDraft(''); setFeedback(null); }}>
            ← Back to tasks
          </Button>

          <Card>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="accent">{selectedTask.type}</Badge>
              <h3 className="font-semibold">{selectedTask.scenario}</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-4">{selectedTask.prompt}</p>
            {selectedTask.context && (
              <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] text-sm mb-4">
                <span className="font-medium">Context:</span> {selectedTask.context}
              </div>
            )}
          </Card>

          <Card>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Start writing here..."
              className="min-h-[200px]"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-[var(--text-muted)]">
                {draft.split(/\s+/).filter(Boolean).length} words
              </span>
              <Button onClick={checkWriting} disabled={!draft.trim() || isChecking}>
                {isChecking ? 'Checking...' : 'Check Writing'}
              </Button>
            </div>
          </Card>

          {feedback && (
            <Card>
              <h3 className="font-semibold mb-4">Feedback</h3>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--accent)]">{feedback.clarityScore}</div>
                  <div className="text-xs text-[var(--text-muted)]">Clarity Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{feedback.stats.wordCount}</div>
                  <div className="text-xs text-[var(--text-muted)]">Words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{feedback.stats.vocabDiversity}%</div>
                  <div className="text-xs text-[var(--text-muted)]">Vocab Diversity</div>
                </div>
              </div>

              <ProgressBar value={feedback.clarityScore} className="mb-4" color={feedback.clarityScore >= 70 ? 'success' : feedback.clarityScore >= 40 ? 'warning' : 'accent'} />

              {feedback.issues.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-[var(--text-secondary)]">Issues Found</h4>
                  {feedback.issues.map((issue: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg border border-[var(--warning)] bg-amber-50 dark:bg-amber-900/10">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="warning">{issue.type}</Badge>
                          <p className="text-sm mt-1">
                            <span className="line-through text-[var(--error)]">{issue.original}</span>
                            {' → '}
                            <span className="text-[var(--success)] font-medium">{issue.suggestion}</span>
                          </p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">{issue.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[var(--success)] font-medium">No issues found! Great writing!</p>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
