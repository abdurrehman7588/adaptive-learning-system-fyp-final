import {
  difficultyOrdinal,
  difficultyToDisplayLabel,
  gradeLevelToDisplayLabel,
  normalizeLearningCategory,
  resolveQuizSubject,
} from '../../shared/content/taxonomy.js';
import {
  priorityForCategory,
  priorityForCategoryAdaptive,
  recommendationLabelToDifficulty,
  recommendedDifficultyForStatus,
  resolveAdaptiveAction,
} from './adaptiveRules.js';
import {
  isTierPilotCell,
  listRecommendationCategories,
  selectQuizForAdaptiveTier,
} from './adaptiveTierRouting.js';
import { isTierPilotGrade } from '../../../prisma/quiz/catalog/utils.js';

/**
 * @param {import('@prisma/client').Quiz} quiz
 * @param {Map<number, import('@prisma/client').QuizAttempt[]>} attemptsByQuiz
 */
function latestScorePercent(quiz, attemptsByQuiz) {
  const quizAttempts = attemptsByQuiz.get(quiz.id) ?? [];
  if (quizAttempts.length === 0) return { lastScorePercent: null, attemptCount: 0 };

  const latest = quizAttempts[0];
  let lastScorePercent = null;
  if (latest.percentage !== null && latest.percentage !== undefined) {
    lastScorePercent = Number(latest.percentage);
  } else if (latest.totalPoints > 0) {
    lastScorePercent = Math.round(
      (Number(latest.score) / Number(latest.totalPoints)) * 10000,
    ) / 100;
  }
  return { lastScorePercent, attemptCount: quizAttempts.length };
}

/**
 * @param {{
 *   quiz: import('@prisma/client').Quiz,
 *   categoryKey: string,
 *   label: string,
 *   categoryRow: ReturnType<import('./learningProfile.service.js').buildLearningProfile>['categories'][0] | undefined,
 *   attemptsByQuiz: Map<number, import('@prisma/client').QuizAttempt[]>,
 *   recommendedDifficulty: import('@prisma/client').DifficultyLevel,
 *   tierMatched: boolean,
 *   fallbackTier: import('@prisma/client').DifficultyLevel | null,
 *   adaptiveContext?: {
 *     adaptiveScore: number,
 *     learnerLevel: string,
 *     trendDirection: string,
 *     categoryMastery?: Array<{ category: string, averagePercent: number }>,
 *   } | null,
 * }} ctx
 */
