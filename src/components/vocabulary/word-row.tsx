'use client';

import { Badge } from '@/components/ui/badge';

interface WordRowProps {
  word: any;
  onEdit: (word: any) => void;
  onDelete: (id: number) => void;
  onClick: (word: any) => void;
}

export function WordRow({ word, onEdit, onDelete, onClick }: WordRowProps) {
  const posColors: Record<string, 'default' | 'accent' | 'success' | 'warning' | 'error'> = {
    noun: 'accent',
    verb: 'success',
    adjective: 'warning',
    adverb: 'default',
  };

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors border-b border-[var(--border)]"
      onClick={() => onClick(word)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{word.word}</span>
          {word.ipa && <span className="text-xs text-[var(--text-muted)]">{word.ipa}</span>}
          {word.pos && <Badge variant={posColors[word.pos] || 'default'}>{word.pos}</Badge>}
          {word.state && (
            <Badge variant={word.state === 'mastered' ? 'success' : word.state === 'review' ? 'accent' : word.state === 'learning' ? 'warning' : 'default'}>
              {word.state}
            </Badge>
          )}
        </div>
        <div className="text-sm text-[var(--text-secondary)] truncate">{word.translation}</div>
      </div>
      <div className="flex gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(word); }}
          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] rounded"
        >
          ✏️
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(word.id); }}
          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--error)] rounded"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
