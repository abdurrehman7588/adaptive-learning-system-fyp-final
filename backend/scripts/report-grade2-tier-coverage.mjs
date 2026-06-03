/**
 * Grade 2 full tier coverage report (catalog + routing).
 * Run: node scripts/report-grade2-tier-coverage.mjs
 */
import { FULL_GRADE_CATALOG } from '../prisma/quiz/catalog/index.js';
import {
  FROZEN_CATEGORIES,
  GRADE_2_QUIZZES_PER_CATEGORY,
} from '../prisma/quiz/catalog/utils.js';
import { recommendedDifficultyForStatus } from '../src/modules/adaptive/adaptiveRules.js';
import { selectQuizForAdaptiveTier } from '../src/modules/adaptive/adaptiveTierRouting.js';

const TIERS = ['easy', 'medium', 'hard'];
const STATUSES = ['needs_practice', 'progressing', 'mastery', 'unattempted'];

const g2 = FULL_GRADE_CATALOG.filter((q) => q.gradeLevel === 'grade_2');
const addedThisPhase = [
  'grade_2-memory-easy',
  'grade_2-memory-hard',
  'grade_2-problem_solving-easy',
  'grade_2-problem_solving-hard',
  'grade_2-critical_thinking-easy',
  'grade_2-critical_thinking-hard',
];

console.log('# Grade 2 Adaptive Difficulty — Complete Coverage Report\n');
console.log(`Generated: ${new Date().toISOString().slice(0, 10)}\n`);
console.log(`**Grade 2 quizzes:** ${g2.length} (expected ${FROZEN_CATEGORIES.length * GRADE_2_QUIZZES_PER_CATEGORY})\n`);

const gaps = [];

for (const category of FROZEN_CATEGORIES) {
  const cell = g2.filter((q) => q.category === category);
  const byTier = Object.fromEntries(
    TIERS.map((t) => [t, cell.filter((q) => q.difficultyLevel === t)]),
  );
  const missing = TIERS.filter((t) => byTier[t].length === 0);

  console.log(`## ${category}\n`);
  console.log('| Tier | Count | Slug |');
  console.log('|------|-------|------|');
  for (const tier of TIERS) {
    const quiz = byTier[tier][0];
    console.log(`| ${tier} | ${byTier[tier].length} | ${quiz?.slug ?? '—'} |`);
  }
  if (missing.length) {
    gaps.push({ category, missing });
    console.log(`\n**Missing tiers:** ${missing.join(', ')}\n`);
  } else {
    console.log('\n**Missing tiers:** none\n');
  }

  console.log('| Status | Recommended | Routed slug | tierMatched |');
  console.log('|--------|-------------|-------------|-------------|');
  for (const status of STATUSES) {
    const rec = recommendedDifficultyForStatus(status);
    const { quiz, tierMatched } = selectQuizForAdaptiveTier(g2, category, rec, 'grade_2');
    console.log(
      `| ${status} | ${rec} | ${quiz?.slug ?? '—'} | ${tierMatched} |`,
    );
    if (!tierMatched) {
      gaps.push({ category, status, issue: 'tierMatched false' });
    }
  }
  console.log('');
}

console.log('## Added quizzes (this phase)\n');
for (const slug of addedThisPhase) {
  const q = g2.find((row) => row.slug === slug);
  console.log(`- \`${slug}\` — ${q?.title ?? 'NOT IN CATALOG'}`);
}

console.log('\n## Remaining gaps\n');
if (gaps.length === 0) {
  console.log('**None.** All Grade 2 categories have easy / medium / hard and routing tierMatched=true for all statuses.\n');
} else {
  console.log(JSON.stringify(gaps, null, 2));
}

console.log('\n## Other grades\n');
console.log('Unchanged — 6 quizzes per grade (single tier per category).\n');
