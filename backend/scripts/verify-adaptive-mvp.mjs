import http from 'http';
import { createApp } from '../src/app.js';
import { ADAPTIVE_GRADE_LEVELS } from '../src/modules/adaptive/adaptiveRules.js';

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
  if (res.status !== 200) throw new Error(`Parent login failed (${res.status})`);
  return res.json.data.token;
}

async function loginStudent(username = 'demokid', pin = '1234') {
  const res = await request('POST', '/auth/student/login', {
    body: { username, pin },
  });
  if (res.status !== 200) throw new Error(`Student login failed (${res.status})`);
  return res.json.data.token;
}

function assertGradeMatch(recommendations, expectedGrade) {
  return recommendations.every((row) => row.gradeLevel === expectedGrade);
}

async function main() {
  const checks = [];
  const parentToken = await loginParent();
  const studentToken = await loginStudent();

  const overview = await request('GET', '/children/recommendations/overview', {
    token: parentToken,
  });
  const children = overview.json?.data?.overview?.children ?? [];

  checks.push([
    '1. Parent recommendations overview 200',
    overview.status === 200 && children.length > 0,
  ]);

  const adaptiveChild =
    children.find((c) => ADAPTIVE_GRADE_LEVELS.includes(c.gradeLevel)) ?? children[0];
  const nonAdaptiveChild = children.find(
    (c) => c.gradeLevel && !ADAPTIVE_GRADE_LEVELS.includes(c.gradeLevel),
  );

  checks.push([
    '2. learningProfile on adaptive-grade child',
    adaptiveChild?.learningProfile?.adaptiveEnabled === true &&
      Array.isArray(adaptiveChild.learningProfile.categories) &&
      adaptiveChild.learningProfile.categories.length === 6,
  ]);

  checks.push([
    '3. adaptiveInsights fields present',
    adaptiveChild?.adaptiveInsights?.whatsNext !== undefined &&
      (adaptiveChild.adaptiveInsights.focusArea === null ||
        typeof adaptiveChild.adaptiveInsights.focusArea.label === 'string'),
  ]);

  const firstRec = adaptiveChild?.recommendations?.[0];
  checks.push([
    '4. Adaptive recommendation metadata',
    firstRec?.category &&
      firstRec?.categoryStatus &&
      firstRec?.adaptiveAction &&
      firstRec?.recommendedDifficulty,
  ]);

  checks.push([
    '5. Grade-scoped recommendations (adaptive child)',
    assertGradeMatch(
      adaptiveChild?.recommendations ?? [],
      adaptiveChild?.gradeLevel,
    ),
  ]);

  const meRecs = await request('GET', '/children/me/recommendations', {
    token: studentToken,
  });
  const meData = meRecs.json?.data;
  checks.push([
    '6. Student /me/recommendations includes learningProfile',
    meRecs.status === 200 &&
      meData?.learningProfile?.categories?.length === 6 &&
      meData?.adaptiveInsights !== undefined,
  ]);

  if (nonAdaptiveChild) {
    checks.push([
      '7. Non-adaptive grade disables adaptive flag',
      nonAdaptiveChild.learningProfile?.adaptiveEnabled === false,
    ]);
  } else {
    checks.push(['7. Non-adaptive grade (skipped — no G4+ child in seed)', true]);
  }

  const statuses = new Set(
    (adaptiveChild?.learningProfile?.categories ?? []).map((c) => c.status),
  );
  const validStatuses = ['needs_practice', 'progressing', 'mastery', 'unattempted'];
  checks.push([
    '8. Category statuses are valid enums',
    [...statuses].every((s) => validStatuses.includes(s)),
  ]);

  const priorities = new Set(
    (adaptiveChild?.recommendations ?? []).map((r) => r.priority),
  );
  checks.push([
    '9. Recommendation priorities high/medium/low',
    [...priorities].every((p) => ['high', 'medium', 'low'].includes(p)),
  ]);

  console.log('\n=== Quiz-Wise Adaptive MVP Verification ===\n');
  for (const [label, ok] of checks) {
    console.log(ok ? 'PASS' : 'FAIL', label);
  }

  if (adaptiveChild) {
    console.log('\nAdaptive child:', {
      name: adaptiveChild.name,
      gradeLevel: adaptiveChild.gradeLevel,
      focus: adaptiveChild.adaptiveInsights?.focusArea?.label,
      strongest: adaptiveChild.adaptiveInsights?.strongestArea?.label,
      whatsNext: adaptiveChild.adaptiveInsights?.whatsNext?.title,
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
