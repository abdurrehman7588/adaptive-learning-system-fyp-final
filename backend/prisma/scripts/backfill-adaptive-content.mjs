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

  const missingSlug = await prisma.quiz.count({ where: { slug: null } });
  console.log(`Quizzes missing slug after backfill: ${missingSlug}`);
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
