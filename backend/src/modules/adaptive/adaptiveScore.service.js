import {
  CATEGORY_LABELS,
  normalizeLearningCategory,
  resolveQuizSubject,
} from '../../shared/content/taxonomy.js';
import { buildLearningSpeedInsights } from '../analytics/utils/learningSpeed.js';
import { ML_EMOTIONAL_SCORE_DEFAULT } from '../ai/services/studentFeatures.service.js';
import { FROZEN_LEARNING_CATEGORIES } from './adaptiveRules.js';

/**
 * @param {'Easy' | 'Medium' | 'Hard' | string} label
 * @returns {DifficultyLevel}
 */
function recommendationLabelToDifficulty(label) {
  const map = { Easy: 'easy', Medium: 'medium', Hard: 'hard' };
  return map[label] ?? 'medium';
}

/** @typedef {'beginner' | 'developing' | 'progressing' | 'advanced'} LearnerLevel */
/** @typedef {'easy' | 'medium' | 'hard'} DifficultyLevel */
/** @typedef {'retry' | 'practice' | 'challenge' | 'explore'} AdaptiveAction */
/** @typedef {'improving' | 'stable' | 'declining' | 'insufficient_data'} TrendDirection */

export const ADAPTIVE_SCORE_WEIGHTS = {
  average_score: 0.3,
  completion_rate: 0.15,
  emotional_score: 0.1,
  performance_trend: 0.15,
  learning_speed: 0.15,
  mastery_score: 0.15,
};

export const LEARNER_LEVEL_THRESHOLDS = {
  beginner: 40,
  developing: 55,
  progressing: 70,
};

export const ADAPTIVE_DIFFICULTY_THRESHOLDS = {
  easy: 45,
  medium: 70,
};

const ML_BLEND_WEIGHT = 0.6;
const ADAPTIVE_BLEND_WEIGHT = 0.4;

/**
 * @param {import('@prisma/client').QuizAttempt} attempt
 */
function attemptPercent(attempt) {
  if (attempt.percentage !== null && attempt.percentage !== undefined) {
    return Number(attempt.percentage);
  }
  if (attempt.totalPoints > 0 && attempt.score !== null) {
    return Math.round((Number(attempt.score) / Number(attempt.totalPoints)) * 10000) / 100;
  }
  return 0;
}

/**
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 */
export function buildPerformanceTrendFeature(attempts) {
  const completed = attempts
    .filter((row) => row.status === 'completed')
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? b.startedAt).getTime() -
        new Date(a.completedAt ?? a.startedAt).getTime(),
    );

  const recentPercents = completed.slice(0, 6).map(attemptPercent);

  if (recentPercents.length < 2) {
    return {
      performance_trend: 50,
      trendDirection: /** @type {TrendDirection} */ ('insufficient_data'),
      changePercent: 0,
    };
  }

  const midpoint = Math.floor(recentPercents.length / 2);
  const earlier = recentPercents.slice(midpoint);
  const later = recentPercents.slice(0, midpoint);

  const avgEarlier =
    earlier.reduce((sum, value) => sum + value, 0) / Math.max(earlier.length, 1);
  const avgLater =
    later.reduce((sum, value) => sum + value, 0) / Math.max(later.length, 1);
  const changePercent = Math.round((avgLater - avgEarlier) * 100) / 100;

  let trendDirection = /** @type {TrendDirection} */ ('stable');
  if (changePercent >= 5) trendDirection = 'improving';
  else if (changePercent <= -5) trendDirection = 'declining';

  const performance_trend = Math.max(
    0,
    Math.min(100, Math.round((50 + changePercent * 2.5) * 100) / 100),
  );

  return { performance_trend, trendDirection, changePercent };
}

