import { resolveQuizSubject } from '../../../shared/content/taxonomy.js';

/**
 * @deprecated Prefer resolveQuizSubject(quiz) with quiz.category
 */
export function normalizeSubject(subject) {
  return resolveQuizSubject({ subject, category: null });
}

export { resolveQuizSubject };
