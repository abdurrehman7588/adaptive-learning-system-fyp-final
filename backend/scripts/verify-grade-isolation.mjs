/**
 * Grade isolation audit with structured logs.
 * Run: npm run verify:grade-isolation
 */
import http from 'http';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app.js';

const prisma = new PrismaClient();
const app = createApp();
const server = app.listen(0);
const port = server.address().port;

const GRADES_TO_TEST = ['pre_k', 'kindergarten', 'grade_1', 'grade_2', 'grade_3'];

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

async function loginStudent() {
  const res = await request('POST', '/auth/student/login', {
    body: { username: 'demokid', pin: '1234' },
  });
  if (res.status !== 200) throw new Error('Student login failed');
  return res.json.data.token;
}

function logCase(label, payload) {
  console.log(JSON.stringify({ label, ...payload }, null, 2));
}

async function auditStudentGrade(childGrade) {
  const demoChild = await prisma.child.findUnique({
    where: { username: 'demokid' },
    select: { id: true, gradeLevel: true },
  });
  if (!demoChild) throw new Error('demokid not found');

  const original = demoChild.gradeLevel;
  await prisma.child.update({
    where: { id: demoChild.id },
    data: { gradeLevel: childGrade },
  });

  const token = await loginStudent();

  const quizRes = await request('GET', '/quizzes', { token });
  const quizzes = quizRes.json?.data?.quizzes ?? [];
  const quizGrades = [...new Set(quizzes.map((q) => q.grade_level))];

  const recRes = await request('GET', '/children/me/recommendations', { token });
  const recs = recRes.json?.data?.recommendations ?? [];
  const recGrades = [...new Set(recs.map((r) => r.gradeLevel))];

  logCase(`student-${childGrade}`, {
    childGrade,
    quizStatus: quizRes.status,
    quizCount: quizzes.length,
    quizGrades,
    recommendationStatus: recRes.status,
    recommendationCount: recs.length,
    recommendationGrades: recGrades,
    sampleQuizTitles: quizzes.slice(0, 3).map((q) => q.title),
    sampleRecTitles: recs.slice(0, 3).map((r) => r.title),
  });

  const pass =
    quizRes.status === 200 &&
    recRes.status === 200 &&
    quizGrades.length <= 1 &&
    quizGrades[0] === childGrade &&
    recGrades.every((g) => g === childGrade);

  await prisma.child.update({
    where: { id: demoChild.id },
    data: { gradeLevel: original ?? 'grade_2' },
  });

  return pass;
}

async function main() {
  const checks = [];
  console.log('\n=== Grade isolation verification (with API logs) ===\n');

  for (const grade of GRADES_TO_TEST) {
    const ok = await auditStudentGrade(grade);
    checks.push([`Student ${grade}: catalog + /me/recommendations only same grade`, ok]);
    console.log(ok ? 'PASS' : 'FAIL', grade);
  }

  const parentToken = (
    await request('POST', '/auth/login', {
      body: { email: 'parent@demo.com', password: 'password123' },
    })
  ).json?.data?.token;

  const parentRec = await request('GET', '/children/recommendations/overview', {
    token: parentToken,
  });
  const children = parentRec.json?.data?.overview?.children ?? [];
  for (const child of children) {
    const recGrades = [...new Set(child.recommendations.map((r) => r.gradeLevel))];
    logCase(`parent-child-${child.id}`, {
      childName: child.name,
      childGrade: child.gradeLevel,
      recommendationCount: child.recommendations.length,
      recommendationGrades: recGrades,
    });
    checks.push([
      `Parent recs for ${child.name}: grades match child`,
      recGrades.length === 0 || recGrades.every((g) => g === child.gradeLevel),
    ]);
  }

  console.log('\n=== Summary ===\n');
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
