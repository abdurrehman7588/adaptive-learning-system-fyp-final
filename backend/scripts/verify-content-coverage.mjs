/**
 * Verifies content grid: 6 categories × 9 grades, 5+ questions each, grade filtering.
 * Run: npm run verify:content-coverage
 */
import http from 'http';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app.js';
import {
  FROZEN_CATEGORIES,
  ALL_GRADE_LEVELS,
  GRADE_2_QUIZZES_PER_CATEGORY,
  isTierPilotGrade,
  quizzesPerCategoryForGrade,
  TIER_PILOT_GRADE_LEVELS,
} from '../prisma/quiz/catalog/utils.js';

const prisma = new PrismaClient();
const app = createApp();
const server = app.listen(0);
const port = server.address().port;

const EXPECTED_PER_GRADE = 6;

function request(method, path, { token, body } = {}) {
  const payload = body ? JSON.stringify(body) : '';
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: `/api${path}`,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => {
          data += c;
        });
        res.on('end', () => {
          let json = null;
          try {
            json = data ? JSON.parse(data) : null;
          } catch {
            json = data;
          }
          resolve({ status: res.statusCode, json });
        });
      },
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function loginParent() {
  const res = await request('POST', '/auth/login', {
    body: { email: 'parent@demo.com', password: 'password123' },
  });
  if (res.status !== 200) throw new Error('Parent login failed');
  return res.json.data.token;
}

async function loginStudent() {
  const res = await request('POST', '/auth/student/login', {
    body: { username: 'demokid', pin: '1234' },
  });
  if (res.status !== 200) throw new Error('Student login failed');
  return res.json.data.token;
}

async function main() {
  const checks = [];
  const parentToken = await loginParent();

  const published = await prisma.quiz.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      slug: true,
      gradeLevel: true,
      category: true,
      _count: { select: { questions: true } },
    },
  });

  const tierPilotExtras =
    TIER_PILOT_GRADE_LEVELS.length *
    FROZEN_CATEGORIES.length *
    (GRADE_2_QUIZZES_PER_CATEGORY - 1);
  const expectedTotal = ALL_GRADE_LEVELS.length * FROZEN_CATEGORIES.length + tierPilotExtras;
  checks.push([
    `Published quiz count is ${expectedTotal} (72 with K + G2 tier pilots)`,
    published.length === expectedTotal,
  ]);

  for (const grade of ALL_GRADE_LEVELS) {
    const gradeQuizzes = published.filter((q) => q.gradeLevel === grade);
    const perCategory = quizzesPerCategoryForGrade(grade);
    const expectedGradeCount = FROZEN_CATEGORIES.length * perCategory;
    checks.push([`${grade}: quiz count`, gradeQuizzes.length === expectedGradeCount]);
    for (const category of FROZEN_CATEGORIES) {
      const inCategory = gradeQuizzes.filter((q) => q.category === category);
      const expectedInCategory = perCategory;
      checks.push([
        `${grade}/${category}: ${expectedInCategory} quiz(zes)`,
        inCategory.length === expectedInCategory,
      ]);
      if (inCategory[0]) {
        checks.push([
          `${grade}/${category}: ≥5 questions`,
          inCategory[0]._count.questions >= 5,
        ]);
      }
    }
  }

  const parentList = await request('GET', '/quizzes', { token: parentToken });
  const parentQuizzes = parentList.json?.data?.quizzes ?? [];
  checks.push(['Parent catalog 200', parentList.status === 200]);
  checks.push(['Parent sees full catalog', parentQuizzes.length === published.length]);

  const demoChild = await prisma.child.findUnique({
    where: { username: 'demokid' },
    select: { id: true, gradeLevel: true },
  });
  if (!demoChild) throw new Error('demokid not found');

  const originalGrade = demoChild.gradeLevel;

  for (const grade of ['kindergarten', 'grade_2', 'grade_4', 'pre_k']) {
    await prisma.child.update({
      where: { id: demoChild.id },
      data: { gradeLevel: grade },
    });
    const studentToken = await loginStudent();
    const listRes = await request('GET', '/quizzes', { token: studentToken });
    const quizzes = listRes.json?.data?.quizzes ?? [];
    const grades = [...new Set(quizzes.map((q) => q.grade_level))];
    checks.push([
      `Student (${grade}): catalog only own grade`,
      listRes.status === 200 &&
        grades.length === 1 &&
        grades[0] === grade &&
        quizzes.length ===
          (isTierPilotGrade(grade) ? 18 : EXPECTED_PER_GRADE),
    ]);
  }

  await prisma.child.update({
    where: { id: demoChild.id },
    data: { gradeLevel: originalGrade ?? 'grade_2' },
  });

  console.log('\n=== Content coverage verification ===\n');
  for (const [label, ok] of checks) {
    console.log(ok ? 'PASS' : 'FAIL', label);
  }

  await prisma.$disconnect();
  server.close();
  process.exit(checks.some(([, ok]) => !ok) ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  server.close();
  process.exit(1);
});
