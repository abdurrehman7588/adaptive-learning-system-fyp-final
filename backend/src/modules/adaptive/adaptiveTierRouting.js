import {
  FROZEN_CATEGORIES,
  isTierPilotGrade,
} from '../../../prisma/quiz/catalog/utils.js';
import { normalizeLearningCategory } from '../../shared/content/taxonomy.js';
import { resolveCategoryRecommendedDifficulty } from './adaptiveRules.js';

export { FROZEN_CATEGORIES as GRADE_2_TIER_PILOT_CATEGORIES, isTierPilotGrade };

const DIFFICULTY_ORDER = ['easy', 'medium', 'hard'];

/**
 * @param {import('@prisma/client').GradeLevel | string | null | undefined} gradeLevel
 * @param {string} categoryKey
 */
export function isGrade2TierPilotCell(gradeLevel, categoryKey) {
  return isTierPilotCell(gradeLevel, categoryKey);
}

/**
 * @param {import('@prisma/client').GradeLevel | string | null | undefined} gradeLevel
 * @param {string} categoryKey
 */
export function isTierPilotCell(gradeLevel, categoryKey) {
  return (
    isTierPilotGrade(gradeLevel) &&
    FROZEN_CATEGORIES.includes(categoryKey)
  );
}

/**
 * Pick closest tier when exact match missing (pilot fallback only).
 * @param {import('@prisma/client').DifficultyLevel} target
 * @param {import('@prisma/client').Quiz[]} cellQuizzes
 */
function pickWithFallback(target, cellQuizzes) {
  const available = new Set(cellQuizzes.map((q) => q.difficultyLevel));
  if (available.has(target)) {
    return {
      quiz: cellQuizzes.find((q) => q.difficultyLevel === target),
      tierMatched: true,
      fallbackTier: null,
    };
  }

  const targetIdx = DIFFICULTY_ORDER.indexOf(target);
  for (let offset = 1; offset < DIFFICULTY_ORDER.length; offset += 1) {
    const easier = DIFFICULTY_ORDER[targetIdx - offset];
    if (easier && available.has(easier)) {
      return {
        quiz: cellQuizzes.find((q) => q.difficultyLevel === easier),
        tierMatched: false,
        fallbackTier: easier,
      };
    }
    const harder = DIFFICULTY_ORDER[targetIdx + offset];
    if (harder && available.has(harder)) {
      return {
        quiz: cellQuizzes.find((q) => q.difficultyLevel === harder),
        tierMatched: false,
        fallbackTier: harder,
      };
    }
  }

  return {
    quiz: cellQuizzes[0] ?? null,
    tierMatched: false,
    fallbackTier: cellQuizzes[0]?.difficultyLevel ?? null,
  };
}

/**
 * Resolve per-category difficulty for tier routing (never the global ML tier).
 *
 * @param {{
 *   recommendedDifficulty?: import('@prisma/client').DifficultyLevel | null,
 *   status?: string,
 *   averagePercent?: number | null,
 *   attemptCount?: number,
 * }} categoryRow
 */
export function resolveTierRoutingDifficulty(categoryRow) {
  return resolveCategoryRecommendedDifficulty(categoryRow);
}

/**
 * @param {import('@prisma/client').Quiz[]} quizzes Grade-filtered catalog
 * @param {string} categoryKey Normalized learning category
 * @param {import('@prisma/client').DifficultyLevel} recommendedDifficulty Category-specific tier
 * @param {import('@prisma/client').GradeLevel | string | null | undefined} gradeLevel
 */
export function selectQuizForAdaptiveTier(
  quizzes,
  categoryKey,
  recommendedDifficulty,
  gradeLevel,
) {
  const cellQuizzes = quizzes.filter((quiz) => {
    const key = normalizeLearningCategory(quiz.category) ?? '';
    return key === categoryKey && quiz.gradeLevel === gradeLevel;
  });

  if (cellQuizzes.length === 0) {
    return { quiz: null, tierMatched: false, fallbackTier: null };
  }

  if (!isTierPilotCell(gradeLevel, categoryKey)) {
    return {
      quiz: cellQuizzes[0],
      tierMatched: cellQuizzes[0].difficultyLevel === recommendedDifficulty,
      fallbackTier:
        cellQuizzes[0].difficultyLevel === recommendedDifficulty
          ? null
          : cellQuizzes[0].difficultyLevel,
    };
  }

  const exact = cellQuizzes.find((q) => q.difficultyLevel === recommendedDifficulty);
  if (exact) {
    return { quiz: exact, tierMatched: true, fallbackTier: null };
  }

  return pickWithFallback(recommendedDifficulty, cellQuizzes);
}

/**
 * Categories to emit as recommendations (one row per category for tier pilot grades).
 * @param {import('@prisma/client').Quiz[]} quizzes
 * @param {import('@prisma/client').GradeLevel | string | null | undefined} gradeLevel
 */
export function listRecommendationCategories(quizzes, gradeLevel) {
  const keys = new Set();
  for (const quiz of quizzes) {
    if (quiz.gradeLevel !== gradeLevel) continue;
    const key = normalizeLearningCategory(quiz.category);
    if (key) keys.add(key);
  }
  return [...keys];
}
