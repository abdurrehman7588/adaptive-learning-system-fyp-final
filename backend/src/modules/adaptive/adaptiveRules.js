import {
  adaptiveScoreRecommendationLevel,
  resolveAdaptiveActionFromProfile,
  priorityFromAdaptiveScore,
} from './adaptiveScore.service.js';

/** @typedef {import('@prisma/client').GradeLevel} GradeLevel */
/** @typedef {import('@prisma/client').DifficultyLevel} DifficultyLevel */
/** @typedef {import('@prisma/client').LearningCategory} LearningCategory */

/** Grades that use quiz-wise adaptive rules (Pre-K – Grade 3). */
export const ADAPTIVE_GRADE_LEVELS = [
  'pre_k',
  'kindergarten',
  'grade_1',
  'grade_2',
  'grade_3',
];

/** @type {LearningCategory[]} */
export const FROZEN_LEARNING_CATEGORIES = [
  'math',
  'science',
  'pattern_recognition',
  'memory',
  'problem_solving',
  'critical_thinking',
];

export const NEEDS_PRACTICE_MAX = 60;
export const MASTERY_MIN = 80;

/** Legacy ML training thresholds (generate_dataset.py) — used only for category status bands. */
export const ML_EASY_MAX = 40;
export const ML_HARD_MIN = 75;

/** @typedef {'needs_practice' | 'progressing' | 'mastery' | 'unattempted'} CategoryStatus */
/** @typedef {'retry' | 'practice' | 'challenge' | 'explore'} AdaptiveAction */

/**
 * @param {GradeLevel | null | undefined} gradeLevel
 */
export function isAdaptiveGrade(gradeLevel) {
  if (!gradeLevel) return false;
  return ADAPTIVE_GRADE_LEVELS.includes(gradeLevel);
}

/**
 * @param {number | null} averagePercent
 * @param {number} attemptCount
 * @returns {CategoryStatus}
 */
export function resolveCategoryStatus(averagePercent, attemptCount) {
  if (attemptCount === 0) return 'unattempted';
  const avg = averagePercent ?? 0;
  if (avg < NEEDS_PRACTICE_MAX) return 'needs_practice';
  if (avg < MASTERY_MIN) return 'progressing';
  return 'mastery';
}

/**
 * @param {CategoryStatus} status
 * @returns {DifficultyLevel}
 */
export function recommendedDifficultyForStatus(status) {
  if (status === 'needs_practice') return 'easy';
  if (status === 'mastery') return 'hard';
  return 'medium';
}

/**
 * Rule-based fallback when the Random Forest model is unavailable.
 * Uses the weighted Adaptive Score (not average_score alone).
 *
 * @param {{
 *   average_score: number,
 *   quiz_attempts?: number,
 *   completion_rate?: number,
 *   emotional_score?: number | null,
 *   emotional_assessed?: boolean,
 *   performance_trend?: number,
 *   learning_speed?: number,
 *   mastery_score?: number,
 * }} features
 * @returns {{
 *   recommendation: 'Easy' | 'Medium' | 'Hard',
 *   confidence: number,
 *   adaptiveScore?: number,
 *   learnerLevel?: string,
 * }}
 */
export function ruleBasedRecommendationLevel(features) {
  const enriched = {
    average_score: Number(features.average_score ?? 0),
    completion_rate: Number(features.completion_rate ?? 0),
    emotional_score: features.emotional_score ?? null,
    emotional_assessed: features.emotional_assessed ?? false,
    performance_trend: Number(features.performance_trend ?? 50),
    learning_speed: Number(features.learning_speed ?? 50),
    mastery_score: Number(features.mastery_score ?? features.average_score ?? 0),
    quiz_attempts: Number(features.quiz_attempts ?? 1),
  };

  const result = adaptiveScoreRecommendationLevel(enriched);
  return {
    recommendation: result.recommendation,
    confidence: result.confidence,
    adaptiveScore: result.adaptiveScore,
    learnerLevel: result.learnerLevel,
  };
}

/**
 * @param {number} averageScore
 * @param {'Easy' | 'Medium' | 'Hard'} recommendation
 */
function ruleBasedConfidence(averageScore, recommendation) {
  if (recommendation === 'Easy') {
    return Math.min(0.85, Math.round((0.55 + (ML_EASY_MAX - averageScore) / 80) * 100) / 100);
  }
  if (recommendation === 'Hard') {
    return Math.min(0.85, Math.round((0.55 + (averageScore - ML_HARD_MIN) / 50) * 100) / 100);
  }
  const mid = (ML_EASY_MAX + ML_HARD_MIN) / 2;
  const dist = Math.abs(averageScore - mid);
  return Math.min(0.85, Math.round((0.55 + dist / 70) * 100) / 100);
}

/**
 * @param {'Easy' | 'Medium' | 'Hard' | string} label
 * @returns {DifficultyLevel}
 */
export function recommendationLabelToDifficulty(label) {
  const map = { Easy: 'easy', Medium: 'medium', Hard: 'hard' };
  return map[label] ?? 'medium';
}

/**
 * @param {CategoryStatus} status
 * @param {number} quizAttemptCount
 * @returns {'high' | 'medium' | 'low'}
 */
export function priorityForCategory(status, quizAttemptCount = 0) {
  if (status === 'needs_practice') return 'high';
  if (status === 'unattempted' || quizAttemptCount === 0) return 'medium';
  if (status === 'mastery') return 'low';
  return 'medium';
}

/**
 * @param {{
 *   lastScorePercent: number | null,
 *   categoryAveragePercent: number | null,
 *   categoryAttemptCount: number,
 *   adaptiveScore?: number,
 *   learnerLevel?: import('./adaptiveScore.service.js').LearnerLevel,
 *   trendDirection?: import('./adaptiveScore.service.js').TrendDirection,
 *   categoryMasteryScore?: number | null,
 * }} input
 * @returns {AdaptiveAction}
 */
export function resolveAdaptiveAction(input) {
  if (input.adaptiveScore !== undefined && input.learnerLevel) {
    return resolveAdaptiveActionFromProfile({
      adaptiveScore: input.adaptiveScore,
      learnerLevel: input.learnerLevel,
      trendDirection: input.trendDirection ?? 'insufficient_data',
      lastScorePercent: input.lastScorePercent,
      categoryAveragePercent: input.categoryAveragePercent,
      categoryAttemptCount: input.categoryAttemptCount,
      categoryMasteryScore: input.categoryMasteryScore ?? null,
    });
  }

  const { lastScorePercent, categoryAveragePercent, categoryAttemptCount } = input;

  if (lastScorePercent !== null && lastScorePercent < NEEDS_PRACTICE_MAX) {
    return 'retry';
  }
  if (
    categoryAttemptCount > 0 &&
    categoryAveragePercent !== null &&
    categoryAveragePercent < NEEDS_PRACTICE_MAX
  ) {
    return 'practice';
  }
  if (
    categoryAttemptCount > 0 &&
    categoryAveragePercent !== null &&
    categoryAveragePercent >= MASTERY_MIN
  ) {
    return 'challenge';
  }
  return 'explore';
}

/**
 * @param {CategoryStatus} status
 * @param {number} quizAttemptCount
 * @param {number} [adaptiveScore]
 */
export function priorityForCategoryAdaptive(status, quizAttemptCount = 0, adaptiveScore = 50) {
  return priorityFromAdaptiveScore(status, adaptiveScore, quizAttemptCount);
}
