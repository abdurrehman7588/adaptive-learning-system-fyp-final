import {
  buildAdaptiveFeatures,
  buildAdaptiveProfile,
  computeAdaptiveScore,
  resolveAdaptiveActionFromProfile,
  resolveLearnerLevel,
  ADAPTIVE_SCORE_WEIGHTS,
} from '../src/modules/adaptive/adaptiveScore.service.js';
import { ruleBasedRecommendationLevel } from '../src/modules/adaptive/adaptiveRules.js';

function makeAttempt(score, total = 10, status = 'completed', category = 'math') {
  return {
    id: Math.random(),
    status,
    score,
    totalPoints: total,
    percentage: (score / total) * 100,
    completedAt: new Date(),
    startedAt: new Date(),
    quiz: { title: 'Test', category, subject: category },
    answers: [
      { isCorrect: score > total / 2, timeTakenSeconds: 20 },
      { isCorrect: score > total / 2, timeTakenSeconds: 35 },
    ],
  };
}

const checks = [];

const strongAttempts = [
  makeAttempt(9, 10),
  makeAttempt(8, 10),
  makeAttempt(9, 10, 'completed', 'science'),
];
const weakAttempts = [makeAttempt(3, 10), makeAttempt(4, 10)];

const strongFeatures = buildAdaptiveFeatures(strongAttempts, 72);
const weakFeatures = buildAdaptiveFeatures(weakAttempts, 40);

const strongScore = computeAdaptiveScore(strongFeatures);
const weakScore = computeAdaptiveScore(weakFeatures);

checks.push(['Weights sum to 1', Object.values(ADAPTIVE_SCORE_WEIGHTS).reduce((s, v) => s + v, 0) === 1]);
checks.push(['Strong learner score > weak', strongScore > weakScore]);
checks.push(['Strong learner level advanced/progressing', ['advanced', 'progressing'].includes(resolveLearnerLevel(strongScore))]);
checks.push(['Weak learner level beginner/developing', ['beginner', 'developing'].includes(resolveLearnerLevel(weakScore))]);

const mlPrediction = { recommendation: 'Hard', confidence: 0.82, source: 'model' };
const hybrid = buildAdaptiveProfile(weakFeatures, mlPrediction);
checks.push(['Hybrid blend returns recommendation', ['Easy', 'Medium', 'Hard'].includes(hybrid.recommendation)]);
checks.push(['Hybrid source tagged', hybrid.source === 'hybrid_ml_adaptive']);
checks.push(['Adaptive action for weak last score is retry', resolveAdaptiveActionFromProfile({
  adaptiveScore: weakScore,
  learnerLevel: 'beginner',
  trendDirection: 'declining',
  lastScorePercent: 40,
  categoryAveragePercent: 45,
  categoryAttemptCount: 2,
}) === 'retry']);

const rules = ruleBasedRecommendationLevel(strongFeatures);
checks.push(['Rule fallback uses adaptive score fields', rules.adaptiveScore !== undefined]);

let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`);
  if (!ok) failed += 1;
}

console.log('\nSample strong profile:', {
  adaptiveScore: strongScore,
  learnerLevel: resolveLearnerLevel(strongScore),
  recommendation: buildAdaptiveProfile(strongFeatures, mlPrediction).recommendation,
});

process.exit(failed > 0 ? 1 : 0);