function buildRecommendationRow(ctx) {
  const {
    quiz,
    categoryKey,
    label,
    categoryRow,
    attemptsByQuiz,
    recommendedDifficulty,
    tierMatched,
    fallbackTier,
    adaptiveContext = null,
  } = ctx;

  const categoryStatus = categoryRow?.status ?? 'unattempted';
  const categoryAverage = categoryRow?.averagePercent ?? null;
  const categoryAttemptCount = categoryRow?.attemptCount ?? 0;
  const { subject, label: subjectLabel } = resolveQuizSubject(quiz);
  const { lastScorePercent, attemptCount } = latestScorePercent(quiz, attemptsByQuiz);

  const categoryMasteryScore =
    adaptiveContext?.categoryMastery?.find((row) => row.category === categoryKey)
      ?.averagePercent ?? categoryAverage;

  const adaptiveAction = resolveAdaptiveAction({
    lastScorePercent,
    categoryAveragePercent: categoryAverage,
    categoryAttemptCount,
    adaptiveScore: adaptiveContext?.adaptiveScore,
    learnerLevel: adaptiveContext?.learnerLevel,
    trendDirection: adaptiveContext?.trendDirection,
    categoryMasteryScore,
  });

  let priority = adaptiveContext
    ? priorityForCategoryAdaptive(categoryStatus, attemptCount, adaptiveContext.adaptiveScore)
    : priorityForCategory(categoryStatus, attemptCount);
  let matchType = 'explore';
  let reason = `Explore ${label} to build your learning path.`;

  if (adaptiveAction === 'retry') {
    matchType = 'retry';
    priority = 'high';
    reason = `Last score was ${Math.round(lastScorePercent ?? 0)}% — retry to improve.`;
  } else if (adaptiveAction === 'practice') {
    matchType = 'practice';
    priority = 'high';
    reason = `${label} needs practice (${Math.round(categoryAverage ?? 0)}% average).`;
  } else if (adaptiveAction === 'challenge') {
    matchType = 'challenge';
    priority = 'low';
    reason = `${label} mastery at ${Math.round(categoryAverage ?? 0)}% — take a challenge quiz.`;
  } else if (categoryStatus === 'unattempted' || attemptCount === 0) {
    matchType = 'unattempted';
    priority = 'medium';
    reason = `${label} not attempted yet — good next step.`;
  } else if (categoryStatus === 'progressing') {
    matchType = 'explore';
    priority = 'medium';
    reason = `${label} is progressing — keep practicing at medium level.`;
  } else if (categoryStatus === 'mastery') {
    matchType = 'maintain_mastery';
    priority = 'low';
    reason = `Strong ${label} performance — maintain mastery.`;
  }

  if (categoryStatus === 'needs_practice' && adaptiveAction !== 'retry') {
    priority = 'high';
    matchType = 'weak_subject';
    reason = `${label} is a focus area — practice recommended.`;
  }

  if (isTierPilotCell(quiz.gradeLevel, categoryKey)) {
    const tierLabel = difficultyToDisplayLabel(recommendedDifficulty);
    if (tierMatched) {
      reason = `${reason} Recommended ${tierLabel} quiz for this category.`;
    } else if (fallbackTier) {
      reason = `${reason} (${tierLabel} tier unavailable — using ${difficultyToDisplayLabel(fallbackTier)}).`;
    }
  }

  return {
    quizId: quiz.id,
    title: quiz.title,
    description: quiz.description,
    subject,
    subjectLabel,
    category: categoryKey,
    categoryLabel: categoryRow?.label ?? label,
    categoryStatus,
    gradeLevel: quiz.gradeLevel,
    gradeLevelLabel: gradeLevelToDisplayLabel(quiz.gradeLevel),
    difficultyLevel: quiz.difficultyLevel,
    timeLimitMinutes: quiz.timeLimitMinutes,
    questionCount: quiz._count?.questions ?? 0,
    suggestedDifficulty: difficultyOrdinal(recommendedDifficulty),
    recommendedDifficulty,
    recommendedDifficultyLabel: difficultyToDisplayLabel(recommendedDifficulty),
    avgDifficulty: difficultyOrdinal(quiz.difficultyLevel ?? 'medium'),
    tierMatched,
    fallbackTier,
    priority,
    matchType,
    adaptiveAction,
    targetConcepts: [],
    reason,
    lastScorePercent,
    attemptCount,
  };
}

/**
 * @param {ReturnType<import('./learningProfile.service.js').buildLearningProfile>} learningProfile
 * @param {import('@prisma/client').Quiz[]} quizzes
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 * @param {{
 *   recommendation: 'Easy' | 'Medium' | 'Hard',
 *   confidence: number,
 *   source?: string,
 *   adaptiveProfile?: {
 *     adaptiveScore: number,
 *     learnerLevel: string,
 *     features?: { trendDirection?: string, categoryMastery?: Array<{ category: string, averagePercent: number }> },
 *   } | null,
 * } | null} [tierPrediction]
 */
