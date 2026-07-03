import { NextRequest, NextResponse } from 'next/server';
import { checkGrammar, calculateClarityScore } from '@/lib/grammar-checker';

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  const issues = checkGrammar(text);
  const clarityScore = calculateClarityScore(text, issues);

  const wordCount = text.split(/\s+/).length;
  const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
  const vocabDiversity = wordCount > 0 ? Math.round((uniqueWords / wordCount) * 100) : 0;

  return NextResponse.json({
    issues,
    clarityScore,
    stats: { wordCount, uniqueWords, vocabDiversity },
  });
}
