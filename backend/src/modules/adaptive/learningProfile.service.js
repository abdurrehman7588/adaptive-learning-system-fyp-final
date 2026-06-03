import {
  CATEGORY_LABELS,
  normalizeLearningCategory,
  resolveQuizSubject,
} from '../../shared/content/taxonomy.js';
import {
  FROZEN_LEARNING_CATEGORIES,
  isAdaptiveGrade,
  recommendedDifficultyForStatus,
  resolveCategoryStatus,
} from './adaptiveRules.js';

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
 * @param {import('@prisma/client').GradeLevel | null | undefined} childGradeLevel
 */
export function buildLearningProfile(attempts, childGradeLevel) {
  const adaptiveEnabled = isAdaptiveGrade(childGradeLevel);
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

  const categories = FROZEN_LEARNING_CATEGORIES.map((categoryId) => {
    const stats = byCategory.get(categoryId);
    const attemptCount = stats?.count ?? 0;
    const averagePercent =
      attemptCount > 0
        ? Math.round((stats.total / attemptCount) * 100) / 100
        : null;
    const status = resolveCategoryStatus(averagePercent, attemptCount);
    return {
      category: categoryId,
      label: CATEGORY_LABELS[categoryId] ?? categoryId,
      averagePercent,
      attemptCount,
      status,
      recommendedDifficulty: recommendedDifficultyForStatus(status),
    };
  });

  const attempted = categories.filter((row) => row.attemptCount > 0);
  const weakest =
    attempted.length > 0
      ? [...attempted].sort((a, b) => (a.averagePercent ?? 0) - (b.averagePercent ?? 0))[0]
      : null;
  const strongestCandidate =
    attempted.length > 1
      ? [...attempted].sort((a, b) => (b.averagePercent ?? 0) - (a.averagePercent ?? 0))[0]
      : null;
  const strongest =
    strongestCandidate &&
    weakest &&
    strongestCandidate.category !== weakest.category
      ? strongestCandidate
      : attempted.length > 1
        ? strongestCandidate
        : null;

  return {
    adaptiveEnabled,
    categories,
    weakest: weakest
      ? {
          category: weakest.category,
          label: weakest.label,
          averagePercent: weakest.averagePercent,
          status: weakest.status,
        }
      : null,
    strongest: strongest
      ? {
          category: strongest.category,
          label: strongest.label,
          averagePercent: strongest.averagePercent,
          status: strongest.status,
        }
      : null,
  };
}