function buildTierRoutedRecommendations(
  learningProfile,
  quizzes,
  attempts,
  gradeLevel,
  tierPrediction = null,
) {
  const completed = attempts.filter((row) => row.status === 'completed');
  const attemptsByQuiz = new Map();
  for (const attempt of completed) {
    const list = attemptsByQuiz.get(attempt.quizId) ?? [];
    list.push(attempt);
    attemptsByQuiz.set(attempt.quizId, list);
  }

  const profileByCategory = new Map(
    learningProfile.categories.map((row) => [row.category, row]),
  );

  const categories = listRecommendationCategories(quizzes, gradeLevel);
  const recommendations = [];

  const globalDifficulty = tierPrediction
    ? recommendationLabelToDifficulty(tierPrediction.recommendation)
    : learningProfile.adaptiveProfile?.recommendedDifficulty ?? null;

  const adaptiveContext = tierPrediction?.adaptiveProfile
    ? {
        adaptiveScore: tierPrediction.adaptiveProfile.adaptiveScore,
        learnerLevel: tierPrediction.adaptiveProfile.learnerLevel,
        trendDirection:
          tierPrediction.adaptiveProfile.features?.trendDirection ?? 'insufficient_data',
        categoryMastery: tierPrediction.adaptiveProfile.features?.categoryMastery ?? [],
      }
    : learningProfile.adaptiveProfile
      ? {
          adaptiveScore: learningProfile.adaptiveProfile.adaptiveScore,
          learnerLevel: learningProfile.adaptiveProfile.learnerLevel,
          trendDirection: 'insufficient_data',
          categoryMastery: [],
        }
      : null;

  for (const categoryKey of categories) {
    const categoryRow = profileByCategory.get(categoryKey);
    const categoryStatus = categoryRow?.status ?? 'unattempted';
    const recommendedDifficulty =
      globalDifficulty ?? recommendedDifficultyForStatus(categoryStatus);
    const { quiz, tierMatched, fallbackTier } = selectQuizForAdaptiveTier(
      quizzes,
      categoryKey,
      recommendedDifficulty,
      gradeLevel,
    );

    if (!quiz) continue;

    const { label: resolvedLabel } = resolveQuizSubject(quiz);
    recommendations.push(
      buildRecommendationRow({
        quiz,
        categoryKey,
        label: resolvedLabel,
        categoryRow,
        attemptsByQuiz,
        recommendedDifficulty,
        tierMatched,
        fallbackTier,
        adaptiveContext,
      }),
    );
  }

  return recommendations;
}

/**
 * @param {ReturnType<import('./learningProfile.service.js').buildLearningProfile>} learningProfile
 * @param {import('@prisma/client').Quiz[]} quizzes
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 * @param {{
 *   recommendation: 'Easy' | 'Medium' | 'Hard',
 *   confidence: number,
 *   source?: string,
 *   adaptiveProfile?: object | null,
 * } | null} [tierPrediction]
 */
export function buildAdaptiveRecommendations(
  learningProfile,
  quizzes,
  attempts,
  tierPrediction = null,
) {
  const gradeLevel = quizzes[0]?.gradeLevel ?? null;

  if (isTierPilotGrade(gradeLevel)) {
    const recommendations = buildTierRoutedRecommendations(
      learningProfile,
      quizzes,
      attempts,
      gradeLevel,
      tierPrediction,
    );
    return sortRecommendations(recommendations);
  }

  const completed = attempts.filter((row) => row.status === 'completed');
  const attemptsByQuiz = new Map();

  for (const attempt of completed) {
    const list = attemptsByQuiz.get(attempt.quizId) ?? [];
    list.push(attempt);
    attemptsByQuiz.set(attempt.quizId, list);
  }

  const profileByCategory = new Map(
    learningProfile.categories.map((row) => [row.category, row]),
  );

  const globalDifficulty = tierPrediction
    ? recommendationLabelToDifficulty(tierPrediction.recommendation)
    : learningProfile.adaptiveProfile?.recommendedDifficulty ?? null;

  const adaptiveContext = tierPrediction?.adaptiveProfile
    ? {
        adaptiveScore: tierPrediction.adaptiveProfile.adaptiveScore,
        learnerLevel: tierPrediction.adaptiveProfile.learnerLevel,
        trendDirection:
          tierPrediction.adaptiveProfile.features?.trendDirection ?? 'insufficient_data',
        categoryMastery: tierPrediction.adaptiveProfile.features?.categoryMastery ?? [],
      }
    : learningProfile.adaptiveProfile
      ? {
          adaptiveScore: learningProfile.adaptiveProfile.adaptiveScore,
          learnerLevel: learningProfile.adaptiveProfile.learnerLevel,
          trendDirection: 'insufficient_data',
          categoryMastery: [],
        }
      : null;

  const recommendations = [];

  for (const quiz of quizzes) {
    const { label, category } = resolveQuizSubject(quiz);
    const categoryKey = normalizeLearningCategory(category ?? quiz.category) ?? 'math';
    const categoryRow = profileByCategory.get(categoryKey);
    const categoryStatus = categoryRow?.status ?? 'unattempted';
    const recommendedDifficulty =
      globalDifficulty ??
      categoryRow?.recommendedDifficulty ??
      recommendedDifficultyForStatus(categoryStatus);

    recommendations.push(
      buildRecommendationRow({
        quiz,
        categoryKey,
        label,
        categoryRow,
        attemptsByQuiz,
        recommendedDifficulty,
        tierMatched: quiz.difficultyLevel === recommendedDifficulty,
        fallbackTier:
          quiz.difficultyLevel === recommendedDifficulty ? null : quiz.difficultyLevel,
        adaptiveContext,
      }),
    );
  }

  return sortRecommendations(recommendations);
}

