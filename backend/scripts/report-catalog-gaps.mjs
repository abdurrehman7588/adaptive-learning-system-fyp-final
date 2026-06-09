/**
 * Full quiz catalog gap report (seed catalog + published DB).
 * Run: node scripts/report-catalog-gaps.mjs
 */
import { PrismaClient } from '@prisma/client';
import { FULL_GRADE_CATALOG } from '../prisma/quiz/catalog/index.js';
import {
  ALL_GRADE_LEVELS,
  FROZEN_CATEGORIES,
  isTierPilotGrade,
  quizzesPerCategoryForGrade,
} from '../prisma/quiz/catalog/utils.js';

const prisma = new PrismaClient();
const TIERS = ['easy', 'medium', 'hard'];

const CATEGORY_LABELS = {
  math: 'Math',
  science: 'Science',
  pattern_recognition: 'Pattern Recognition',
  memory: 'Memory',
  problem_solving: 'Problem Solving',
  critical_thinking: 'Critical Thinking',
};

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

/**
 * @param {Array<{ gradeLevel: string, category: string, difficultyLevel?: string }>} source
 * @param {string} label
 */
function buildReport(source, label) {
  /** @type {Array<Record<string, unknown>>} */
  const rows = [];
  /** @type {Array<Record<string, unknown>>} */
  const gaps = [];

  for (const grade of ALL_GRADE_LEVELS) {
    const gradeRows = source.filter((q) => q.gradeLevel === grade);
    const tierPilot = isTierPilotGrade(grade);

    for (const category of FROZEN_CATEGORIES) {
      const cell = gradeRows.filter((q) => q.category === category);

      if (tierPilot) {
        for (const tier of TIERS) {
          const count = cell.filter((q) => q.difficultyLevel === tier).length;
          const expected = 1;
          const row = {
            source: label,
            grade,
            gradeLabel: GRADE_LABELS[grade],
            category,
            categoryLabel: CATEGORY_LABELS[category],
            difficulty: tier,
            count,
            expected,
          };
          rows.push(row);
          if (count < expected) {
            gaps.push({ ...row, missing: expected - count });
          }
        }
      } else {
        const count = cell.length;
        const expected = quizzesPerCategoryForGrade(grade);
        const difficulties = [...new Set(cell.map((q) => q.difficultyLevel))];
        const difficulty =
          difficulties.length === 1 ? difficulties[0] : difficulties.join('+') || '—';
        const row = {
          source: label,
          grade,
          gradeLabel: GRADE_LABELS[grade],
          category,
          categoryLabel: CATEGORY_LABELS[category],
          difficulty,
          count,
          expected,
        };
        rows.push(row);
        if (count < expected) {
          gaps.push({ ...row, missing: expected - count });
        }
      }
    }
  }

  return { rows, gaps, total: source.length };
}

function printMatrix(report, title) {
  console.log(`\n# ${title}\n`);
  console.log(`Total quizzes: **${report.total}**\n`);

  for (const grade of ALL_GRADE_LEVELS) {
    const tierPilot = isTierPilotGrade(grade);
    const gradeTotal = report.rows
      .filter((r) => r.grade === grade)
      .reduce((sum, r) => sum + Number(r.count), 0);

    console.log(`## ${GRADE_LABELS[grade]}${tierPilot ? ' (tier pilot: easy/medium/hard)' : ''} — ${gradeTotal} quizzes\n`);
    console.log('| Grade | Category | Difficulty | Quiz Count | Expected |');
    console.log('|-------|----------|------------|------------|----------|');

    for (const row of report.rows.filter((r) => r.grade === grade)) {
      const gap = Number(row.count) < Number(row.expected) ? ' ⚠️ GAP' : '';
      console.log(
        `| ${row.gradeLabel} | ${row.categoryLabel} | ${row.difficulty} | ${row.count} | ${row.expected}${gap} |`,
      );
    }
    console.log('');
  }
}

function printGaps(gaps, title) {
  console.log(`\n# ${title}\n`);
  if (gaps.length === 0) {
    console.log('**None.** All expected grade × category × difficulty cells are filled.\n');
    return;
  }

  console.log('| Grade | Category | Difficulty | Current | Missing |');
  console.log('|-------|----------|------------|---------|---------|');
  for (const gap of gaps) {
    console.log(
      `| ${gap.gradeLabel} | ${gap.categoryLabel} | ${gap.difficulty} | ${gap.count} | ${gap.missing} |`,
    );
  }
  console.log('');
}

const catalogReport = buildReport(FULL_GRADE_CATALOG, 'catalog');

const published = await prisma.quiz.findMany({
  where: { isPublished: true },
  select: {
    slug: true,
    gradeLevel: true,
    category: true,
    difficultyLevel: true,
    title: true,
  },
  orderBy: [{ gradeLevel: 'asc' }, { category: 'asc' }, { difficultyLevel: 'asc' }],
});

const dbReport = buildReport(published, 'database');

const allDb = await prisma.quiz.findMany({
  select: { slug: true, isPublished: true, gradeLevel: true, category: true, difficultyLevel: true },
});
const unpublishedCount = allDb.filter((q) => !q.isPublished).length;
const catalogSlugs = new Set(FULL_GRADE_CATALOG.map((q) => q.slug));
const extraInDb = allDb.filter((q) => !catalogSlugs.has(q.slug));

console.log('# Quiz Catalog Gap Report');
console.log(`Generated: ${new Date().toISOString()}\n`);
console.log('## Catalog design rules\n');
console.log('- **All grades**: 6 categories × 3 difficulties (easy/medium/hard) = **18 quizzes/grade**');
console.log(`- **Expected catalog total:** ${FULL_GRADE_CATALOG.length} quizzes\n`);

printMatrix(catalogReport, 'Seed catalog (source files)');
printGaps(catalogReport.gaps, 'Missing combinations — seed catalog');

printMatrix(dbReport, 'Published database');
printGaps(dbReport.gaps, 'Missing combinations — published database');

console.log('\n# Grade 2 example (published DB)\n');
for (const category of FROZEN_CATEGORIES) {
  for (const tier of TIERS) {
    const count = published.filter(
      (q) => q.gradeLevel === 'grade_2' && q.category === category && q.difficultyLevel === tier,
    ).length;
    const label = tier.charAt(0).toUpperCase() + tier.slice(1);
    console.log(`Grade 2 → ${CATEGORY_LABELS[category]} → ${label} = ${count}`);
  }
}

console.log('\n# Summary\n');
console.log(`| Source | Total | Gaps |`);
console.log(`|--------|-------|------|`);
console.log(`| Seed catalog | ${catalogReport.total} | ${catalogReport.gaps.length} |`);
console.log(`| Published DB | ${dbReport.total} | ${dbReport.gaps.length} |`);
console.log(`| Unpublished in DB | ${unpublishedCount} | — |`);
console.log(`| DB rows not in seed catalog | ${extraInDb.length} | — |`);

if (catalogReport.gaps.length === 0 && dbReport.gaps.length === 0) {
  console.log('\n✅ **Ready for quiz generation:** No gaps detected. Generate new quizzes only if you want *additional* quizzes per cell (currently 1 per tier).');
} else {
  console.log('\n⚠️ **Generate quizzes for gap cells listed above before expanding coverage.**');
}

await prisma.$disconnect();
