/**
 * Verifies exact grade-match catalog and recommendations (no review / no higher grades).
 * Run: node scripts/verify-grade-filtering.mjs
 */
import http from 'http';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app.js';
import { isTierPilotGrade } from '../prisma/quiz/catalog/utils.js';

const prisma = new PrismaClient();
const app = createApp();
const server = app.listen(0);
const port = server.address().port;

const GRADE_ORDER = [
  'pre_k',
  'kindergarten',
  'grade_1',
  'grade_2',
  'grade_3',
  'grade_4',
  'grade_5',
  'grade_6',
];

const EXPECTED_COUNTS = Object.fromEntries(
  GRADE_ORDER.map((grade) => [grade, isTierPilotGrade(grade) ? 18 : 6]),
);

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
        res.on('data', (chunk) => {
          data += chunk;
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

function gradeCounts(quizzes) {
  const counts = {};
  for (const quiz of quizzes) {
    counts[quiz.grade_level] = (counts[quiz.grade_level] ?? 0) + 1;
  }
  return counts;
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
  return { token: res.json.data.token, childId: res.json.data.user.id };
}

async function main() {
  const checks = [];
  const parentToken = await loginParent();

  const parentList = await request('GET', '/quizzes', { token: parentToken });
  const parentQuizzes = parentList.json?.data?.quizzes ?? [];
  checks.push([
    'Parent sees full published catalog',
    parentList.status === 200 && parentQuizzes.length === 48,
  ]);

  const grade1Quiz = await prisma.quiz.findFirst({
    where: { gradeLevel: 'grade_1', isPublished: true },
    select: { id: true },
  });
  const grade3Quiz = await prisma.quiz.findFirst({
    where: { gradeLevel: 'grade_3', isPublished: true },
    select: { id: true },
  });

  const demoChild = await prisma.child.findUnique({
    where: { username: 'demokid' },
    select: { id: true },
  });
  if (!demoChild) throw new Error('demokid not found');

  const originalGrade = (
    await prisma.child.findUnique({
      where: { id: demoChild.id },
      select: { gradeLevel: true },
    })
  ).gradeLevel;

  async function runExactGradeChecks(childGrade, label) {
    await prisma.child.update({
      where: { id: demoChild.id },
      data: { gradeLevel: childGrade },
    });

    const { token, childId } = await loginStudent();
    const listRes = await request('GET', '/quizzes', { token });
    const quizzes = listRes.json?.data?.quizzes ?? [];
    const grades = [...new Set(quizzes.map((q) => q.grade_level))];
    const counts = gradeCounts(quizzes);
    const expected = EXPECTED_COUNTS[childGrade] ?? 0;

    checks.push([`${label}: catalog 200`, listRes.status === 200]);
    checks.push([
      `${label}: exactly one grade in catalog`,
      grades.length === 1 && grades[0] === childGrade,
    ]);
    checks.push([
      `${label}: quiz count matches seeded band`,
      quizzes.length === expected,
    ]);
    checks.push([
      `${label}: no lower-grade quizzes`,
      !grades.some(
        (g) => GRADE_ORDER.indexOf(g) < GRADE_ORDER.indexOf(childGrade),
      ),
    ]);
    checks.push([
      `${label}: no higher-grade quizzes`,
      !grades.some(
        (g) => GRADE_ORDER.indexOf(g) > GRADE_ORDER.indexOf(childGrade),
      ),
    ]);

    const recRes = await request('GET', `/children/${childId}/recommendations`, {
      token,
    });
    const recs = recRes.json?.data?.recommendations ?? [];
    const recGrades = [...new Set(recs.map((r) => r.gradeLevel))];

    checks.push([`${label}: recommendations 200`, recRes.status === 200]);
    checks.push([
      `${label}: recommendations only same grade`,
      recGrades.length === 1 && recGrades[0] === childGrade,
    ]);
    const expectedRecCount = isTierPilotGrade(childGrade) ? 6 : quizzes.length;
    checks.push([
      `${label}: recommendations count (${expectedRecCount})`,
      recs.length === expectedRecCount,
    ]);

    if (isTierPilotGrade(childGrade)) {
      if (grade1Quiz) {
        const blockedLower = await request('GET', `/quizzes/${grade1Quiz.id}`, {
          token,
        });
        checks.push([
          `${label}: blocked grade_1 quiz (lower)`,
          blockedLower.status === 403,
        ]);
      }
      if (grade3Quiz) {
        const blockedHigher = await request('GET', `/quizzes/${grade3Quiz.id}`, {
          token,
        });
        checks.push([
          `${label}: blocked grade_3 quiz (higher)`,
          blockedHigher.status === 403,
        ]);
      }
    }

    return { grades, counts, quizCount: quizzes.length };
  }

  const g1 = await runExactGradeChecks('grade_1', 'Grade 1 student');
  console.log('\nGrade 1 student:', g1.grades, g1.counts, `total=${g1.quizCount}`);

  const g2 = await runExactGradeChecks('grade_2', 'Grade 2 student');
  console.log('Grade 2 student:', g2.grades, g2.counts, `total=${g2.quizCount}`);

  const g3 = await runExactGradeChecks('grade_3', 'Grade 3 student');
  console.log('Grade 3 student:', g3.grades, g3.counts, `total=${g3.quizCount}`);

  await prisma.child.update({
    where: { id: demoChild.id },
    data: { gradeLevel: originalGrade ?? 'grade_2' },
  });

  console.log('\n=== Exact grade filtering verification ===\n');
  for (const [label, ok] of checks) {
    console.log(ok ? 'PASS' : 'FAIL', label);
  }

  await prisma.$disconnect();
  server.close();
  process.exit(checks.some(([, ok]) => !ok) ? 1 : 0);
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  server.close();
  process.exit(1);
});
