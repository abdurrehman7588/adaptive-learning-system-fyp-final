/**
 * Writes backend/docs/CONTENT_COVERAGE_REPORT.md from DB + catalog.
 * Run after: npm run db:seed
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { FULL_GRADE_CATALOG } from '../prisma/quiz/catalog/index.js';
import { ALL_GRADE_LEVELS, FROZEN_CATEGORIES } from '../prisma/quiz/catalog/utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const GRADE_LABELS = {
  pre_k: 'Pre-K',
  kindergarten: 'Kindergarten',
  grade_1: 'Grade 1',
  grade_2: 'Grade 2',
  grade_3: 'Grade 3',
  grade_4: 'Grade 4',
  grade_5: 'Grade 5',
  grade_6: 'Grade 6',
};

const CATEGORY_LABELS = {
  math: 'Math',
  science: 'Science',
  pattern_recognition: 'Pattern Recognition',
  memory: 'Memory',
  problem_solving: 'Problem Solving',
  critical_thinking: 'Critical Thinking',
};

function formatDate() {
  return new Date().toISOString().slice(0, 10);
}

async function main() {
  const published = await prisma.quiz.findMany({
    where: { isPublished: true },
    include: { _count: { select: { questions: true } } },
    orderBy: [{ gradeLevel: 'asc' }, { category: 'asc' }],
  });

  const lines = [];
  lines.push('# Content Coverage Report');
  lines.push('');
  lines.push(`Generated: ${formatDate()}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Target | Actual |');
  lines.push('|--------|--------|--------|');
  lines.push(`| Learning categories (frozen) | ${FROZEN_CATEGORIES.length} | ${FROZEN_CATEGORIES.length} |`);
  lines.push(`| Grade bands | ${ALL_GRADE_LEVELS.length} | ${ALL_GRADE_LEVELS.length} |`);
  lines.push(
    `| Quizzes (1 per category per grade) | ${ALL_GRADE_LEVELS.length * FROZEN_CATEGORIES.length} | ${published.length} |`,
  );

  const questionCounts = published.map((q) => q._count.questions);
  const minQ = questionCounts.length ? Math.min(...questionCounts) : 0;
  const maxQ = questionCounts.length ? Math.max(...questionCounts) : 0;
  const totalQ = questionCounts.reduce((a, b) => a + b, 0);

  lines.push(`| Questions per quiz | 5–10 | min ${minQ}, max ${maxQ} |`);
  lines.push(`| Total questions in catalog | — | ${totalQ} |`);
  lines.push('');
  lines.push('## Categories (frozen)');
  lines.push('');
  for (const id of FROZEN_CATEGORIES) {
    lines.push(`- ${CATEGORY_LABELS[id] ?? id} (\`${id}\`)`);
  }
  lines.push('');
  lines.push('## Coverage matrix');
  lines.push('');
  lines.push('| Grade | ' + FROZEN_CATEGORIES.map((c) => CATEGORY_LABELS[c]).join(' | ') + ' |');
  lines.push('|-------|' + FROZEN_CATEGORIES.map(() => '---').join('|') + '|');

  for (const grade of ALL_GRADE_LEVELS) {
    const cells = FROZEN_CATEGORIES.map((category) => {
      const quiz = published.find((q) => q.gradeLevel === grade && q.category === category);
      if (!quiz) return '❌';
      const n = quiz._count.questions;
      return n >= 5 ? `✅ ${n}Q` : `⚠️ ${n}Q`;
    });
    lines.push(`| ${GRADE_LABELS[grade] ?? grade} | ${cells.join(' | ')} |`);
  }

  lines.push('');
  lines.push('## Quiz inventory');
  lines.push('');
  lines.push('| Grade | Category | Slug | Title | Questions |');
  lines.push('|-------|----------|------|-------|-----------|');

  for (const grade of ALL_GRADE_LEVELS) {
    for (const category of FROZEN_CATEGORIES) {
      const dbQuiz = published.find((q) => q.gradeLevel === grade && q.category === category);
      const spec = FULL_GRADE_CATALOG.find((q) => q.gradeLevel === grade && q.category === category);
      if (dbQuiz) {
        lines.push(
          `| ${GRADE_LABELS[grade]} | ${CATEGORY_LABELS[category]} | \`${dbQuiz.slug}\` | ${dbQuiz.title} | ${dbQuiz._count.questions} |`,
        );
      } else if (spec) {
        lines.push(
          `| ${GRADE_LABELS[grade]} | ${CATEGORY_LABELS[category]} | \`${spec.slug}\` | ${spec.title} | ${spec.questions.length} (not in DB) |`,
        );
      }
    }
  }

  lines.push('');
  lines.push('## Student grade filtering');
  lines.push('');
  lines.push('- Students see **only** quizzes matching their enrolled grade (exact match).');
  lines.push('- Parents see the **full** published catalog (all grades).');
  lines.push('- Verify: `npm run verify:content-coverage` and `npm run verify:grade-filtering`.');
  lines.push('');

  const outPath = path.join(__dirname, '../docs/CONTENT_COVERAGE_REPORT.md');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`Wrote ${outPath}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
