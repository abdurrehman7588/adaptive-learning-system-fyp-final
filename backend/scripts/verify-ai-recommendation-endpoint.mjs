/**
 * End-to-end verify: AI recommendation endpoint + fallback.
 * Run: node scripts/verify-ai-recommendation-endpoint.mjs
 */

import { renameSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { predictRecommendationLevel } from '../src/modules/ai/services/mlPrediction.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.resolve(__dirname, '..');
const MODEL_PATH = path.join(BACKEND_ROOT, 'ml', 'model.pkl');
const MODEL_BACKUP = path.join(BACKEND_ROOT, 'ml', 'model.pkl.bak-verify');

const PORT = 5099;
const BASE = `http://127.0.0.1:${PORT}`;

async function request(method, urlPath, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${urlPath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, json };
}

async function loginStudent() {
  const res = await request('POST', '/api/auth/student/login', {
    body: { username: 'demokid', pin: '1234' },
  });
  if (res.status !== 200) {
    throw new Error(`Student login failed (${res.status}): ${JSON.stringify(res.json)}`);
  }
  return {
    token: res.json.data.token,
    childId: res.json.data.child.id,
  };
}

function assertRouteRegistered(app) {
  const routes = [];
  app._router.stack.forEach((layer) => {
    if (layer.route?.path) {
      routes.push(`${Object.keys(layer.route.methods).join(',').toUpperCase()} ${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle?.stack) {
      const prefix = layer.regexp?.source ?? '';
      const mount = prefix.includes('ai') ? '/api/ai' : '';
      layer.handle.stack.forEach((sub) => {
        if (sub.route?.path) {
          routes.push(
            `${Object.keys(sub.route.methods).join(',').toUpperCase()} ${mount}${sub.route.path}`,
          );
        }
      });
    }
  });
  const aiRoute = routes.find((r) => r.includes('/recommendation/:childId'));
  return { routes, aiRoute };
}

async function testFallback() {
  let renamed = false;
  try {
    if (existsSync(MODEL_PATH)) {
      renameSync(MODEL_PATH, MODEL_BACKUP);
      renamed = true;
    }
    const result = await predictRecommendationLevel(
      { average_score: 55, quiz_attempts: 5, completion_rate: 80, emotional_score: 62 },
      999,
    );
    if (result.source !== 'rules') {
      throw new Error(`Expected rules fallback, got source=${result.source}`);
    }
    if (!['Easy', 'Medium', 'Hard'].includes(result.recommendation)) {
      throw new Error(`Invalid recommendation label: ${result.recommendation}`);
    }
    return result;
  } finally {
    if (renamed && existsSync(MODEL_BACKUP)) {
      renameSync(MODEL_BACKUP, MODEL_PATH);
    }
  }
}

const app = createApp();
const { routes, aiRoute } = assertRouteRegistered(app);
console.log('Registered AI route:', aiRoute ?? 'NOT FOUND');
console.log('Sample mounted routes:', routes.filter((r) => r.includes('ai') || r.includes('recommendation')).slice(0, 5));

const server = app.listen(PORT);

try {
  const unauth = await request('GET', '/api/ai/recommendation/1');
  console.log('Unauthenticated status:', unauth.status, '(expect 401)');

  let student;
  try {
    student = await loginStudent();
  } catch (error) {
    console.warn('Skipping live auth test (DB/demo user unavailable):', error.message);
    student = null;
  }

  if (student) {
    const url = `/api/ai/recommendation/${student.childId}`;
    const authed = await request('GET', url, { token: student.token });
    console.log('Authenticated GET', url);
    console.log('Status:', authed.status);
    console.log('Response:', JSON.stringify(authed.json, null, 2));
  }

  const fallback = await testFallback();
  console.log('Fallback test OK:', fallback);
} finally {
  server.close();
}

console.log('\nAI recommendation endpoint verify complete');
