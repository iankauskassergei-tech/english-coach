import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const { id } = await params;
  const text = db.prepare('SELECT * FROM reading_texts WHERE id = ?').get(id);
  if (!text) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(text);
}