/**
 * @param {ReturnType<typeof buildRecommendationRow>[]} recommendations
 */
function sortRecommendations(recommendations) {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const actionOrder = { retry: 0, practice: 1, explore: 2, challenge: 3 };

  return recommendations.sort((a, b) => {
    const p = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (p !== 0) return p;
    const act =
      (actionOrder[a.adaptiveAction] ?? 9) - (actionOrder[b.adaptiveAction] ?? 9);
    if (act !== 0) return act;
    return a.attemptCount - b.attemptCount;
  });
}

/**
 * @param {ReturnType<import('./learningProfile.service.js').buildLearningProfile>} learningProfile
 * @param {ReturnType<typeof buildAdaptiveRecommendations>} recommendations
 */
export function buildAdaptiveInsights(learningProfile, recommendations) {
  const nextPath = learningProfile.adaptiveProfile?.nextLearningPath ?? null;

  const focusArea = learningProfile.weakest
    ? {
        category: learningProfile.weakest.category,
        label: learningProfile.weakest.label,
        averagePercent: learningProfile.weakest.averagePercent,
        status: learningProfile.weakest.status,
      }
    : null;

  const strongestArea = learningProfile.strongest
    ? {
        category: learningProfile.strongest.category,
        label: learningProfile.strongest.label,
        averagePercent: learningProfile.strongest.averagePercent,
        status: learningProfile.strongest.status,
      }
    : null;

  const pathAligned =
    nextPath &&
    recommendations.find(
      (row) =>
        row.category === nextPath.focusCategory &&
        (row.adaptiveAction === 'practice' || row.adaptiveAction === 'explore'),
    );

  const top =
    pathAligned ??
    recommendations.find((row) => row.priority === 'high') ??
    recommendations.find((row) => row.priority === 'medium') ??
    recommendations[0] ??
    null;

  const whatsNext = top
    ? {
        quizId: top.quizId,
        title: top.title,
        category: top.category,
        label: top.categoryLabel ?? top.subjectLabel,
        reason: top.reason,
        adaptiveAction: top.adaptiveAction,
        priority: top.priority,
        recommendedDifficulty: top.recommendedDifficulty,
      }
    : null;

  return {
    focusArea,
    strongestArea,
    whatsNext,
    suggestedNextActivity: whatsNext,
    weakestCategory: focusArea,
    strongestCategory: strongestArea,
    nextLearningPath: nextPath,
    adaptiveScore: learningProfile.adaptiveProfile?.adaptiveScore ?? null,
    learnerLevel: learningProfile.adaptiveProfile?.learnerLevel ?? null,
  };
}
