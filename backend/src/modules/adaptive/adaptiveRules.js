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
 * }} input
 * @returns {AdaptiveAction}
 */
export function resolveAdaptiveAction(input) {
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
