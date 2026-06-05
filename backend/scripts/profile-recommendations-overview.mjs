/**
 * Profile GET /api/children/recommendations/overview timing breakdown.
 * Run: node scripts/profile-recommendations-overview.mjs
 */

import { performance } from 'node:perf_hooks';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createChildModule } from '../src/modules/child/index.js';
import { createAiModule } from '../src/modules/ai/index.js';
import { createAnalyticsModule } from '../src/modules/analytics/index.js';
import { AttemptAnalyticsRepository } from '../src/modules/analytics/repositories/attemptAnalytics.repository.js';
import { buildStudentFeatures } from '../src/modules/ai/services/studentFeatures.service.js';
import { buildChildRecommendations } from '../src/modules/analytics/services/recommendation.service.js';
import {
  filterQuizzesForChildGrade,
  loadChildGradeEnumForId,
} from '../src/shared/content/gradeCatalogFilter.js';
import { disconnectPrisma } from '../src/shared/db/prisma.js';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(backendRoot, '.env') });

const API_BASE = process.env.PROFILE_API_BASE ?? 'http://127.0.0.1:5000';

function ms(start, end = performance.now()) {
  return Math.round((end - start) * 100) / 100;
}

async function request(method, urlPath, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const started = performance.now();
  const res = await fetch(`${API_BASE}${urlPath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const elapsed = ms(started);
  const json = await res.json().catch(() => null);
  return { status: res.status, elapsed, json };
}

function timePythonColdAndWarm() {
  const script = path.join(backendRoot, 'ml', 'predict_recommendation.py');
  const payload = JSON.stringify({
    average_score: 55,
    quiz_attempts: 5,
    completion_rate: 80,
    emotional_score: 62,
  });

  const runOnce = () => {
    const started = performance.now();
    const result = spawnSync('python', [script], {
      input: payload,
      cwd: backendRoot,
      encoding: 'utf8',
      windowsHide: true,
    });
    return { ms: ms(started), code: result.status, stderr: result.stderr?.slice(0, 200) };
  };

  const cold = runOnce();
  const warm = runOnce();
  return { cold, warm };
}

function profilePythonLoadOnly() {
  const code = `
import time
from pathlib import Path
import joblib

ML_DIR = Path(r"${path.join(backendRoot, 'ml').replace(/\\/g, '\\\\')}")
start = time.perf_counter()
model = joblib.load(ML_DIR / "model.pkl")
encoder = joblib.load(ML_DIR / "label_encoder.pkl")
load_ms = (time.perf_counter() - start) * 1000

start = time.perf_counter()
row = [[55.0, 5.0, 80.0, 62.0]]
proba = model.predict_proba(row)[0]
pred_ms = (time.perf_counter() - start) * 1000
print(f"load_ms={load_ms:.2f} predict_ms={pred_ms:.2f}")
`;
  const started = performance.now();
  const result = spawnSync('python', ['-c', code], { encoding: 'utf8', windowsHide: true });
  return { totalMs: ms(started), stdout: result.stdout?.trim(), stderr: result.stderr?.slice(0, 300) };
}

async function main() {
  const childModule = createChildModule();
  const aiModule = createAiModule({ childQueryPort: childModule.childQueryPort });
  const analyticsModule = createAnalyticsModule({
    childQueryPort: childModule.childQueryPort,
    recommendationPredictionService: aiModule.recommendationPredictionService,
  });
  const repository = new AttemptAnalyticsRepository();

  console.log('=== Python subprocess benchmarks ===');
  const pyProcess = timePythonColdAndWarm();
  console.log('Full predict script (spawn + import sklearn + load + predict):');
  console.log(`  run 1 (cold): ${pyProcess.cold.ms} ms`);
  console.log(`  run 2 (warm): ${pyProcess.warm.ms} ms`);

  const pyLoad = profilePythonLoadOnly();
  console.log('In-process Python (load + predict only, no spawn):');
  console.log(`  ${pyLoad.stdout || pyLoad.stderr}`);

  console.log('\n=== HTTP endpoint ===');
  const login = await request('POST', '/api/auth/login', {
    body: { email: 'parent@demo.com', password: 'password123' },
  });
  if (login.status !== 200) {
    console.error('Parent login failed', login);
    process.exit(1);
  }
  const token = login.json.data.token;
  const parentId = login.json.data.user?.id ?? login.json.data.user?.parentId;

  const http = await request('GET', '/api/children/recommendations/overview', { token });
  console.log(`GET /api/children/recommendations/overview: ${http.status} in ${http.elapsed} ms`);
  const childCount = http.json?.data?.overview?.children?.length ?? 0;
  console.log(`  children in response: ${childCount}`);

  console.log('\n=== Programmatic breakdown (same orchestrator path) ===');
  const totalStart = performance.now();

  let t0 = performance.now();
  const children = await childModule.childQueryPort.listByParentId(Number(parentId));
  const dbListChildrenMs = ms(t0);

  t0 = performance.now();
  const allQuizzes = await repository.listPublishedQuizzes();
  const dbListQuizzesMs = ms(t0);

  let dbAttemptsTotal = 0;
  let dbGradeTotal = 0;
  let dbEmotionalTotal = 0;
  let featureExtractTotal = 0;
  let pythonPredictTotal = 0;
  let buildBundleTotal = 0;
  const perChild = [];

  for (const child of children) {
    const childStart = performance.now();
    const row = { childId: child.id, name: child.name };

    t0 = performance.now();
    const attempts = await repository.findAttemptsForChild(child.id);
    row.dbAttemptsMs = ms(t0);
    dbAttemptsTotal += row.dbAttemptsMs;

    t0 = performance.now();
    const childGrade = await loadChildGradeEnumForId(childModule.childQueryPort, child.id);
    row.dbGradeMs = ms(t0);
    dbGradeTotal += row.dbGradeMs;

    t0 = performance.now();
    let emotionalScore = null;
    try {
      const latest = await aiModule.emotionalRepository.findLatestAssessment(child.id);
      if (latest?.overallPercent != null) emotionalScore = Number(latest.overallPercent);
    } catch {
      /* ignore */
    }
    row.dbEmotionalMs = ms(t0);
    dbEmotionalTotal += row.dbEmotionalMs;

    t0 = performance.now();
    const features = buildStudentFeatures(attempts, emotionalScore);
    row.featureExtractMs = ms(t0);
    featureExtractTotal += row.featureExtractMs;

    t0 = performance.now();
    const tierPrediction = await aiModule.recommendationPredictionService.predictForChild(
      child.id,
      attempts,
    );
    row.pythonPredictMs = ms(t0);
    pythonPredictTotal += row.pythonPredictMs;

    t0 = performance.now();
    const quizzes = filterQuizzesForChildGrade(allQuizzes, childGrade);
    buildChildRecommendations(
      { id: child.id, name: child.name, gradeLevel: childGrade, attempts },
      quizzes,
      { tierPrediction },
    );
    row.buildBundleMs = ms(t0);
    buildBundleTotal += row.buildBundleMs;

    row.totalMs = ms(childStart);
    row.source = tierPrediction.source;
    perChild.push(row);
  }

  const programmaticTotal = ms(totalStart);

  console.log(`Children processed: ${children.length}`);
  console.log(`DB listChildren: ${dbListChildrenMs} ms`);
  console.log(`DB listPublishedQuizzes: ${dbListQuizzesMs} ms`);
  console.log(`DB findAttemptsForChild (sum): ${dbAttemptsTotal} ms`);
  console.log(`DB loadChildGradeEnumForId (sum): ${dbGradeTotal} ms`);
  console.log(`DB emotional findLatest (sum): ${dbEmotionalTotal} ms`);
  console.log(`Feature extraction (sum): ${featureExtractTotal} ms`);
  console.log(`predictForChild incl. Python spawn (sum): ${pythonPredictTotal} ms`);
  console.log(`buildChildRecommendations (sum): ${buildBundleTotal} ms`);
  console.log(`Programmatic total (sequential loop): ${programmaticTotal} ms`);
  console.log('\nPer child:');
  for (const row of perChild) {
    console.log(
      `  child ${row.childId} (${row.name}): total=${row.totalMs}ms python=${row.pythonPredictMs}ms dbAttempts=${row.dbAttemptsMs}ms source=${row.source}`,
    );
  }

  console.log('\n=== Also profile analytics/overview (no ML) ===');
  const analyticsHttp = await request('GET', '/api/children/analytics/overview', { token });
  console.log(`GET /api/children/analytics/overview: ${analyticsHttp.status} in ${analyticsHttp.elapsed} ms`);

  await disconnectPrisma();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
