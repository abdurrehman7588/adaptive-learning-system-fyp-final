import { FULL_CATALOG } from './quiz/pilotCatalog.js';
import { upsertCatalogQuiz } from './quiz/upsertQuiz.js';

/** Superseded slugs (legacy demos + pre-expansion pilot naming). */
const RETIRED_QUIZ_SLUGS = [
  'pattern-puzzles',
  'world-explorer',
  'logic-lab',
  'grade_1-sequencing-routine-easy',
  'grade_1-visual-grid-easy',
  'grade_2-sequencing-experiment-easy',
  'grade_2-visual-transform-easy',
  'grade_3-sequencing-water-cycle-medium',
  'grade_3-visual-coordinates-medium',
  'grade_1-math-operations-easy',
  'grade_1-science-living-things-easy',
  'grade_1-pattern-skip-count-easy',
  'grade_1-memory-story-easy',
  'grade_1-problem-solving-draw-easy',
  'grade_1-critical-thinking-why-easy',
  'grade_2-math-two-digit-easy',
  'grade_2-science-matter-easy',
  'grade_2-pattern-rules-easy',
  'grade_2-memory-chunks-easy',
  'grade_2-problem-solving-bar-easy',
  'grade_2-critical-thinking-fair-test-easy',
  'grade_3-math-multiply-medium',
  'grade_3-science-forces-medium',
  'grade_3-pattern-functions-medium',
  'grade_3-memory-facts-medium',
  'grade_3-problem-solving-multi-step-medium',
  'grade_3-critical-thinking-cer-medium',
];

/**
 * Idempotent published quizzes — full Pre-K–Grade 6 grid (48 quizzes).
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export async function seedQuizzes(prisma) {
  for (const spec of FULL_CATALOG) {
    await upsertCatalogQuiz(prisma, spec);
  }

  const removed = await prisma.quiz.deleteMany({
    where: { slug: { in: RETIRED_QUIZ_SLUGS } },
  });
  if (removed.count > 0) {
    console.log(`Removed ${removed.count} retired quiz(zes)`);
  }

  const count = await prisma.quiz.count({ where: { isPublished: true } });
  console.log(`Quiz catalog ready: ${count} published quiz(zes)`);
}
