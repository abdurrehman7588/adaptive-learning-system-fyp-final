import http from 'http';
import { createApp } from '../src/app.js';

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
  if (!res.json?.data?.token) throw new Error('Parent login failed');
  return res.json.data.token;
}

async function loginStudent() {
  const res = await request('POST', '/auth/student/login', {
    body: { username: 'demokid', pin: '1234' },
  });
  if (!res.json?.data?.token) throw new Error('Student login failed');
  return res.json.data.token;
}

async function main() {
  const checks = [];

  const parentToken = await loginParent();
  const studentToken = await loginStudent();

  const listRes = await request('GET', '/quizzes', { token: studentToken });
  checks.push(['list quizzes', listRes.status === 200 && listRes.json?.data?.quizzes?.length >= 1]);

  const quizId = listRes.json.data.quizzes[0].id;
  const detailRes = await request('GET', `/quizzes/${quizId}`, { token: studentToken });
  const detailQuestions = detailRes.json?.data?.questions ?? [];
  const hasCorrectHidden = detailQuestions.every((q) =>
    (q.options ?? []).every((o) => o.is_correct === undefined),
  );
  checks.push(['quiz detail hides answers', detailRes.status === 200 && hasCorrectHidden]);

  const childrenRes = await request('GET', '/children', { token: parentToken });
  const childId = childrenRes.json?.data?.children?.[0]?.id;
  if (!childId) throw new Error('No demo child');

  const startRes = await request('POST', `/quizzes/${quizId}/attempts`, {
    token: studentToken,
    body: { child_id: childId },
  });
  const attemptId = startRes.json?.data?.attempt?.id;
  const startQuestions = startRes.json?.data?.questions ?? [];
  checks.push([
    'start attempt',
    startRes.status === 201 && attemptId && startQuestions[0]?.options?.[0]?.id,
  ]);

  const answers = startQuestions.map((question, index) => ({
    question_id: question.id,
    selected_option_id: question.options[index % question.options.length].id,
    time_taken_seconds: 3,
  }));

  const submitRes = await request('POST', `/attempts/${attemptId}/submit`, {
    token: studentToken,
    body: { answers },
  });
  const attempt = submitRes.json?.data?.attempt;
  checks.push([
    'submit scored',
    submitRes.status === 200 &&
      typeof attempt?.score === 'number' &&
      attempt.total_points === startQuestions.length,
  ]);

  const getRes = await request('GET', `/attempts/${attemptId}`, { token: studentToken });
  checks.push(['get own attempt', getRes.status === 200 && getRes.json?.data?.attempt?.id === attemptId]);

  const spoofStart = await request('POST', `/quizzes/${quizId}/attempts`, {
    token: studentToken,
    body: { child_id: 999999 },
  });
  checks.push(['student cannot spoof child_id', spoofStart.status === 403]);

  const doubleSubmit = await request('POST', `/attempts/${attemptId}/submit`, {
    token: studentToken,
    body: { answers },
  });
  checks.push(['cannot submit twice', doubleSubmit.status === 409]);

  for (const [label, ok] of checks) {
    console.log(ok ? 'PASS' : 'FAIL', label);
  }

  const failed = checks.filter(([, ok]) => !ok);
  server.close();
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  server.close();
  process.exit(1);
});
