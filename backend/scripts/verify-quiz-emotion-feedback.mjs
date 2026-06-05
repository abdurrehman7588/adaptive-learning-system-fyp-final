import http from 'http';
import { createApp } from '../src/app.js';
import { resolveEmotionalSignal } from '../src/modules/emotion-feedback/services/emotionalSignal.service.js';
import { EMOTION_FEEDBACK_OPTIONS } from '../src/modules/emotion-feedback/constants/emotionFeedback.constants.js';

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

async function loginStudent() {
  const res = await request('POST', '/auth/student/login', {
    body: { username: 'demokid', pin: '1234' },
  });
  if (res.status !== 200) throw new Error(`Student login failed (${res.status})`);
  return {
    token: res.json.data.token,
    childId: res.json.data.user.childId ?? res.json.data.user.id,
  };
}

async function loginParent() {
  const res = await request('POST', '/auth/login', {
    body: { email: 'parent@demo.com', password: 'password123' },
  });
  if (res.status !== 200) throw new Error(`Parent login failed (${res.status})`);
  return res.json.data.token;
}

async function main() {
  const checks = [];
  const { token: studentToken, childId } = await loginStudent();
  const parentToken = await loginParent();

  const meRecs = await request('GET', '/children/me/recommendations', { token: studentToken });
  checks.push(['Student recommendations 200', meRecs.status === 200]);

  const attemptsRes = await request('GET', `/children/${childId}/analytics`, { token: parentToken });
  const recent = attemptsRes.json?.data?.analytics?.recentHistory ?? [];
  const latestAttemptId = recent[0]?.attemptId;

  if (!latestAttemptId) {
    checks.push(['Latest attempt exists for feedback test', false]);
  } else {
    const submit = await request('POST', '/emotion-feedback', {
      token: studentToken,
      body: { quiz_attempt_id: latestAttemptId, emotion_label: 'frustrated' },
    });
    checks.push(['POST emotion-feedback 201 or 200 (idempotent)', submit.status === 201 || submit.status === 200]);

    const list = await request('GET', `/emotion-feedback/${childId}`, { token: parentToken });
    checks.push(['GET emotion-feedback/:childId 200', list.status === 200]);
    checks.push(
      ['Latest feedback score mapped to 20',
        list.json?.data?.latest?.emotionScore === EMOTION_FEEDBACK_OPTIONS.frustrated.score],
    );

    const recsAfter = await request('GET', '/children/me/recommendations', { token: studentToken });
    const features = recsAfter.json?.data?.learningProfile?.tierRecommendation?.features;
    checks.push(
      ['Recommendations use quiz_feedback source',
        features?.emotional_signal_source === 'quiz_feedback'],
    );

    const reasoning = recsAfter.json?.data?.learningProfile?.tierRecommendation?.reasoningSummary ?? '';
    checks.push(
      ['Reasoning mentions recent quiz feeling',
        reasoning.toLowerCase().includes('frustrated') || reasoning.toLowerCase().includes('difficulty')],
    );
  }

  let failed = 0;
  console.log('\n=== Quiz Emotion Feedback Verification ===\n');
  for (const [label, ok] of checks) {
    console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`);
    if (!ok) failed += 1;
  }

  server.close();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  server.close();
  process.exit(1);
});
