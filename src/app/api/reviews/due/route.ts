import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const db = getDb();

  const dueCards = db.prepare(
    "SELECT w.*, r.state, r.ease_factor, r.interval, r.repetitions FROM words w JOIN reviews r ON w.id = r.word_id WHERE r.next_review <= datetime('now') AND r.state != 'new' ORDER BY r.next_review ASC LIMIT 50"
  ).all();

  return NextResponse.json({ cards: dueCards, count: dueCards.length });
}
