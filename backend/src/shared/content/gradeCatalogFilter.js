import { GRADE_LEVEL_ORDER, parseGradeLevel } from './taxonomy.js';

/** @typedef {import('@prisma/client').GradeLevel} GradeLevel */

/**
 * Exact grade match only — same band as the child (no review or higher grades).
 * @param {GradeLevel | string | null | undefined} childGradeLevel
 * @returns {GradeLevel[]}
 */
export function getAllowedCatalogGrades(childGradeLevel) {
  const resolved =
    typeof childGradeLevel === 'string' && GRADE_LEVEL_ORDER.includes(childGradeLevel)
      ? /** @type {GradeLevel} */ (childGradeLevel)
      : parseGradeLevel(childGradeLevel);

  return resolved ? [resolved] : [];
}

/**
 * @param {GradeLevel | string | null | undefined} quizGradeLevel
 * @param {GradeLevel | string | null | undefined} childGradeLevel
 */
export function isQuizGradeAllowedForChild(quizGradeLevel, childGradeLevel) {
  if (!quizGradeLevel) {
    return false;
  }
  const childGrade = getAllowedCatalogGrades(childGradeLevel)[0];
  if (!childGrade) {
    return false;
  }
  const quizGrade =
    typeof quizGradeLevel === 'string' && GRADE_LEVEL_ORDER.includes(quizGradeLevel)
      ? /** @type {GradeLevel} */ (quizGradeLevel)
      : parseGradeLevel(quizGradeLevel);
  return quizGrade === childGrade;
}

/**
 * @template {{ gradeLevel: GradeLevel }} T
 * @param {T[]} quizzes
 * @param {GradeLevel | string | null | undefined} childGradeLevel
 * @returns {T[]}
 */
export function filterQuizzesForChildGrade(quizzes, childGradeLevel) {
  const childGrade = getAllowedCatalogGrades(childGradeLevel)[0];
  if (!childGrade) {
    return [];
  }
  return quizzes.filter((quiz) => quiz.gradeLevel === childGrade);
}

/**
 * @param {{ gradeLevelEnum?: GradeLevel | null, gradeLevel?: string | null }} child
 * @returns {GradeLevel | null}
 */
export function resolveChildGradeEnum(child) {
  if (!child) return null;
  if (child.gradeLevelEnum) {
    return child.gradeLevelEnum;
  }
  return parseGradeLevel(child.gradeLevel);
}

/**
 * Load canonical grade enum for a child id (never use display labels for filtering).
 * @param {import('../../shared/ports/childQuery.port.js').ChildQueryPort | null | undefined} childQueryPort
 * @param {number} childId
 * @returns {Promise<GradeLevel | null>}
 */
export async function loadChildGradeEnumForId(childQueryPort, childId) {
  if (!childQueryPort || !Number.isInteger(childId) || childId <= 0) {
    return null;
  }
  const child = await childQueryPort.findById(childId);
  return resolveChildGradeEnum(child);
}

/**
 * Drop any quiz/recommendation rows that do not match the child's grade (safety net).
 * @template {{ gradeLevel?: GradeLevel | string | null }} T
 * @param {T[]} items
 * @param {GradeLevel | string | null | undefined} childGradeLevel
 * @returns {T[]}
 */
export function assertItemsMatchChildGrade(items, childGradeLevel) {
  const childGrade = getAllowedCatalogGrades(childGradeLevel)[0];
  if (!childGrade) {
    return [];
  }
  return items.filter((item) => {
    const quizGrade =
      typeof item.gradeLevel === 'string' && GRADE_LEVEL_ORDER.includes(item.gradeLevel)
        ? item.gradeLevel
        : parseGradeLevel(item.gradeLevel);
    return quizGrade === childGrade;
  });
}