/**
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 */
export function buildLearningSpeedFeature(attempts) {
  const timingRows = [];
  for (const attempt of attempts.filter((row) => row.status === 'completed')) {
    const { label } = resolveQuizSubject(attempt.quiz ?? {});
    for (const answer of attempt.answers ?? []) {
      timingRows.push({
        isCorrect: answer.isCorrect,
        timeTakenSeconds: answer.timeTakenSeconds,
        subjectLabel: label,
      });
    }
  }

  const insights = buildLearningSpeedInsights(timingRows);
  const timedCount = insights.timedAnswerCount;

  if (timedCount === 0) {
    return { learning_speed: 50, timedAnswerCount: 0 };
  }

  const positive =
    insights.signals.strong_understanding +
    insights.signals.steady_correct +
    insights.signals.needs_review * 0.5;
  const negative =
    insights.signals.weak_concept +
    insights.signals.quick_miss +
    insights.signals.needs_practice;

  const raw = ((positive - negative * 0.75) / timedCount) * 100;
  const learning_speed = Math.max(0, Math.min(100, Math.round((50 + raw) * 100) / 100));

  return { learning_speed, timedAnswerCount: timedCount };
}

/**
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 */
export function buildMasteryFeature(attempts) {
  const completed = attempts.filter((row) => row.status === 'completed');
  /** @type {Map<string, { total: number, count: number }>} */
  const byCategory = new Map();

  for (const attempt of completed) {
    const { category } = resolveQuizSubject(attempt.quiz ?? {});
    const key = normalizeLearningCategory(category) ?? 'math';
    const entry = byCategory.get(key) ?? { total: 0, count: 0 };
    entry.total += attemptPercent(attempt);
    entry.count += 1;
    byCategory.set(key, entry);
  }

  const categoryScores = FROZEN_LEARNING_CATEGORIES.map((categoryId) => {
    const stats = byCategory.get(categoryId);
    if (!stats || stats.count === 0) return null;
    return {
      category: categoryId,
      label: CATEGORY_LABELS[categoryId] ?? categoryId,
      averagePercent: Math.round((stats.total / stats.count) * 100) / 100,
      attemptCount: stats.count,
    };
  }).filter(Boolean);

  if (categoryScores.length === 0) {
    return { mastery_score: 0, categoryMastery: [] };
  }

  const averages = categoryScores.map((row) => row.averagePercent);
  const meanAverage =
    Math.round((averages.reduce((sum, value) => sum + value, 0) / averages.length) * 100) /
    100;
  const masteryRatio =
    categoryScores.filter((row) => row.averagePercent >= 80).length / categoryScores.length;

  const mastery_score = Math.round((meanAverage * 0.7 + masteryRatio * 100 * 0.3) * 100) / 100;

  return { mastery_score, categoryMastery: categoryScores };
}

/**
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 * @param {number | null} [emotionalScore]
 */
/**
 * @param {import('../emotion-feedback/services/emotionalSignal.service.js').EmotionalSignal | number | null} [emotionalInput]
 */
function normalizeEmotionalInput(emotionalInput) {
  if (typeof emotionalInput === 'number') {
    return {
      score: emotionalInput,
      assessed: true,
      source: 'sdq_assessment',
      label: null,
    };
  }
  if (emotionalInput && typeof emotionalInput === 'object') {
    return emotionalInput;
  }
  return {
    score: null,
    assessed: false,
    source: 'neutral_default',
    label: null,
  };
}

/**
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 * @param {import('../emotion-feedback/services/emotionalSignal.service.js').EmotionalSignal | number | null} [emotionalInput]
 */
export function buildAdaptiveFeatures(attempts, emotionalInput = null) {
  const signal = normalizeEmotionalInput(emotionalInput);
  const completed = attempts.filter((row) => row.status === 'completed');
  const totalAttempts = attempts.length;

  let average_score = 0;
  if (completed.length > 0) {
    const sum = completed.reduce((acc, attempt) => acc + attemptPercent(attempt), 0);
    average_score = Math.round((sum / completed.length) * 100) / 100;
  }

  const completion_rate =
    totalAttempts > 0
      ? Math.round((completed.length / totalAttempts) * 10000) / 100
      : 0;

  const emotional_assessed = signal.assessed === true;
  const emotional_score = emotional_assessed
    ? Math.round(Number(signal.score) * 100) / 100
    : null;

  const trend = buildPerformanceTrendFeature(attempts);
  const speed = buildLearningSpeedFeature(attempts);
  const mastery = buildMasteryFeature(attempts);

  return {
    average_score,
    completion_rate,
    emotional_score,
    emotional_assessed,
    emotional_signal_source: signal.source,
    quiz_emotion_label: signal.label ?? null,
    performance_trend: trend.performance_trend,
    trendDirection: trend.trendDirection,
    trendChangePercent: trend.changePercent,
    learning_speed: speed.learning_speed,
    timedAnswerCount: speed.timedAnswerCount,
    mastery_score: mastery.mastery_score,
    categoryMastery: mastery.categoryMastery,
    quiz_attempts: Math.min(20, Math.max(1, completed.length || 1)),
  };
}

