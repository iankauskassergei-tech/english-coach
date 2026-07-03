const prepositionCollocations: Record<string, string> = {
  'depend of': 'depend on',
  'interested on': 'interested in',
  'responsible of': 'responsible for',
  'compliant of': 'compliant with',
  'look forward for': 'look forward to',
  'access of': 'access to',
  'consist in': 'consist of',
  'afraid from': 'afraid of',
  'good in': 'good at',
  'different than': 'different from',
  'capable to': 'capable of',
  'related with': 'related to',
  'satisfied from': 'satisfied with',
  'aware about': 'aware of',
  'focus in': 'focus on',
};

const subjectVerbRules = [
  { pattern: /\b(he|she|it)\s+(go|have|do|work|play|run|come|make|take|give)\b/gi, fix: (match: string, sub: string, verb: string) => `${sub} ${verb}s` },
  { pattern: /\b(they|we|you)\s+(goes|has|does|works|plays|runs|comes|makes|takes|gives)\b/gi, fix: (match: string, sub: string, verb: string) => `${sub} ${verb.replace(/s$/, '')}` },
];

interface GrammarIssue {
  type: string;
  original: string;
  suggestion: string;
  explanation: string;
  position: number;
}

export function checkGrammar(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];

  for (const [wrong, correct] of Object.entries(prepositionCollocations)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      issues.push({
        type: 'preposition',
        original: match[0],
        suggestion: correct,
        explanation: `Use "${correct}" instead of "${match[0]}"`,
        position: match.index,
      });
    }
  }

  for (const rule of subjectVerbRules) {
    let match;
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    while ((match = regex.exec(text)) !== null) {
      const suggestion = rule.fix(match[0], match[1], match[2]);
      if (match[0] !== suggestion) {
        issues.push({
          type: 'subject-verb-agreement',
          original: match[0],
          suggestion,
          explanation: `Subject-verb agreement: "${suggestion}"`,
          position: match.index,
        });
      }
    }
  }

  const articleRegex = /\b(a)\s+([aeiou])/gi;
  let articleMatch;
  while ((articleMatch = articleRegex.exec(text)) !== null) {
    issues.push({
      type: 'article',
      original: articleMatch[0],
      suggestion: `an ${articleMatch[2]}`,
      explanation: `Use "an" before vowel sounds: "an ${articleMatch[2]}"`,
      position: articleMatch.index,
    });
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/);
    if (words.length > 40) {
      issues.push({
        type: 'style',
        original: sentence.trim().substring(0, 50) + '...',
        suggestion: 'Consider breaking into shorter sentences',
        explanation: 'Long sentences can be hard to follow. Try splitting into 2-3 shorter sentences.',
        position: 0,
      });
    }
  }

  const doubleNegRegex = /\b(don't|doesn't|didn't|can't|won't|haven't|hasn't|hadn't)\s+(\w+\s+)?(no|nothing|never|nobody|nowhere|neither)\b/gi;
  let dnMatch;
  while ((dnMatch = doubleNegRegex.exec(text)) !== null) {
    issues.push({
      type: 'double-negative',
      original: dnMatch[0],
      suggestion: 'Avoid double negatives',
      explanation: 'In English, double negatives create a positive meaning. Use a single negative.',
      position: dnMatch.index,
    });
  }

  return issues.sort((a, b) => a.position - b.position);
}

export function calculateClarityScore(text: string, issues: GrammarIssue[]): number {
  let score = 100;
  score -= issues.length * 5;

  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  const avgSentenceLen = sentences > 0 ? words / sentences : 0;
  if (avgSentenceLen > 25) score -= 10;

  const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
  const vocabRatio = words > 0 ? uniqueWords / words : 0;
  if (vocabRatio < 0.4) score -= 5;

  return Math.max(0, Math.min(100, score));
}
