import http from 'http';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app.js';
import {
  FROZEN_CATEGORIES,
  KINDERGARTEN_QUIZZES_PER_CATEGORY,
} from '../prisma/quiz/catalog/utils.js';
import { recommendedDifficultyForStatus } from '../src/modules/adaptive/adaptiveRules.js';
import { selectQuizForAdaptiveTier } from '../src/modules/adaptive/adaptiveTierRouting.js';

const prisma = new PrismaClient();
const app = createApp();
const server = app.listen(0);
const port = server.address().port;

const STATUSES = ['needs_practice', 'progressing', 'mastery', 'unattempted'];
const STATUS_TO_TIER = {
  needs_practice: 'easy',
  progressing: 'medium',
  mastery: 'hard',
  unattempted: 'medium',
};

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
          resolve({ status: res.statusCode, json: data ? JSON.parse(data) : null });
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

async function main() {
  const checks = [];
  const k = await prisma.quiz.findMany({
    where: { isPublished: true, gradeLevel: 'kindergarten' },
    select: { slug: true, category: true, difficultyLevel: true, gradeLevel: true },
    orderBy: [{ category: 'asc' }, { difficultyLevel: 'asc' }],
  });

  const expectedCount = FROZEN_CATEGORIES.length * KINDERGARTEN_QUIZZES_PER_CATEGORY;
  checks.push([
    `Kindergarten published count is ${expectedCount}`,
    k.length === expectedCount,
  ]);

  for (const category of FROZEN_CATEGORIES) {
    const cell = k.filter((q) => q.category === category);
    checks.push([
      `K ${category}: ${KINDERGARTEN_QUIZZES_PER_CATEGORY} quizzes`,
      cell.length === 3,
    ]);
    for (const tier of ['easy', 'medium', 'hard']) {
      checks.push([
        `K ${category}/${tier} exists`,
        cell.some((q) => q.difficultyLevel === tier),
      ]);
    }

    for (const status of STATUSES) {
      const expectedTier = STATUS_TO_TIER[status];
      const rec = recommendedDifficultyForStatus(status);
      const { quiz, tierMatched } = selectQuizForAdaptiveTier(
        k,
        category,
        rec,
        'kindergarten',
      );
      checks.push([
        `Route ${category} ${status} -> ${expectedTier}`,
        tierMatched === true && quiz?.difficultyLevel === expectedTier,
      ]);
    }
  }

  const demoChild = await prisma.child.findUnique({
    where: { username: 'demokid' },
    select: { id: true, gradeLevel: true },
  });
  if (!demoChild) throw new Error('demokid not found');
  const originalGrade = demoChild.gradeLevel;

  await prisma.child.update({
    where: { id: demoChild.id },
    data: { gradeLevel: 'kindergarten' },
  });

  const token = await loginStudent();
  const recRes = await request('GET', '/children/me/recommendations', { token });
  const recs = recRes.json?.data?.recommendations ?? [];

  checks.push(['Kindergarten recommendations 200', recRes.status === 200]);
  checks.push(['Six category recommendations', recs.length === 6]);
  checks.push(['All API recommendations tierMatched=true', recs.every((r) => r.tierMatched === true)]);

  await prisma.child.update({
    where: { id: demoChild.id },
    data: { gradeLevel: originalGrade ?? 'grade_2' },
  });

  console.log('\n=== Kindergarten Tier Pilot Verification ===\n');
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