/**
 * @param {ReturnType<typeof buildAdaptiveFeatures>} features
 */
export function computeAdaptiveScore(features) {
  const emotionalInput =
    features.emotional_score !== null && features.emotional_score !== undefined
      ? features.emotional_score
      : ML_EMOTIONAL_SCORE_DEFAULT;

  const weighted =
    features.average_score * ADAPTIVE_SCORE_WEIGHTS.average_score +
    features.completion_rate * ADAPTIVE_SCORE_WEIGHTS.completion_rate +
    emotionalInput * ADAPTIVE_SCORE_WEIGHTS.emotional_score +
    features.performance_trend * ADAPTIVE_SCORE_WEIGHTS.performance_trend +
    features.learning_speed * ADAPTIVE_SCORE_WEIGHTS.learning_speed +
    features.mastery_score * ADAPTIVE_SCORE_WEIGHTS.mastery_score;

  return Math.round(weighted * 100) / 100;
}

/**
 * @param {number} adaptiveScore
 * @returns {LearnerLevel}
 */
export function resolveLearnerLevel(adaptiveScore) {
  if (adaptiveScore < LEARNER_LEVEL_THRESHOLDS.beginner) return 'beginner';
  if (adaptiveScore < LEARNER_LEVEL_THRESHOLDS.developing) return 'developing';
  if (adaptiveScore < LEARNER_LEVEL_THRESHOLDS.progressing) return 'progressing';
  return 'advanced';
}

/**
 * @param {number} adaptiveScore
 * @returns {DifficultyLevel}
 */
export function resolveDifficultyFromAdaptiveScore(adaptiveScore) {
  if (adaptiveScore < ADAPTIVE_DIFFICULTY_THRESHOLDS.easy) return 'easy';
  if (adaptiveScore < ADAPTIVE_DIFFICULTY_THRESHOLDS.medium) return 'medium';
  return 'hard';
}

/**
 * @param {DifficultyLevel} difficulty
 * @returns {'Easy' | 'Medium' | 'Hard'}
 */
export function difficultyToRecommendationLabel(difficulty) {
  const map = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
  return map[difficulty] ?? 'Medium';
}

/**
 * @param {number} adaptiveScore
 * @param {'Easy' | 'Medium' | 'Hard'} recommendation
 */
export function adaptiveConfidence(adaptiveScore, recommendation) {
  const target =
    recommendation === 'Easy' ? 25 : recommendation === 'Hard' ? 85 : 55;
  const dist = Math.abs(adaptiveScore - target);
  return Math.min(0.9, Math.round((0.55 + (30 - dist) / 60) * 100) / 100);
}

/**
 * Rule-based tier from the hybrid adaptive score (replaces average-only thresholds).
 *
 * @param {ReturnType<typeof buildAdaptiveFeatures>} features
 */
export function adaptiveScoreRecommendationLevel(features) {
  const adaptiveScore = computeAdaptiveScore(features);
  const difficulty = resolveDifficultyFromAdaptiveScore(adaptiveScore);
  const recommendation = difficultyToRecommendationLabel(difficulty);
  return {
    recommendation,
    confidence: adaptiveConfidence(adaptiveScore, recommendation),
    adaptiveScore,
    learnerLevel: resolveLearnerLevel(adaptiveScore),
    recommendedDifficulty: difficulty,
  };
}

/**
 * @param {DifficultyLevel} difficulty
 */
function difficultyOrdinal(difficulty) {
  if (difficulty === 'easy') return 1;
  if (difficulty === 'hard') return 3;
  return 2;
}

