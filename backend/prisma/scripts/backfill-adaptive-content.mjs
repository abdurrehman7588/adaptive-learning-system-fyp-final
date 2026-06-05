/**
 * M2 backfill — idempotent repair for grade/category/slug/answered_at after migration.
 * Run: node prisma/scripts/backfill-adaptive-content.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const QUIZ_SEED_MAP = [
  { title: 'Pattern Puzzles', slug: 'pattern-puzzles', category: 'pattern_recognition', gradeLevel: 'grade_2', difficultyLevel: 'easy' },
  { title: 'World Explorer', slug: 'world-explorer', category: 'science', gradeLevel: 'grade_3', difficultyLevel: 'easy' },
  { title: 'Logic Lab', slug: 'logic-lab', category: 'critical_thinking', gradeLevel: 'grade_4', difficultyLevel: 'medium' },
];

function mapChildGrade(text) {
  if (!text?.trim()) return null;
  const lower = text.trim().toLowerCase();
  if (/pre/.test(lower)) return 'pre_k';
  if (/kinder|^k$/.test(lower)) return 'kindergarten';
  if (/1|first/.test(lower)) return 'grade_1';
  if (/2|second/.test(lower)) return 'grade_2';
  if (/3|third/.test(lower)) return 'grade_3';
  if (/4|fourth/.test(lower)) return 'grade_4';
  if (/5|fifth/.test(lower)) return 'grade_5';
  if (/6|sixth/.test(lower)) return 'grade_6';
  if (/^grade_([1-6])$/.test(lower)) return lower;
  return null;
}

/** @param {string | null | undefined} title */
function slugifyFromTitle(title) {
  if (!title?.trim()) return null;
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug.slice(0, 80) : null;
}

function isMissingSlug(slug) {
  return slug == null || String(slug).trim() === '';
}

/**
 * @param {string} baseSlug
 * @param {number} excludeQuizId
 */
async function ensureUniqueSlug(baseSlug, excludeQuizId) {
  let candidate = baseSlug;
  let suffix = 0;

  while (true) {
    const existing = await prisma.quiz.findFirst({
      where: {
        slug: candidate,
        ...(excludeQuizId ? { NOT: { id: excludeQuizId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return candidate;
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
}

async function backfillChildren() {
  const children = await prisma.child.findMany({
    select: { id: true, gradeLevel: true },
  });
  let updated = 0;
  for (const child of children) {
    if (child.gradeLevel) continue;
    const mapped = mapChildGrade(String(child.gradeLevel));
    if (mapped) {
      await prisma.child.update({
        where: { id: child.id },
        data: { gradeLevel: mapped },
      });
      updated += 1;
    }
  }
  console.log(`Children grade backfill: ${updated} updated (${children.length} total)`);
}

async function backfillQuizzes() {
  for (const row of QUIZ_SEED_MAP) {
    const quiz = await prisma.quiz.findFirst({ where: { title: row.title } });
    if (!quiz) continue;
    await prisma.quiz.update({
      where: { id: quiz.id },
      data: {
        slug: row.slug,
        category: row.category,
        gradeLevel: row.gradeLevel,
        difficultyLevel: row.difficultyLevel,
      },
    });
  }

  const quizzes = await prisma.quiz.findMany({
    select: { id: true, title: true, slug: true },
  });

  /** @type {Array<{ id: number, title: string, slug: string | null }>} */
  const problemQuizzes = quizzes.filter((quiz) => isMissingSlug(quiz.slug));

  if (problemQuizzes.length > 0) {
    console.log(
      `Found ${problemQuizzes.length} quiz(es) with missing slug:`,
      JSON.stringify(problemQuizzes, null, 2),
    );
  }

  let repaired = 0;
  for (const quiz of problemQuizzes) {
    const generated = slugifyFromTitle(quiz.title);
    if (!generated) {
      console.warn(
        `Quiz id=${quiz.id} title="${quiz.title}" — cannot generate slug from title; skipped`,
      );
      continue;
    }

    const uniqueSlug = await ensureUniqueSlug(generated, quiz.id);
    await prisma.quiz.update({
      where: { id: quiz.id },
      data: { slug: uniqueSlug },
    });
    console.log(
      `Quiz id=${quiz.id} title="${quiz.title}" — slug repaired: "${quiz.slug ?? ''}" → "${uniqueSlug}"`,
    );
    repaired += 1;
  }

  const remaining = (await prisma.quiz.findMany({ select: { slug: true } })).filter((quiz) =>
    isMissingSlug(quiz.slug),
  ).length;

  console.log(
    `Quizzes missing slug after backfill: ${remaining} (${repaired} repaired from ${problemQuizzes.length} problem record(s))`,
  );
}

async function backfillAnsweredAt() {
  const result = await prisma.$executeRaw`
    UPDATE quiz_attempt_answers aa
    SET answered_at = COALESCE(a.completed_at, a.started_at)
    FROM quiz_attempts a
    WHERE aa.attempt_id = a.id AND aa.answered_at IS NULL
  `;
  console.log(`answered_at rows updated: ${result}`);
}

async function main() {
  await backfillChildren();
  await backfillQuizzes();
  await backfillAnsweredAt();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
