import http from 'http';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app.js';

const prisma = new PrismaClient();
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
        res.on('data', (c) => {
          data += c;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            json: data ? JSON.parse(data) : null,
          });
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
  const token = await loginStudent();

  const profileRes = await request('GET', '/children/me/profile', { token });
  const bundle = profileRes.json?.data;

  checks.push(['GET /children/me/profile returns 200', profileRes.status === 200]);
  checks.push(['Learner name present', Boolean(bundle?.learner?.name)]);
  checks.push(['Learner username present', Boolean(bundle?.learner?.username)]);
  checks.push(['Parent name present', Boolean(bundle?.parent?.name)]);
  checks.push(['Parent account_linked true', bundle?.parent?.account_linked === true]);
  checks.push(['Account level is number', typeof bundle?.account?.current_level === 'number']);
  checks.push(['Account total_xp is number', typeof bundle?.account?.total_xp === 'number']);
  checks.push(['Member since ISO string', Boolean(bundle?.account?.member_since)]);

  const patchRes = await request('PATCH', '/children/me', {
    token,
    body: { avatar_url: '🦊' },
  });
  checks.push(['PATCH /children/me avatar 200', patchRes.status === 200]);

  const child = await prisma.child.findFirst({
    where: { username: 'demokid' },
    select: { avatarUrl: true },
  });
  checks.push(['Avatar persisted in DB', child?.avatarUrl === '🦊']);

  const profile2 = await request('GET', '/children/me/profile', { token });
  checks.push([
    'Profile reload shows new avatar',
    profile2.json?.data?.learner?.avatar_url === '🦊',
  ]);

  const parentPut = await request('PUT', '/children/1', {
    token,
    body: { avatar_url: '🐱' },
  });
  checks.push(['Student blocked from PUT /children/:id', parentPut.status === 403]);

  console.log('\n=== Student Profile API Verification ===\n');
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