/**
 * @param {number} ordinal
 * @returns {DifficultyLevel}
 */
function ordinalToDifficulty(ordinal) {
  if (ordinal <= 1) return 'easy';
  if (ordinal >= 3) return 'hard';
  return 'medium';
}

/**
 * Blend Random Forest tier with adaptive-score tier.
 *
 * @param {{
 *   recommendation: 'Easy' | 'Medium' | 'Hard',
 *   confidence: number,
 *   source?: string,
 * }} mlPrediction
 * @param {ReturnType<typeof buildAdaptiveProfile>} adaptiveProfile
 */
export function blendDifficultyPrediction(mlPrediction, adaptiveProfile) {
  const mlDifficulty = recommendationLabelToDifficulty(mlPrediction.recommendation);
  const mlOrdinal = difficultyOrdinal(mlDifficulty);
  const adaptiveOrdinal = difficultyOrdinal(adaptiveProfile.recommendedDifficulty);

  const mlWeight = mlPrediction.source === 'model' ? ML_BLEND_WEIGHT : 0.35;
  const adaptiveWeight = 1 - mlWeight;
  const blendedOrdinal = Math.round(mlOrdinal * mlWeight + adaptiveOrdinal * adaptiveWeight);
  const blendedDifficulty = ordinalToDifficulty(blendedOrdinal);
  const blendedLabel = difficultyToRecommendationLabel(blendedDifficulty);

  const blendedConfidence = Math.min(
    0.95,
    Math.round(
      (mlPrediction.confidence * mlWeight +
        adaptiveProfile.confidence * adaptiveWeight) *
        100,
    ) / 100,
  );

  return {
    recommendation: blendedLabel,
    confidence: blendedConfidence,
    recommendedDifficulty: blendedDifficulty,
    learnerLevel: adaptiveProfile.learnerLevel,
    adaptiveScore: adaptiveProfile.adaptiveScore,
    blend: {
      ml: mlPrediction.recommendation,
      adaptive: difficultyToRecommendationLabel(adaptiveProfile.recommendedDifficulty),
      mlWeight,
      adaptiveWeight,
    },
  };
}

/**
 * @param {{
 *   adaptiveScore: number,
 *   learnerLevel: LearnerLevel,
 *   trendDirection: TrendDirection,
 *   lastScorePercent: number | null,
 *   categoryAveragePercent: number | null,
 *   categoryAttemptCount: number,
 *   categoryMasteryScore?: number | null,
 * }} input
 * @returns {AdaptiveAction}
 */
export function resolveAdaptiveActionFromProfile(input) {
  const {
    adaptiveScore,
    learnerLevel,
    trendDirection,
    lastScorePercent,
    categoryAveragePercent,
    categoryAttemptCount,
    categoryMasteryScore = null,
  } = input;

  if (lastScorePercent !== null && lastScorePercent < 60) {
    return 'retry';
  }

  if (trendDirection === 'declining' && adaptiveScore < 55) {
    return 'practice';
  }

  const categorySignal =
    categoryMasteryScore ?? categoryAveragePercent ?? adaptiveScore;

  if (
    categoryAttemptCount > 0 &&
    categorySignal !== null &&
    categorySignal < 55 &&
    learnerLevel !== 'advanced'
  ) {
    return 'practice';
  }

  if (
    categoryAttemptCount > 0 &&
    categorySignal !== null &&
    categorySignal >= 80 &&
    adaptiveScore >= 65
  ) {
    return 'challenge';
  }

  if (learnerLevel === 'advanced' && trendDirection === 'improving') {
    return 'challenge';
  }

  if (learnerLevel === 'beginner' && categoryAttemptCount === 0) {
    return 'explore';
  }

  return 'explore';
}

/**
 * @param {'needs_practice' | 'progressing' | 'mastery' | 'unattempted'} status
 * @param {number} adaptiveScore
 * @param {number} quizAttemptCount
 * @returns {'high' | 'medium' | 'low'}
 */
