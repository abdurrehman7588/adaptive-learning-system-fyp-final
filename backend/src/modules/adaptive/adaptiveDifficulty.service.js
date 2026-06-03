import { effectiveDifficulty, shiftDifficulty } from '../../shared/content/effectiveDifficulty.js';
import {
  DIFFICULTY_ORDER,
  difficultyOrdinal,
  gradeLevelOrdinal,
} from '../../shared/content/taxonomy.js';

const STRONG_ACCURACY = 80;
const WEAK_ACCURACY = 60;
const MASTERY_ATTEMPTS = 2;

/**
 * Rules-based difficulty suggestion (no ML).
 * @param {{
 *   quizDifficulty: import('@prisma/client').DifficultyLevel,
 *   childGradeLevel?: import('@prisma/client').GradeLevel | null,
 *   quizGradeLevel: import('@prisma/client').GradeLevel,
 *   lastScorePercent: number | null,
 *   attemptCount: number,
 *   overallAveragePercent: number,
 *   recentAccuracyPercent?: number,
 * }} input
 * @returns {{
 *   suggestedDifficulty: import('@prisma/client').DifficultyLevel,
 *   suggestedDifficultyOrdinal: number,
 *   reason: string,
 *   action: 'stay' | 'step_up' | 'step_down' | 'review',
 * }}
 */
export function suggestQuizDifficulty(input) {
  const {
    quizDifficulty,
    childGradeLevel,
    quizGradeLevel,
    lastScorePercent,
    attemptCount,
    overallAveragePercent,
    recentAccuracyPercent = overallAveragePercent,
  } = input;

  let suggested = quizDifficulty;
  let action = 'stay';
  let reason = 'Continue at this difficulty to build consistency.';

  const childGrade = childGradeLevel ? gradeLevelOrdinal(childGradeLevel) : null;
  const quizGrade = gradeLevelOrdinal(quizGradeLevel);
  const gradeGap = childGrade !== null ? quizGrade - childGrade : 0;

  if (gradeGap >= 2) {
    return {
      suggestedDifficulty: 'easy',
      suggestedDifficultyOrdinal: difficultyOrdinal('easy'),
      reason: 'This quiz targets a higher grade band — start with easier practice.',
      action: 'review',
    };
  }

  if (attemptCount === 0) {
    if (overallAveragePercent >= STRONG_ACCURACY && gradeGap <= 0) {
      suggested = shiftDifficulty(quizDifficulty, 1);
      action = 'step_up';
      reason = 'Strong overall performance — try a slightly harder quiz.';
    }
    return {
      suggestedDifficulty: suggested,
      suggestedDifficultyOrdinal: difficultyOrdinal(suggested),
      reason,
      action,
    };
  }

  if (lastScorePercent !== null && lastScorePercent < WEAK_ACCURACY) {
    suggested = shiftDifficulty(quizDifficulty, -1);
    action = 'step_down';
    reason = `Last score was ${Math.round(lastScorePercent)}% — review at an easier level first.`;
  } else if (
    lastScorePercent !== null &&
    lastScorePercent >= STRONG_ACCURACY &&
    attemptCount >= MASTERY_ATTEMPTS &&
    recentAccuracyPercent >= STRONG_ACCURACY
  ) {
    suggested = shiftDifficulty(quizDifficulty, 1);
    action = 'step_up';
    reason = 'Recent mastery — ready for the next difficulty level.';
  } else if (recentAccuracyPercent < WEAK_ACCURACY && attemptCount >= 1) {
    suggested = shiftDifficulty(quizDifficulty, -1);
    action = 'review';
    reason = 'Recent accuracy is low — reinforce fundamentals before advancing.';
  }

  return {
    suggestedDifficulty: suggested,
    suggestedDifficultyOrdinal: difficultyOrdinal(suggested),
    reason,
    action,
  };
}

/**
 * Aggregate attempt answers by effective difficulty band.
 * @param {Array<{
 *   isCorrect: boolean,
 *   question: { difficultyLevel?: import('@prisma/client').DifficultyLevel | null },
 *   attempt: { quiz: { difficultyLevel: import('@prisma/client').DifficultyLevel } },
 * }>} answerRows
 */
export function aggregateByEffectiveDifficulty(answerRows) {
  /** @type {Map<string, { difficulty: string, attempts: number, correctCount: number }>} */
  const map = new Map();

  for (const row of answerRows) {
    const level = effectiveDifficulty(row.question, row.attempt.quiz);
    const entry = map.get(level) ?? { difficulty: level, attempts: 0, correctCount: 0 };
    entry.attempts += 1;
    if (row.isCorrect) entry.correctCount += 1;
    map.set(level, entry);
  }

  return DIFFICULTY_ORDER.filter((level) => map.has(level)).map((level) => {
    const entry = map.get(level);
    return {
      difficulty: difficultyOrdinal(level),
      difficultyLevel: level,
      attempts: entry.attempts,
      correctCount: entry.correctCount,
      accuracyPercent:
        entry.attempts > 0
          ? Math.round((entry.correctCount / entry.attempts) * 10000) / 100
          : 0,
    };
  });
}

export { effectiveDifficulty };
