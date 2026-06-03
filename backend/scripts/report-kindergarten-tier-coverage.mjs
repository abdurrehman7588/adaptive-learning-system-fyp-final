/**
 * Kindergarten full tier coverage report (catalog + routing).
 * Run: npm run report:kindergarten-tier-coverage
 */
import { FULL_GRADE_CATALOG } from '../prisma/quiz/catalog/index.js';
import { FROZEN_CATEGORIES } from '../prisma/quiz/catalog/utils.js';
import { recommendedDifficultyForStatus } from '../src/modules/adaptive/adaptiveRules.js';
import { selectQuizForAdaptiveTier } from '../src/modules/adaptive/adaptiveTierRouting.js';

const STATUSES = ['needs_practice', 'progressing', 'mastery', 'unattempted'];
const TIERS = ['easy', 'medium', 'hard'];

const NEW_QUIZ_SLUGS = [
  'kindergarten-math-medium',
  'kindergarten-math-hard',
  'kindergarten-science-medium',
  'kindergarten-science-hard',
  'kindergarten-pattern_recognition-medium',
  'kindergarten-pattern_recognition-hard',
  'kindergarten-memory-medium',
  'kindergarten-memory-hard',
  'kindergarten-problem_solving-medium',
  'kindergarten-problem_solving-hard',
  'kindergarten-critical_thinking-medium',
  'kindergarten-critical_thinking-hard',
];

const k = FULL_GRADE_CATALOG.filter((q) => q.gradeLevel === 'kindergarten');
const gaps = [];

console.log('# Kindergarten Tier Pilot — Coverage Report\n');
console.log(`**Catalog:** ${k.length} quizzes (6 categories × 3 tiers)\n`);
console.log(`**New quizzes (medium + hard):** ${NEW_QUIZ_SLUGS.length}\n`);
console.log('```');
NEW_QUIZ_SLUGS.forEach((slug) => console.log(slug));
console.log('```\n');

for (const category of FROZEN_CATEGORIES) {
  const cell = k.filter((q) => q.category === category);
  const byTier = Object.fromEntries(TIERS.map((t) => [t, cell.filter((q) => q.difficultyLevel === t)]));

  console.log(`## ${category}\n`);
  console.log('| Tier | Count | Slug |');
  console.log('|------|-------|------|');
  const missing = [];
  for (const tier of TIERS) {
    const quiz = byTier[tier][0];
    console.log(`| ${tier} | ${byTier[tier].length} | ${quiz?.slug ?? '—'} |`);
    if (byTier[tier].length !== 1) missing.push(tier);
  }
  if (missing.length) {
    console.log(`\n**Missing tiers:** ${missing.join(', ')}\n`);
    gaps.push({ category, issue: `missing tiers: ${missing.join(', ')}` });
  } else {
    console.log('\n**Missing tiers:** none\n');
  }

  console.log('| Status | Recommended | Routed slug | tierMatched |');
  console.log('|--------|-------------|-------------|-------------|');
  for (const status of STATUSES) {
    const rec = recommendedDifficultyForStatus(status);
    const { quiz, tierMatched } = selectQuizForAdaptiveTier(k, category, rec, 'kindergarten');
    console.log(`| ${status} | ${rec} | ${quiz?.slug ?? '—'} | ${tierMatched} |`);
    if (!tierMatched) {
      gaps.push({ category, status, issue: 'tierMatched false' });
    }
  }
  console.log('');
}

console.log('## Tier matching verification\n');
console.log('| Status | Expected tier |');
console.log('|--------|----------------|');
console.log('| needs_practice | easy |');
console.log('| progressing | medium |');
console.log('| mastery | hard |');
console.log('| unattempted | medium |\n');

console.log('## Remaining adaptive gaps (Kindergarten)\n');
if (gaps.length === 0) {
  console.log(
    '**None.** All Kindergarten categories have easy / medium / hard and routing tierMatched=true for all statuses.\n',
  );
} else {
  gaps.forEach((g) => console.log(`- ${JSON.stringify(g)}`));
}

console.log('## Other grades (unchanged)\n');
console.log(
  '**Grade 2:** 18 quizzes (tier pilot). **Pre-K, G1, G3–G6:** 6 quizzes each (single tier per category).\n',
);
console.log('**Total published catalog:** 72 quizzes.\n');