export function priorityFromAdaptiveScore(status, adaptiveScore, quizAttemptCount = 0) {
  if (status === 'needs_practice' || adaptiveScore < 45) return 'high';
  if (status === 'unattempted' || quizAttemptCount === 0) {
    return adaptiveScore >= 70 ? 'medium' : 'high';
  }
  if (status === 'mastery' && adaptiveScore >= 75) return 'low';
  if (adaptiveScore < 55) return 'high';
  if (status === 'progressing') return 'medium';
  return 'low';
}

/**
 * @param {ReturnType<typeof buildAdaptiveFeatures>} features
 * @param {{
 *   recommendation: 'Easy' | 'Medium' | 'Hard',
 *   confidence: number,
 *   source?: string,
 * } | null} [mlPrediction]
 */
export function buildAdaptiveProfile(features, mlPrediction = null) {
  const adaptiveScore = computeAdaptiveScore(features);
  const learnerLevel = resolveLearnerLevel(adaptiveScore);
  const recommendedDifficulty = resolveDifficultyFromAdaptiveScore(adaptiveScore);
  const adaptiveTier = adaptiveScoreRecommendationLevel(features);

  const base = {
    adaptiveScore,
    learnerLevel,
    recommendedDifficulty,
    confidence: adaptiveTier.confidence,
    features,
    nextLearningPath: resolveNextLearningPath(features),
  };

  if (!mlPrediction) {
    return {
      ...base,
      recommendation: adaptiveTier.recommendation,
      source: 'adaptive_score',
      blend: null,
    };
  }

  const blended = blendDifficultyPrediction(mlPrediction, {
    adaptiveScore,
    learnerLevel,
    recommendedDifficulty,
    confidence: adaptiveTier.confidence,
  });

  return {
    ...base,
    recommendation: blended.recommendation,
    recommendedDifficulty: blended.recommendedDifficulty,
    confidence: blended.confidence,
    source: mlPrediction.source === 'model' ? 'hybrid_ml_adaptive' : 'hybrid_rules_adaptive',
    blend: blended.blend,
  };
}

/**
 * @param {ReturnType<typeof buildAdaptiveFeatures>} features
 */
export function resolveNextLearningPath(features) {
  const { categoryMastery, trendDirection, mastery_score: masteryScore } = features;

  if (
    features.emotional_signal_source === 'quiz_feedback' &&
    features.emotional_score !== null &&
    features.emotional_score <= 40
  ) {
    const focus =
      categoryMastery?.length > 0
        ? [...categoryMastery].sort((a, b) => a.averagePercent - b.averagePercent)[0]
        : null;

    return {
      focusCategory: focus?.category ?? 'math',
      focusLabel: focus?.label ?? CATEGORY_LABELS.math,
      strategy: 'emotional_support',
      reason:
        'Student reported difficulty or frustration during a recent quiz — additional practice is recommended before increasing difficulty.',
    };
  }

  if (!categoryMastery || categoryMastery.length === 0) {
    return {
      focusCategory: 'math',
      focusLabel: CATEGORY_LABELS.math,
      strategy: 'onboarding',
      reason: 'Start with foundational math quizzes to establish a learning baseline.',
    };
  }

  const sorted = [...categoryMastery].sort(
    (a, b) => a.averagePercent - b.averagePercent,
  );
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  if (masteryScore >= 80 && trendDirection === 'improving') {
    return {
      focusCategory: strongest.category,
      focusLabel: strongest.label,
      strategy: 'advancement',
      reason: `Strong mastery (${Math.round(masteryScore)}%) with improving trend — advance in ${strongest.label}.`,
    };
  }

  if (weakest.averagePercent < 55 || features.average_score < 50) {
    return {
      focusCategory: weakest.category,
      focusLabel: weakest.label,
      strategy: 'remediation',
      reason: `${weakest.label} needs focused practice (${Math.round(weakest.averagePercent)}% average).`,
    };
  }

  if (trendDirection === 'declining') {
    return {
      focusCategory: weakest.category,
      focusLabel: weakest.label,
      strategy: 'stabilize',
      reason: 'Recent scores are declining — reinforce fundamentals before advancing.',
    };
  }

  return {
    focusCategory: weakest.category,
    focusLabel: weakest.label,
    strategy: 'balanced_growth',
    reason: `Continue balanced practice; next focus: ${weakest.label}.`,
  };
}

