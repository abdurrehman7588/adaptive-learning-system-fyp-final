import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_TITLES = ['Pattern Puzzles', 'World Explorer', 'Logic Lab'];

const GRADE_MAP = {
  'Pre-K': 0,
  Kindergarten: 1,
  'Grade 1': 2,
  'Grade 2': 3,
  'Grade 3': 4,
  'Grade 4': 5,
  'Grade 5': 6,
  'Grade 6': 7,
};

function parseQuizGrade(gradeLevel) {
  if (!gradeLevel) return null;
  const g = gradeLevel.trim();
  if (/pre[-\s]?k/i.test(g)) return 0;
  if (/kindergarten|kinder/i.test(g)) return 1;
  const ord = g.match(/(\d+)(?:st|nd|rd|th)?\s*grade/i);
  if (ord) return Number(ord[1]);
  if (/grade\s*(\d+)/i.test(g)) return Number(g.match(/grade\s*(\d+)/i)[1]);
  return null;
}

function parseChildGrade(gradeLevel) {
  if (!gradeLevel) return null;
  const normalized = gradeLevel.trim();
  if (GRADE_MAP[normalized] !== undefined) return GRADE_MAP[normalized];
  return parseQuizGrade(normalized);
}

function normalizeSubject(subject) {
  const lower = (subject ?? '').toLowerCase();
  if (lower.includes('math') || lower.includes('pattern') || lower.includes('cognitive')) return 'math';
  if (lower.includes('science') || lower.includes('world') || lower.includes('gk') || lower.includes('general')) return 'science/general';
  if (lower.includes('iq') || lower.includes('logic') || lower.includes('reasoning')) return 'logic';
  return lower || 'unknown';
}

async function main() {
  const quizzes = await prisma.quiz.findMany({
    orderBy: { id: 'asc' },
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
  });

  const totalQuestions = await prisma.quizQuestion.count();
  const publishedCount = quizzes.filter((q) => q.isPublished).length;

  const subjects = new Set();
  for (const q of quizzes) {
    subjects.add(normalizeSubject(q.subject));
  }

  const report = {
    totals: {
      quizzes: quizzes.length,
      publishedQuizzes: publishedCount,
      questions: totalQuestions,
      avgQuestionsPerQuiz:
        quizzes.length > 0 ? Math.round((totalQuestions / quizzes.length) * 10) / 10 : 0,
    },
    subjectsCovered: [...subjects].sort(),
    gradeMetadata: quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      gradeLevel: q.gradeLevel,
      hasGrade: Boolean(q.gradeLevel),
      parsedGradeNum: parseQuizGrade(String(q.gradeLevel ?? '')),
    })),
    difficultyMetadata: {
      schemaHasDifficultyColumn: true,
      allQuizzesHaveDifficulty: quizzes.every((q) => q.difficultyLevel),
      byDifficulty: Object.fromEntries(
        ['easy', 'medium', 'hard'].map((level) => [
          level,
          quizzes.filter((q) => q.difficultyLevel === level).length,
        ]),
      ),
    },
    taxonomy: quizzes.map((q) => ({
      id: q.id,
      slug: q.slug,
      category: q.category,
      gradeLevel: q.gradeLevel,
      difficultyLevel: q.difficultyLevel,
    })),
    demoContent: quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      isSeedQuiz: SEED_TITLES.includes(q.title),
      questionCount: q._count.questions,
      attemptCount: q._count.attempts,
    })),
    children: await prisma.child.findMany({
      select: { id: true, name: true, age: true, gradeLevel: true },
    }),
  };

  const childMappings = report.children.map((child) => {
    const childGradeNum = parseChildGrade(child.gradeLevel);
    const matched = quizzes.filter((q) => {
      const quizGrade = parseQuizGrade(q.gradeLevel);
      if (childGradeNum === null || quizGrade === null) return false;
      return Math.abs(quizGrade - childGradeNum) <= 1;
    });
    return {
      childId: child.id,
      name: child.name,
      age: child.age,
      gradeLevel: child.gradeLevel,
      parsedGradeNum: childGradeNum,
      quizzesWithinOneGrade: matched.map((q) => q.title),
      allPublishedQuizzesShownInUi: true,
      note: 'API lists all published quizzes; no server-side grade filter',
    };
  });

  console.log(JSON.stringify({ ...report, childMappings }, null, 2));
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
