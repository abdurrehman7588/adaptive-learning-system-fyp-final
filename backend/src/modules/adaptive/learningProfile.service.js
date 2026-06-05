import {
  CATEGORY_LABELS,
  normalizeLearningCategory,
  resolveQuizSubject,
} from '../../shared/content/taxonomy.js';
import { buildRecommendationReasoning } from '../ai/services/recommendationReasoning.service.js';
import {
  FROZEN_LEARNING_CATEGORIES,
  isAdaptiveGrade,
  recommendationLabelToDifficulty,
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
 * @param {{
 *   recommendation: 'Easy' | 'Medium' | 'Hard',
 *   confidence: number,
 *   source?: string,
 *   features?: {
 *     average_score: number,
 *     quiz_attempts: number,
 *     completion_rate: number,
 *     emotional_score: number,
 *   },
 * } | null} [tierPrediction]
 */
export function buildLearningProfile(attempts, childGradeLevel, tierPrediction = null) {
  const adaptiveEnabled = isAdaptiveGrade(childGradeLevel);
  const completed = attempts.filter((row) => row.status === 'completed');
  const globalDifficulty = tierPrediction
    ? recommendationLabelToDifficulty(tierPrediction.recommendation)
    : null;

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
      recommendedDifficulty:
        globalDifficulty ?? recommendedDifficultyForStatus(status),
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

  const adaptiveProfile = tierPrediction?.adaptiveProfile ?? null;

  return {
    adaptiveEnabled,
    adaptiveProfile: adaptiveProfile
      ? {
          adaptiveScore: adaptiveProfile.adaptiveScore,
          learnerLevel: adaptiveProfile.learnerLevel,
          recommendedDifficulty: adaptiveProfile.recommendedDifficulty,
          nextLearningPath: adaptiveProfile.nextLearningPath,
          blend: adaptiveProfile.blend ?? null,
        }
      : null,
    tierRecommendation: tierPrediction
      ? {
          recommendation: tierPrediction.recommendation,
          confidence: tierPrediction.confidence,
          source: tierPrediction.source ?? 'model',
          features: tierPrediction.features ?? null,
          reasoningSummary: buildRecommendationReasoning({
            ...tierPrediction,
            adaptiveProfile,
          }),
          adaptiveScore: adaptiveProfile?.adaptiveScore ?? null,
          learnerLevel: adaptiveProfile?.learnerLevel ?? null,
          nextLearningPath: adaptiveProfile?.nextLearningPath ?? null,
          blend: adaptiveProfile?.blend ?? null,
        }
      : null,
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
