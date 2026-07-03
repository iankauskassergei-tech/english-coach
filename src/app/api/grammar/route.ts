import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const db = getDb();
  const topic = req.nextUrl.searchParams.get('topic');

  if (!topic) {
    const topics = db.prepare('SELECT topic, COUNT(*) as count FROM grammar_exercises GROUP BY topic').all();
    return NextResponse.json(topics);
  }

  const exercises = db.prepare(
    'SELECT * FROM grammar_exercises WHERE topic = ? ORDER BY difficulty, RANDOM()'
  ).all(topic);

  return NextResponse.json(exercises);
}
