'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface WordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initial?: any;
}

export function WordForm({ isOpen, onClose, onSubmit, initial }: WordFormProps) {
  const [word, setWord] = useState(initial?.word || '');
  const [ipa, setIpa] = useState(initial?.ipa || '');
  const [pos, setPos] = useState(initial?.pos || 'noun');
  const [translation, setTranslation] = useState(initial?.translation || '');
  const [examples, setExamples] = useState(initial?.examples ? JSON.parse(initial.examples).join('\n') : '');
  const [synonyms, setSynonyms] = useState(initial?.synonyms ? JSON.parse(initial.synonyms).join(', ') : '');
  const [difficulty, setDifficulty] = useState(String(initial?.difficulty || 1));

  const handleSubmit = () => {
    onSubmit({
      word,
      ipa,
      pos,
      translation,
      examples: examples.split('\n').filter((e: string) => e.trim()),
      synonyms: synonyms.split(',').map((s: string) => s.trim()).filter(Boolean),
      difficulty: parseInt(difficulty),
    });
    setWord('');
    setIpa('');
    setTranslation('');
    setExamples('');
    setSynonyms('');
    setDifficulty('1');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Word' : 'Add Word'}>
      <div className="space-y-4">
        <Input label="Word" value={word} onChange={(e) => setWord(e.target.value)} placeholder="negotiate" />
        <Input label="IPA" value={ipa} onChange={(e) => setIpa(e.target.value)} placeholder="/nɪˈɡoʊʃieɪt/" />
        <Select
          label="Part of Speech"
          value={pos}
          onChange={(e) => setPos(e.target.value)}
          options={[
            { value: 'noun', label: 'Noun' },
            { value: 'verb', label: 'Verb' },
            { value: 'adjective', label: 'Adjective' },
            { value: 'adverb', label: 'Adverb' },
            { value: 'phrase', label: 'Phrase' },
          ]}
        />
        <Input label="Russian Translation" value={translation} onChange={(e) => setTranslation(e.target.value)} placeholder="вести переговоры" />
        <Textarea label="Examples (one per line)" value={examples} onChange={(e) => setExamples(e.target.value)} placeholder="We need to negotiate the terms." />
        <Input label="Synonyms (comma-separated)" value={synonyms} onChange={(e) => setSynonyms(e.target.value)} placeholder="discuss, bargain" />
        <Select
          label="Difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          options={[
            { value: '1', label: 'Easy' },
            { value: '2', label: 'Medium' },
            { value: '3', label: 'Hard' },
            { value: '4', label: 'Expert' },
          ]}
        />
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!word.trim()}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}
