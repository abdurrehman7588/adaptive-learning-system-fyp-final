import { FULL_CATALOG, FULL_GRADE_CATALOG } from './quiz/catalog/index.js';
import { upsertCatalogQuiz } from './quiz/upsertQuiz.js';

export { FULL_CATALOG, FULL_GRADE_CATALOG };

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
 * Idempotent published quizzes — full Pre-K–Grade 6 tier grid (144 quizzes).
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export async function seedQuizzes(prisma) {
  const catalogSlugs = FULL_GRADE_CATALOG.map((spec) => spec.slug);
  const existingRows = await prisma.quiz.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existingRows.map((row) => row.slug));

  const missingSpecs = FULL_GRADE_CATALOG.filter((spec) => !existingSlugs.has(spec.slug));
  const refreshSpecs = FULL_GRADE_CATALOG.filter((spec) => existingSlugs.has(spec.slug));
  const forceRefresh = process.env.SEED_REFRESH_CATALOG === '1';

  if (missingSpecs.length > 0) {
    console.log(`Seeding ${missingSpecs.length} missing catalog quiz(zes)…`);
    for (let i = 0; i < missingSpecs.length; i += 1) {
      const spec = missingSpecs[i];
      await upsertCatalogQuiz(prisma, { ...spec, isPublished: true });
      if ((i + 1) % 12 === 0 || i + 1 === missingSpecs.length) {
        console.log(`  missing: ${i + 1}/${missingSpecs.length}`);
      }
    }
  } else {
    console.log('No missing catalog quizzes — catalog slugs already present.');
  }

  if (forceRefresh && refreshSpecs.length > 0) {
    console.log(`Refreshing ${refreshSpecs.length} existing catalog quiz(zes)…`);
    for (let i = 0; i < refreshSpecs.length; i += 1) {
      const spec = refreshSpecs[i];
      await upsertCatalogQuiz(prisma, { ...spec, isPublished: true });
      if ((i + 1) % 24 === 0 || i + 1 === refreshSpecs.length) {
        console.log(`  refresh: ${i + 1}/${refreshSpecs.length}`);
      }
    }
  }

  const removed = await prisma.quiz.deleteMany({
    where: { slug: { in: RETIRED_QUIZ_SLUGS } },
  });
  if (removed.count > 0) {
    console.log(`Removed ${removed.count} retired quiz(zes)`);
  }

  await prisma.quiz.updateMany({
    where: { slug: { in: catalogSlugs } },
    data: { isPublished: true },
  });

  const unpublishedOrphans = await prisma.quiz.updateMany({
    where: { slug: { notIn: catalogSlugs } },
    data: { isPublished: false },
  });
  if (unpublishedOrphans.count > 0) {
    console.log(`Unpublished ${unpublishedOrphans.count} non-catalog quiz(zes)`);
  }

  const expected = FULL_GRADE_CATALOG.length;
  const count = await prisma.quiz.count({ where: { isPublished: true } });

  if (count !== expected) {
    const publishedRows = await prisma.quiz.findMany({
      where: { isPublished: true },
      select: { slug: true },
    });
    const publishedSlugs = new Set(publishedRows.map((row) => row.slug));
    const missing = catalogSlugs.filter((slug) => !publishedSlugs.has(slug));
    throw new Error(
      `Catalog seed incomplete: ${count}/${expected} published. Missing slugs: ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? '…' : ''}`,
    );
  }

  console.log(`Quiz catalog ready: ${count} published quiz(zes)`);
}
