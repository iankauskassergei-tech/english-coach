'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/components/vocabulary/filter-bar';
import { WordRow } from '@/components/vocabulary/word-row';
import { WordForm } from '@/components/vocabulary/word-form';
import { WordDetail } from '@/components/vocabulary/word-detail';

export default function VocabularyPage() {
  const [words, setWords] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [pos, setPos] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);

  const fetchWords = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (pos) params.set('pos', pos);
    if (difficulty) params.set('difficulty', difficulty);
    params.set('page', String(page));

    const res = await fetch(`/api/words?${params}`);
    const data = await res.json();
    setWords(data.words);
    setTotal(data.total);
    setTotalPages(data.totalPages);
  }, [search, pos, difficulty, page]);

  useEffect(() => { fetchWords(); }, [fetchWords]);

  const handleCreate = async (data: any) => {
    await fetch('/api/words', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    fetchWords();
  };

  const handleUpdate = async (data: any) => {
    await fetch(`/api/words/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    setEditing(null);
    fetchWords();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this word?')) return;
    await fetch(`/api/words/${id}`, { method: 'DELETE' });
    fetchWords();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Header title="Vocabulary" subtitle={`${total} words in your collection`} />
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>+ Add Word</Button>
      </div>

      <FilterBar
        search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}
        pos={pos} onPosChange={(v) => { setPos(v); setPage(1); }}
        difficulty={difficulty} onDifficultyChange={(v) => { setDifficulty(v); setPage(1); }}
      />

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
        {words.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-muted)]">No words found. Add your first word!</div>
        ) : (
          words.map((w) => (
            <WordRow
              key={w.id}
              word={w}
              onEdit={(word) => { setEditing(word); setFormOpen(true); }}
              onDelete={handleDelete}
              onClick={(word) => { setSelected(word); setDetailOpen(true); }}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
          <span className="text-sm text-[var(--text-muted)] py-2">Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}

      <WordForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={editing ? handleUpdate : handleCreate}
        initial={editing}
      />

      <WordDetail isOpen={detailOpen} onClose={() => setDetailOpen(false)} word={selected} />
    </div>
  );
}
