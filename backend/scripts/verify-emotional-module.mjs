import http from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createApp } from '../src/app.js';
import { scoreAssessment, statusFromPercent } from '../src/modules/emotional/services/emotionalScoring.service.js';

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

function buildResponses(valuesByDimension) {
  const responses = [];
  for (const [dimension, values] of Object.entries(valuesByDimension)) {
    values.forEach((value, questionIndex) => {
      responses.push({ dimension, questionIndex, value });
    });
  }
  return responses;
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
  return { token: res.json.data.token, childId: res.json.data.user?.id };
}

async function main() {
  const checks = [];
  const parentToken = await loginParent();
  const { token: studentToken, childId } = await loginStudent();

  checks.push([
    '1. Prisma schema includes EI models',
    schemaText.includes('model EmotionalAssessment') &&
      schemaText.includes('model EmotionalAssessmentResponse') &&
      schemaText.includes('model EmotionalActivityCompletion'),
  ]);

  const scored = scoreAssessment({
    self_awareness: [4, 4, 4, 4],
    empathy: [1, 1, 1, 1],
    self_regulation: [2, 2, 2, 2],
  });
  checks.push([
    '2. Scoring: empathy lowest → developing status',
    scored.categories.empathy.percent === 0 &&
      scored.categories.empathy.status === 'developing' &&
      statusFromPercent(74) === 'good' &&
      statusFromPercent(75) === 'strong',
  ]);

  const profileBefore = await request('GET', '/children/me/emotional-profile', {
    token: studentToken,
  });
  const questionnaire = profileBefore.json?.data?.questionnaire;

  checks.push([
    '3. GET /children/me/emotional-profile (student)',
    profileBefore.status === 200 &&
      questionnaire?.scale?.length === 4 &&
      questionnaire?.dimensions?.length === 3,
  ]);

  const assessmentBody = {
    responses: buildResponses({
      self_awareness: [4, 3, 3, 4],
      empathy: [2, 2, 3, 2],
      self_regulation: [3, 3, 4, 3],
    }),
  };

  const submit = await request('POST', '/children/me/emotional-assessment', {
    token: studentToken,
    body: assessmentBody,
  });
  const profile = submit.json?.data?.profile;

  checks.push([
    '4. POST /children/me/emotional-assessment',
    submit.status === 201 &&
      profile?.hasAssessment === true &&
      profile?.categories?.self_awareness?.percent != null &&
      profile?.categories?.self_awareness?.description &&
      profile?.categories?.self_awareness?.routeSlug === 'self-awareness' &&
      profile?.overallScore != null &&
      profile?.recommendedActivity?.slug &&
      profile?.activities?.length === 3 &&
      profile?.activities?.filter((a) => a.isRecommended).length === 1,
  ]);

  const history = await request('GET', '/children/me/emotional-history', {
    token: studentToken,
  });
  const rows = history.json?.data?.history ?? [];

  checks.push([
    '5. GET /children/me/emotional-history',
    history.status === 200 && Array.isArray(rows) && rows.length >= 1,
  ]);

  const activity = await request('POST', '/children/me/emotional-activities/helping_friend/complete', {
    token: studentToken,
    body: { answer: 'C' },
  });

  checks.push([
    '6. POST scenario activity completion awards XP',
    activity.status === 201 && activity.json?.data?.xpAwarded === 15,
  ]);

  const feelingsActivity = await request(
    'POST',
    '/children/me/emotional-activities/feelings_today/complete',
    {
      token: studentToken,
      body: { feeling: 'Happy', reason: 'Friends' },
    },
  );

  checks.push([
    '7. POST feelings activity stores emotion + reason',
    feelingsActivity.status === 201 && feelingsActivity.json?.data?.xpAwarded === 15,
  ]);

  const parentProfile = await request('GET', `/children/${childId}/emotional-profile`, {
    token: parentToken,
  });

  checks.push([
    '8. GET /children/:childId/emotional-profile (parent + insights)',
    parentProfile.status === 200 &&
      parentProfile.json?.data?.hasAssessment === true &&
      parentProfile.json?.data?.strongestArea?.label &&
      parentProfile.json?.data?.weakestArea?.label &&
      parentProfile.json?.data?.recommendedActivity?.title &&
      parentProfile.json?.data?.feelingsInsights?.mostCommonEmotion === 'Happy' &&
      parentProfile.json?.data?.feelingsInsights?.mostCommonReason === 'Friends',
  ]);

  const rewards = await request('GET', `/children/${childId}/rewards`, { token: studentToken });
  checks.push([
    '9. Rewards include EI activity XP bonus',
    rewards.status === 200 && rewards.json?.data?.rewards?.totalXP >= 15,
  ]);

  let failed = 0;
  for (const [label, ok] of checks) {
    console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`);
    if (!ok) failed += 1;
  }

  server.close();
  if (failed > 0) {
    process.exitCode = 1;
    console.error(`\n${failed} check(s) failed.`);
  } else {
    console.log(`\nAll ${checks.length} EI module checks passed.`);
  }
}

main().catch((err) => {
  console.error(err);
  server.close();
  process.exit(1);
});
