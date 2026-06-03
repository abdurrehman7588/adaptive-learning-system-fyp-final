/** @typedef {import('../catalogTypes.js').QuizCatalogEntry} QuizCatalogEntry */
/** @typedef {import('../catalogTypes.js').CatalogQuestionSpec} CatalogQuestionSpec */

/** @type {import('@prisma/client').LearningCategory[]} */
export const FROZEN_CATEGORIES = [
  'math',
  'science',
  'pattern_recognition',
  'memory',
  'problem_solving',
  'critical_thinking',
];

/** @type {import('@prisma/client').GradeLevel[]} */
/** Grade 2 adaptive difficulty pilot — easy / medium / hard per category. */
export const GRADE_2_TIER_PILOT_CATEGORIES = [...FROZEN_CATEGORIES];

/** Published quizzes per tier-pilot category (full tier ladder). */
export const GRADE_2_QUIZZES_PER_CATEGORY = 3;

/** Kindergarten adaptive difficulty pilot — same tier ladder as Grade 2. */
export const KINDERGARTEN_TIER_PILOT_CATEGORIES = [...FROZEN_CATEGORIES];
export const KINDERGARTEN_QUIZZES_PER_CATEGORY = 3;

/** Grades with easy / medium / hard per frozen category. */
export const TIER_PILOT_GRADE_LEVELS = ['kindergarten', 'grade_2'];

/**
 * @param {import('@prisma/client').GradeLevel | string | null | undefined} gradeLevel
 */
export function isTierPilotGrade(gradeLevel) {
  return TIER_PILOT_GRADE_LEVELS.includes(gradeLevel);
}

/**
 * @param {import('@prisma/client').GradeLevel | string | null | undefined} gradeLevel
 */
export function quizzesPerCategoryForGrade(gradeLevel) {
  return isTierPilotGrade(gradeLevel) ? GRADE_2_QUIZZES_PER_CATEGORY : 1;
}

export const ALL_GRADE_LEVELS = [
  'pre_k',
  'kindergarten',
  'grade_1',
  'grade_2',
  'grade_3',
  'grade_4',
  'grade_5',
  'grade_6',
];

/**
 * @param {import('@prisma/client').GradeLevel} gradeLevel
 * @returns {import('@prisma/client').DifficultyLevel}
 */
export function defaultDifficultyForGrade(gradeLevel) {
  if (gradeLevel === 'pre_k' || gradeLevel === 'kindergarten' || gradeLevel === 'grade_1') {
    return 'easy';
  }
  if (gradeLevel === 'grade_2' || gradeLevel === 'grade_3' || gradeLevel === 'grade_4') {
    return 'medium';
  }
  return 'hard';
}

/**
 * @param {{
 *   gradeLevel: import('@prisma/client').GradeLevel,
 *   category: import('@prisma/client').LearningCategory,
 *   title: string,
 *   description: string,
 *   questions: CatalogQuestionSpec[],
 *   difficultyLevel?: import('@prisma/client').DifficultyLevel,
 *   timeLimitMinutes?: number,
 * }} spec
 * @returns {QuizCatalogEntry}
 */
export function buildQuiz({
  gradeLevel,
  category,
  title,
  description,
  questions,
  difficultyLevel,
  timeLimitMinutes,
}) {
  const difficulty = difficultyLevel ?? defaultDifficultyForGrade(gradeLevel);
  const slug = `${gradeLevel}-${category}-${difficulty}`;

  return {
    slug,
    title,
    description,
    category,
    gradeLevel,
    difficultyLevel: difficulty,
    timeLimitMinutes: timeLimitMinutes ?? Math.max(8, Math.min(20, questions.length * 2)),
    questions,
  };
}
