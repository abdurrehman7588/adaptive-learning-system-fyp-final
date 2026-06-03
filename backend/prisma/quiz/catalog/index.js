import {
  ALL_GRADE_LEVELS,
  FROZEN_CATEGORIES,
  GRADE_2_QUIZZES_PER_CATEGORY,
  isTierPilotGrade,
  quizzesPerCategoryForGrade,
  TIER_PILOT_GRADE_LEVELS,
} from './utils.js';
import { PRE_K_CATALOG } from './grades/pre_k.js';
import { KINDERGARTEN_CATALOG } from './grades/kindergarten.js';
import { GRADE_1_CATALOG } from './grades/grade_1.js';
import { GRADE_2_CATALOG } from './grades/grade_2.js';
import { GRADE_3_CATALOG } from './grades/grade_3.js';
import { GRADE_4_CATALOG } from './grades/grade_4.js';
import { GRADE_5_CATALOG } from './grades/grade_5.js';
import { GRADE_6_CATALOG } from './grades/grade_6.js';

/** @type {import('../catalogTypes.js').QuizCatalogEntry[]} */
export const FULL_GRADE_CATALOG = [
  ...PRE_K_CATALOG,
  ...KINDERGARTEN_CATALOG,
  ...GRADE_1_CATALOG,
  ...GRADE_2_CATALOG,
  ...GRADE_3_CATALOG,
  ...GRADE_4_CATALOG,
  ...GRADE_5_CATALOG,
  ...GRADE_6_CATALOG,
];

const MIN_QUESTIONS = 5;
const MAX_QUESTIONS = 10;
const QUIZZES_PER_GRADE = FROZEN_CATEGORIES.length;

/**
 * Validate catalog invariants before seeding.
 * @param {import('../catalogTypes.js').QuizCatalogEntry[]} catalog
 */
export function validateCatalog(catalog) {
  const errors = [];
  const slugs = new Set();

  for (const entry of catalog) {
    if (slugs.has(entry.slug)) {
      errors.push(`Duplicate slug: ${entry.slug}`);
    }
    slugs.add(entry.slug);

    if (!FROZEN_CATEGORIES.includes(entry.category)) {
      errors.push(`${entry.slug}: invalid category ${entry.category}`);
    }

    const qCount = entry.questions?.length ?? 0;
    if (qCount < MIN_QUESTIONS || qCount > MAX_QUESTIONS) {
      errors.push(`${entry.slug}: expected ${MIN_QUESTIONS}-${MAX_QUESTIONS} questions, got ${qCount}`);
    }
  }

  const tierPilotExtras =
    TIER_PILOT_GRADE_LEVELS.length *
    FROZEN_CATEGORIES.length *
    (GRADE_2_QUIZZES_PER_CATEGORY - 1);
  const expectedTotal = ALL_GRADE_LEVELS.length * QUIZZES_PER_GRADE + tierPilotExtras;

  for (const grade of ALL_GRADE_LEVELS) {
    const gradeQuizzes = catalog.filter((q) => q.gradeLevel === grade);
    const perCategory = quizzesPerCategoryForGrade(grade);
    const expectedGradeCount = FROZEN_CATEGORIES.length * perCategory;

    if (gradeQuizzes.length !== expectedGradeCount) {
      errors.push(
        `${grade}: expected ${expectedGradeCount} quizzes, got ${gradeQuizzes.length}`,
      );
    }

    for (const category of FROZEN_CATEGORIES) {
      const match = gradeQuizzes.filter((q) => q.category === category);
      const expectedInCategory = perCategory;

      if (match.length !== expectedInCategory) {
        errors.push(
          `${grade}/${category}: expected ${expectedInCategory} quiz(zes), got ${match.length}`,
        );
      }

      if (isTierPilotGrade(grade)) {
        for (const tier of ['easy', 'medium', 'hard']) {
          const tierCount = match.filter((q) => q.difficultyLevel === tier).length;
          if (tierCount !== 1) {
            errors.push(
              `${grade}/${category}/${tier}: expected 1 quiz, got ${tierCount}`,
            );
          }
        }
      }
    }
  }

  if (catalog.length !== expectedTotal) {
    errors.push(`Expected ${expectedTotal} quizzes, got ${catalog.length}`);
  }

  if (errors.length) {
    throw new Error(`Catalog validation failed:\n${errors.join('\n')}`);
  }
}

validateCatalog(FULL_GRADE_CATALOG);
