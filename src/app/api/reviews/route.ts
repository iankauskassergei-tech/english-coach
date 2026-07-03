import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { sm2 } from '@/lib/sm2';

export async function POST(req: NextRequest) {
  const db = getDb();
  const { word_id, quality } = await req.json();

  const review = db.prepare('SELECT * FROM reviews WHERE word_id = ?').get(word_id) as any;
  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }

  const result = sm2(quality, review.repetitions, review.ease_factor, review.interval);

  const prevState = review.state;
  let newState = result.state;
  if (prevState === 'new') newState = 'learning';

  db.prepare(
    "UPDATE reviews SET state=?, ease_factor=?, interval=?, repetitions=?, next_review=datetime('now', '+' || ? || ' days'), last_review=datetime('now'), lapses=lapses + ? WHERE word_id=?"
  ).run(newState, result.easeFactor, result.interval, result.repetitions, result.interval, quality < 3 ? 1 : 0, word_id);

  db.prepare(
    'INSERT INTO review_log (word_id, quality, prev_state, new_state, prev_interval, new_interval) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(word_id, quality, prevState, newState, review.interval, result.interval);

  const today = new Date().toISOString().split('T')[0];
  db.prepare(
    "INSERT INTO study_sessions (date, reviews_done, new_words) VALUES (?, 1, 0) ON CONFLICT(date) DO UPDATE SET reviews_done = reviews_done + 1"
  ).run(today);

  return NextResponse.json({ success: true, state: newState });
}
