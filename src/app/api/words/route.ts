import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);

  const search = searchParams.get('search') || '';
  const pos = searchParams.get('pos') || '';
  const difficulty = searchParams.get('difficulty') || '';
  const source = searchParams.get('source') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 50;
  const offset = (page - 1) * limit;

  let where = '1=1';
  const params: any[] = [];

  if (search) {
    where += ' AND (w.word LIKE ? OR w.translation LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (pos) {
    where += ' AND w.pos = ?';
    params.push(pos);
  }
  if (difficulty) {
    where += ' AND w.difficulty = ?';
    params.push(parseInt(difficulty));
  }
  if (source) {
    where += ' AND w.source = ?';
    params.push(source);
  }

  const total = (db.prepare(`SELECT COUNT(*) as c FROM words w WHERE ${where}`).get(...params) as { c: number }).c;
  const words = db.prepare(
    `SELECT w.*, r.state, r.next_review FROM words w LEFT JOIN reviews r ON w.id = r.word_id WHERE ${where} ORDER BY w.created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, limit, offset);

  return NextResponse.json({ words, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();

  const { word, ipa, pos, translation, examples, synonyms, difficulty } = body;

  const result = db.prepare(
    'INSERT INTO words (word, ipa, pos, translation, examples, synonyms, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(word, ipa || '', pos || '', translation || '', JSON.stringify(examples || []), JSON.stringify(synonyms || []), difficulty || 1);

  db.prepare('INSERT INTO reviews (word_id, state) VALUES (?, ?)').run(result.lastInsertRowid, 'new');

  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
