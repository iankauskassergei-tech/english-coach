'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function SaveButton({ wordId }: { wordId: number }) {
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const res = await fetch('/api/words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word_id: wordId, action: 'save' }),
    });
    if (res.ok) setSaved(true);
  };

  if (saved) {
    return <Button variant="ghost" size="sm" disabled>✓ Saved</Button>;
  }

  return <Button variant="secondary" size="sm" onClick={handleSave}>Save</Button>;
}
