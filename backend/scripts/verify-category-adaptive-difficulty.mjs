import {
  buildAllCategoryAdaptiveProfiles,
  buildAdaptiveProfileFromAttempts,
  resolveDifficultyFromAdaptiveScore,
} from '../src/modules/adaptive/adaptiveScore.service.js';
import { buildLearningProfile } from '../src/modules/adaptive/learningProfile.service.js';
import {
  buildAdaptiveRecommendations,
} from '../src/modules/adaptive/adaptiveRecommendations.service.js';
import { resolveCategoryRecommendedDifficulty } from '../src/modules/adaptive/adaptiveRules.js';
import { selectQuizForAdaptiveTier } from '../src/modules/adaptive/adaptiveTierRouting.js';

function makeAttempt(score, total, category, status = 'completed') {
  return {
    id: Math.random(),
    status,
    score,
    totalPoints: total,
    percentage: (score / total) * 100,
    completedAt: new Date(),
    startedAt: new Date(),
    quizId: Math.floor(Math.random() * 10000),
    quiz: { title: `${category} quiz`, category, subject: category },
    answers: [{ isCorrect: score > total / 2, timeTakenSeconds: 25 }],
  };
}

const checks = [];

const attempts = [
  makeAttempt(9, 10, 'math'),
  makeAttempt(8, 10, 'math'),
  makeAttempt(4, 10, 'science'),
  makeAttempt(3, 10, 'science'),
  makeAttempt(7, 10, 'memory'),
  makeAttempt(6, 10, 'memory'),
];

const globalProfile = buildAdaptiveProfileFromAttempts(attempts, 55, {
  recommendation: 'Hard',
  confidence: 0.9,
  source: 'model',
});

const categoryProfiles = buildAllCategoryAdaptiveProfiles(attempts, 55);
const math = categoryProfiles.find((row) => row.category === 'math');
const science = categoryProfiles.find((row) => row.category === 'science');
const memory = categoryProfiles.find((row) => row.category === 'memory');

checks.push(['Math category average ~85', (math?.averageScore ?? 0) >= 80]);
checks.push(['Science category average ~35', (science?.averageScore ?? 0) < 45]);
checks.push(['Memory category average ~65', (memory?.averageScore ?? 0) >= 60 && (memory?.averageScore ?? 0) < 75]);
checks.push(['Math recommended hard', math?.recommendedDifficulty === 'hard']);
checks.push(['Science recommended easy (avg-driven)', science?.recommendedDifficulty === 'easy']);
checks.push(['Memory recommended medium (avg-driven)', memory?.recommendedDifficulty === 'medium']);
checks.push(['Science adaptive score still computed', (science?.adaptiveScore ?? 0) > 0]);
checks.push(
  ['Categories differ from global blended tier', math?.recommendedDifficulty !== science?.recommendedDifficulty],
);

const learningProfile = buildLearningProfile(attempts, 'kindergarten', {
  recommendation: globalProfile.recommendation,
  confidence: globalProfile.confidence,
  source: globalProfile.source,
  adaptiveProfile: globalProfile,
});

const mathRow = learningProfile.categories.find((row) => row.category === 'math');
const scienceRow = learningProfile.categories.find((row) => row.category === 'science');
const memoryRow = learningProfile.categories.find((row) => row.category === 'memory');

checks.push(['Learning profile keeps global adaptive score', learningProfile.adaptiveProfile?.adaptiveScore !== null]);
checks.push(['Learning profile math difficulty hard', mathRow?.recommendedDifficulty === 'hard']);
checks.push(['Learning profile science difficulty easy', scienceRow?.recommendedDifficulty === 'easy']);
checks.push(['Learning profile memory difficulty medium', memoryRow?.recommendedDifficulty === 'medium']);
checks.push(
  ['Profile ignores global ML tier for categories', scienceRow?.recommendedDifficulty !== 'hard'],
);

const mockQuizzes = ['math', 'science', 'memory', 'pattern_recognition', 'problem_solving', 'critical_thinking'].flatMap(
  (category) =>
    ['easy', 'medium', 'hard'].map((difficultyLevel, index) => ({
      id: `${category}-${difficultyLevel}`.length + index,
      title: `${category} ${difficultyLevel}`,
      description: null,
      category,
      gradeLevel: 'kindergarten',
      difficultyLevel,
      timeLimitMinutes: 10,
      _count: { questions: 5 },
    })),
);

const recommendations = buildAdaptiveRecommendations(
  learningProfile,
  mockQuizzes,
  attempts,
  {
    recommendation: globalProfile.recommendation,
    confidence: globalProfile.confidence,
    source: globalProfile.source,
    adaptiveProfile: globalProfile,
  },
);

const recMath = recommendations.find((row) => row.category === 'math');
const recScience = recommendations.find((row) => row.category === 'science');
const recMemory = recommendations.find((row) => row.category === 'memory');

checks.push(['Quiz routing math uses hard tier', recMath?.recommendedDifficulty === 'hard']);
checks.push(['Quiz routing science uses easy tier', recScience?.recommendedDifficulty === 'easy']);
checks.push(['Quiz routing memory uses medium tier', recMemory?.recommendedDifficulty === 'medium']);
checks.push(['Math tier matched', recMath?.tierMatched === true]);
checks.push(['Science tier matched', recScience?.tierMatched === true]);
checks.push(['Memory tier matched', recMemory?.tierMatched === true]);

for (const status of ['needs_practice', 'progressing', 'mastery', 'unattempted']) {
  const tier = resolveCategoryRecommendedDifficulty({
    status,
    attemptCount: status === 'unattempted' ? 0 : 2,
    averagePercent: status === 'needs_practice' ? 35 : status === 'mastery' ? 88 : 65,
  });
  const { tierMatched, quiz } = selectQuizForAdaptiveTier(
    mockQuizzes,
    'math',
    tier,
    'kindergarten',
  );
  checks.push([`K math routing still works for ${status}`, tierMatched === true && quiz?.difficultyLevel === tier]);
}

checks.push([
  'Average-only thresholds match examples',
  resolveDifficultyFromAdaptiveScore(88) === 'hard' &&
    resolveDifficultyFromAdaptiveScore(42) === 'easy' &&
    resolveDifficultyFromAdaptiveScore(68) === 'medium',
]);

let failed = 0;
console.log('\n=== Category Adaptive Difficulty Verification ===\n');
for (const [label, ok] of checks) {
  console.log(ok ? 'PASS' : 'FAIL', label);
  if (!ok) failed += 1;
}

console.log('\nBefore (global): all categories would use', globalProfile.recommendedDifficulty);
console.log('After (per category):', {
  math: mathRow?.recommendedDifficulty,
  science: scienceRow?.recommendedDifficulty,
  memory: memoryRow?.recommendedDifficulty,
  globalTierRecommendation: learningProfile.tierRecommendation?.recommendation,
});

process.exit(failed > 0 ? 1 : 0);