/**
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 * @param {number | null} [emotionalScore]
 * @param {{
 *   recommendation: 'Easy' | 'Medium' | 'Hard',
 *   confidence: number,
 *   source?: string,
 * } | null} [mlPrediction]
 */
export function buildAdaptiveProfileFromAttempts(
  attempts,
  emotionalInput = null,
  mlPrediction = null,
) {
  const features = buildAdaptiveFeatures(attempts, emotionalInput);
  return buildAdaptiveProfile(features, mlPrediction);
}

/**
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 * @param {string} categoryId
 */
function filterAttemptsByCategory(attempts, categoryId) {
  return attempts.filter((attempt) => {
    const { category } = resolveQuizSubject(attempt.quiz ?? {});
    const key = normalizeLearningCategory(category) ?? 'math';
    return key === categoryId;
  });
}

/**
 * Per-category adaptive features (global emotional signal; category-scoped attempts).
 *
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 * @param {string} categoryId
 * @param {import('../emotion-feedback/services/emotionalSignal.service.js').EmotionalSignal | number | null} [emotionalInput]
 */
export function buildCategoryAdaptiveFeatures(attempts, categoryId, emotionalInput = null) {
  const categoryAttempts = filterAttemptsByCategory(attempts, categoryId);
  const features = buildAdaptiveFeatures(categoryAttempts, emotionalInput);
  const completed = categoryAttempts.filter((row) => row.status === 'completed');

  return {
    ...features,
    category: categoryId,
    attempt_count: completed.length,
    total_attempts: categoryAttempts.length,
    category_mastery_level:
      completed.length > 0 ? Math.round(features.average_score * 100) / 100 : null,
  };
}

/**
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 * @param {string} categoryId
 * @param {import('../emotion-feedback/services/emotionalSignal.service.js').EmotionalSignal | number | null} [emotionalInput]
 */
export function buildCategoryAdaptiveProfile(attempts, categoryId, emotionalInput = null) {
  const categoryAttempts = filterAttemptsByCategory(attempts, categoryId);
  const features = buildCategoryAdaptiveFeatures(attempts, categoryId, emotionalInput);
  const completed = categoryAttempts.filter((row) => row.status === 'completed');
  const hasData = completed.length > 0;

  if (!hasData) {
    return {
      category: categoryId,
      averageScore: null,
      completionRate: 0,
      attemptCount: 0,
      totalAttempts: categoryAttempts.length,
      performanceTrend: null,
      trendDirection: /** @type {TrendDirection} */ ('insufficient_data'),
      masteryLevel: null,
      adaptiveScore: null,
      recommendedDifficulty: null,
      recommendation: null,
      confidence: 0,
      features,
    };
  }

  const adaptiveScore = computeAdaptiveScore(features);
  // Difficulty tier follows category average (see ADAPTIVE_DIFFICULTY_THRESHOLDS);
  // adaptiveScore remains the richer multi-signal profile metric.
  const recommendedDifficulty = resolveDifficultyFromAdaptiveScore(features.average_score);
  const recommendation = difficultyToRecommendationLabel(recommendedDifficulty);

  return {
    category: categoryId,
    averageScore: features.average_score,
    completionRate: features.completion_rate,
    attemptCount: completed.length,
    totalAttempts: categoryAttempts.length,
    performanceTrend: features.performance_trend,
    trendDirection: features.trendDirection,
    masteryLevel: features.category_mastery_level,
    adaptiveScore,
    recommendedDifficulty,
    recommendation,
    confidence: adaptiveConfidence(adaptiveScore, recommendation),
    features,
  };
}

/**
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 * @param {import('../emotion-feedback/services/emotionalSignal.service.js').EmotionalSignal | number | null} [emotionalInput]
 */
export function buildAllCategoryAdaptiveProfiles(attempts, emotionalInput = null) {
  return FROZEN_LEARNING_CATEGORIES.map((categoryId) =>
    buildCategoryAdaptiveProfile(attempts, categoryId, emotionalInput),
  );
}
