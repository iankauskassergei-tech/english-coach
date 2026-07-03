import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const db = getDb();
  const tasks = db.prepare('SELECT * FROM writing_tasks ORDER BY type, scenario').all();
  return NextResponse.json(tasks);
}
