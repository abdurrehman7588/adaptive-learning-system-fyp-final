import { DIFFICULTY_ORDER } from './taxonomy.js';

/**
 * @param {{ difficultyLevel?: import('@prisma/client').DifficultyLevel | null }} question
 * @param {{ difficultyLevel: import('@prisma/client').DifficultyLevel }} quiz
 * @returns {import('@prisma/client').DifficultyLevel}
 */
export function effectiveDifficulty(question, quiz) {
  return question?.difficultyLevel ?? quiz.difficultyLevel ?? 'medium';
}

/**
 * @param {import('@prisma/client').DifficultyLevel} current
 * @param {number} delta - positive = harder, negative = easier
 * @returns {import('@prisma/client').DifficultyLevel}
 */
export function shiftDifficulty(current, delta) {
  const index = DIFFICULTY_ORDER.indexOf(current);
  const base = index >= 0 ? index : 1;
  const next = Math.max(0, Math.min(DIFFICULTY_ORDER.length - 1, base + delta));
  return /** @type {import('@prisma/client').DifficultyLevel} */ (DIFFICULTY_ORDER[next]);
}
