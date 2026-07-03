'use client';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  pos: string;
  onPosChange: (v: string) => void;
  difficulty: string;
  onDifficultyChange: (v: string) => void;
}

export function FilterBar({ search, onSearchChange, pos, onPosChange, difficulty, onDifficultyChange }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="flex-1">
        <Input
          placeholder="Search words..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select
        value={pos}
        onChange={(e) => onPosChange(e.target.value)}
        options={[
          { value: '', label: 'All POS' },
          { value: 'noun', label: 'Noun' },
          { value: 'verb', label: 'Verb' },
          { value: 'adjective', label: 'Adjective' },
          { value: 'adverb', label: 'Adverb' },
          { value: 'phrase', label: 'Phrase' },
        ]}
      />
      <Select
        value={difficulty}
        onChange={(e) => onDifficultyChange(e.target.value)}
        options={[
          { value: '', label: 'All Levels' },
          { value: '1', label: 'Easy' },
          { value: '2', label: 'Medium' },
          { value: '3', label: 'Hard' },
          { value: '4', label: 'Expert' },
        ]}
      />
    </div>
  );
}
