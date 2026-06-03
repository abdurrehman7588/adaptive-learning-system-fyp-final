import http from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createApp } from '../src/app.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '../prisma/schema.prisma');
const schemaText = readFileSync(schemaPath, 'utf8');

const app = createApp();
const server = app.listen(0);
const port = server.address().port;

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
          resolve({ status: res.statusCode, json: data ? JSON.parse(data) : null });
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
  if (res.status !== 200) {
    throw new Error(`Parent login failed (${res.status})`);
  }
  return res.json.data.token;
}

async function loginStudent() {
  const res = await request('POST', '/auth/student/login', {
    body: { username: 'demokid', pin: '1234' },
  });
  if (res.status !== 200) {
    throw new Error(`Student login failed (${res.status})`);
  }
  return res.json.data.token;
}

async function main() {
  const checks = [];
  const parentToken = await loginParent();
  const studentToken = await loginStudent();

  const analyticsOverview = await request('GET', '/children/analytics/overview', {
    token: parentToken,
  });
  const overview = analyticsOverview.json?.data?.overview;
  const firstChild = overview?.children?.[0];

  checks.push([
    '1. Parent dashboard analytics (overview 200)',
    analyticsOverview.status === 200 &&
      overview?.summary?.completedAttempts !== undefined &&
      overview.summary.averageScorePercent !== undefined &&
      overview.summary.averagePercentage !== undefined &&
      overview.summary.performanceTrend?.direction &&
      Array.isArray(overview.children),
  ]);

  const recOverview = await request('GET', '/children/recommendations/overview', {
    token: parentToken,
  });
  const recs = recOverview.json?.data?.overview;
  const firstRecs = recs?.children?.[0]?.recommendations ?? [];

  checks.push([
    '2. Recommendations overview returns data',
    recOverview.status === 200 &&
      Array.isArray(recs?.children) &&
      recs.children.length > 0 &&
      firstRecs.length > 0,
  ]);

  const childId = firstChild?.id ?? 1;

  const childAnalytics = await request('GET', `/children/${childId}/analytics`, {
    token: studentToken,
  });
  const ca = childAnalytics.json?.data?.analytics;

  checks.push([
    '3. Student dashboard analytics (child analytics 200)',
    childAnalytics.status === 200 &&
      ca?.summary?.completedAttempts !== undefined &&
      ca.summary.averageScore !== undefined &&
      ca.summary.lastActivityAt !== undefined &&
      Array.isArray(ca.recentHistory),
  ]);

  const childRecs = await request('GET', `/children/${childId}/recommendations`, {
    token: studentToken,
  });
  const studentRecList = childRecs.json?.data?.recommendations ?? [];
  const studentLearningProfile = childRecs.json?.data?.learningProfile;
  const studentAdaptiveInsights = childRecs.json?.data?.adaptiveInsights;

  checks.push([
    '4. Student recommendations endpoint',
    childRecs.status === 200 && studentRecList.length > 0,
  ]);

  checks.push([
    '4b. Adaptive learningProfile + insights on recommendations',
    studentLearningProfile?.categories?.length === 6 &&
      studentAdaptiveInsights?.whatsNext !== undefined,
  ]);

  const missingRoutes = await Promise.all([
    request('GET', '/children/analytics/overview', { token: parentToken }),
    request('GET', '/children/recommendations/overview', { token: parentToken }),
    request('GET', `/children/${childId}/analytics`, { token: studentToken }),
    request('GET', `/children/${childId}/recommendations`, { token: studentToken }),
  ]);

  checks.push([
    '5. No analytics/recommendation 404s',
    missingRoutes.every((res) => res.status !== 404),
  ]);

  checks.push([
    '6. Data derived from quiz attempts (completed > 0 when seeded)',
    (overview?.summary?.completedAttempts ?? 0) >= 0 &&
      (firstChild?.recentHistory?.length ?? 0) >= 0 &&
      (overview?.summary?.completedAttempts > 0
        ? firstChild?.recentHistory?.length > 0
        : true),
  ]);

  const hasAnalyticsTables = /\bmodel\s+Analytics\w*/i.test(schemaText);
  checks.push([
    '7. No analytics storage tables in Prisma schema',
    !hasAnalyticsTables,
  ]);

  const quizList = await request('GET', '/quizzes', { token: studentToken });
  const firstQuiz = quizList.json?.data?.quizzes?.[0];
  checks.push([
    '9. Quiz catalog exposes taxonomy fields',
    quizList.status === 200 &&
      firstQuiz?.category &&
      firstQuiz?.difficulty_level &&
      firstQuiz?.grade_level,
  ]);

  if (firstRecs.length > 0) {
    checks.push([
      '10. Recommendations include quiz metadata',
      firstRecs[0].difficultyLevel !== undefined &&
        firstRecs[0].suggestedDifficulty !== undefined,
    ]);
  }

  const wrongChild = await request('GET', '/children/99999/analytics', {
    token: studentToken,
  });
  checks.push(['8. Student blocked other child', wrongChild.status === 403]);

  console.log('\n=== Analytics & Recommendations Verification ===\n');
  for (const [label, ok] of checks) {
    console.log(ok ? 'PASS' : 'FAIL', label);
  }

  if (overview?.summary) {
    console.log('\nParent overview summary:', {
      completedAttempts: overview.summary.completedAttempts,
      averageScore: overview.summary.averageScore,
      averagePercentage: overview.summary.averagePercentage,
      performanceTrend: overview.summary.performanceTrend?.direction,
      lastActivityAt: overview.summary.lastActivityAt,
    });
  }

  if (firstRecs.length > 0) {
    console.log('\nSample recommendation:', {
      title: firstRecs[0].title,
      matchType: firstRecs[0].matchType,
      priority: firstRecs[0].priority,
      subject: firstRecs[0].subject,
    });
  }

  server.close();
  process.exit(checks.some(([, ok]) => !ok) ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  server.close();
  process.exit(1);
});
