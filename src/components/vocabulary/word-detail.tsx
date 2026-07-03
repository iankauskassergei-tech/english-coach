'use client';

import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';

interface WordDetailProps {
  isOpen: boolean;
  onClose: () => void;
  word: any;
}

export function WordDetail({ isOpen, onClose, word }: WordDetailProps) {
  if (!word) return null;

  const examples: string[] = JSON.parse(word.examples || '[]');
  const synonyms: string[] = JSON.parse(word.synonyms || '[]');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={word.word}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{word.word}</span>
          {word.ipa && <span className="text-sm text-[var(--text-muted)]">{word.ipa}</span>}
        </div>

        <div className="flex gap-2">
          {word.pos && <Badge variant="accent">{word.pos}</Badge>}
          {word.difficulty && <Badge>Level {word.difficulty}</Badge>}
          {word.state && (
            <Badge variant={word.state === 'mastered' ? 'success' : 'warning'}>
              {word.state}
            </Badge>
          )}
        </div>

        <div>
          <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Translation</h4>
          <p>{word.translation}</p>
        </div>

        {examples.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Examples</h4>
            <ul className="space-y-1">
              {examples.map((ex, i) => (
                <li key={i} className="text-sm italic text-[var(--text-secondary)]">"{ex}"</li>
              ))}
            </ul>
          </div>
        )}

        {synonyms.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Synonyms</h4>
            <div className="flex flex-wrap gap-1">
              {synonyms.map((s, i) => (
                <Badge key={i} variant="default">{s}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
