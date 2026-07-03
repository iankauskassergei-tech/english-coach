import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const word = db.prepare('SELECT * FROM words WHERE id = ?').get(id);
  if (!word) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(word);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const body = await req.json();
  const { word, ipa, pos, translation, examples, synonyms, difficulty } = body;

  db.prepare(
    'UPDATE words SET word=?, ipa=?, pos=?, translation=?, examples=?, synonyms=?, difficulty=?, updated_at=datetime(\'now\') WHERE id=?'
  ).run(word, ipa, pos, translation, JSON.stringify(examples), JSON.stringify(synonyms), difficulty, id);

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  db.prepare('DELETE FROM words WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
