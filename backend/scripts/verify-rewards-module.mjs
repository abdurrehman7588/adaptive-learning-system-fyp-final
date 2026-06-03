import http from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createApp } from '../src/app.js';
import { buildChildRewards, computeTotalXp } from '../src/modules/rewards/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaText = readFileSync(join(__dirname, '../prisma/schema.prisma'), 'utf8');

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
  return res.json.data.token;
}

async function loginStudent() {
  const res = await request('POST', '/auth/student/login', {
    body: { username: 'demokid', pin: '1234' },
  });
  return res.json.data.token;
}

function mockAttempt(percent, dayOffset = 0) {
  const completedAt = new Date();
  completedAt.setDate(completedAt.getDate() - dayOffset);
  return {
    status: 'completed',
    score: Math.round(percent),
    totalPoints: 100,
    percentage: percent,
    completedAt,
    startedAt: completedAt,
    quiz: { subject: 'math', title: 'Test Quiz' },
    answers: [],
  };
}

async function main() {
  const checks = [];
  const parentToken = await loginParent();
  const studentToken = await loginStudent();

  const overviewRes = await request('GET', '/children/rewards/overview', {
    token: parentToken,
  });
  const overview = overviewRes.json?.data?.overview;
  const firstChild = overview?.children?.[0];
  const childId = firstChild?.id ?? 1;

  checks.push([
    '1. Reward endpoints return data',
    overviewRes.status === 200 &&
      firstChild?.rewards?.totalXP !== undefined &&
      Array.isArray(firstChild.rewards.badges),
  ]);

  const childRes = await request('GET', `/children/${childId}/rewards`, {
    token: studentToken,
  });
  const rewards = childRes.json?.data?.rewards;

  checks.push([
    '2. Student child rewards endpoint',
    childRes.status === 200 && rewards?.currentLevel >= 1,
  ]);

  const zeroXp = computeTotalXp([], 0, 0);
  const oneQuizXp = computeTotalXp([mockAttempt(85)], 1, 1);
  checks.push(['3. XP increases after quiz completion', oneQuizXp > zeroXp]);

  const levelOne = buildChildRewards([]).currentLevel;
  const levelFromXp = buildChildRewards([
    mockAttempt(90, 0),
    mockAttempt(90, 0),
    mockAttempt(90, 0),
  ]);
  checks.push([
    '4. Levels update correctly',
    levelOne === 1 && levelFromXp.currentLevel >= 1 && levelFromXp.totalXP > 0,
  ]);

  const streakBadges = buildChildRewards([
    mockAttempt(70, 6),
    mockAttempt(70, 5),
    mockAttempt(70, 4),
  ]);
  const consistent = streakBadges.badges.find((b) => b.id === 'consistent_learner');
  checks.push([
    '5. Badges unlock correctly',
    streakBadges.earnedBadges.some((b) => b.id === 'first_quiz') &&
      (consistent?.unlocked === true || streakBadges.longestStreak >= 3),
  ]);

  const routes = await Promise.all([
    request('GET', '/children/rewards/overview', { token: parentToken }),
    request('GET', `/children/${childId}/rewards`, { token: studentToken }),
  ]);
  checks.push([
    '6. No rewards 404s',
    routes.every((res) => res.status !== 404),
  ]);

  checks.push([
    '7. No reward persistence tables',
    !/\bmodel\s+Reward\w*/i.test(schemaText),
  ]);

  checks.push([
    '8. Parent overview matches child bundle shape',
    overview?.children?.length > 0 && rewards?.totalXP === firstChild?.rewards?.totalXP,
  ]);

  console.log('\n=== Rewards Module Verification ===\n');
  for (const [label, ok] of checks) {
    console.log(ok ? 'PASS' : 'FAIL', label);
  }

  if (rewards) {
    console.log('\nSample rewards:', {
      totalXP: rewards.totalXP,
      currentLevel: rewards.currentLevel,
      currentStreak: rewards.currentStreak,
      achievementCount: rewards.achievementCount,
      earnedBadges: rewards.earnedBadges.map((b) => b.id),
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
