import {
  CATEGORY_LABELS,
  difficultyToDisplayLabel,
  gradeLevelToDisplayLabel,
} from '../../../shared/content/taxonomy.js';

/**
 * @param {import('@prisma/client').Quiz & { _count?: { questions: number } }} quiz
 */
export function toQuizListItemDto(quiz) {
  return {
    id: quiz.id,
    slug: quiz.slug,
    title: quiz.title,
    description: quiz.description ?? undefined,
    subject: quiz.subject ?? undefined,
    category: quiz.category,
    category_label: CATEGORY_LABELS[quiz.category] ?? quiz.category,
    difficulty_level: quiz.difficultyLevel,
    difficulty_label: difficultyToDisplayLabel(quiz.difficultyLevel),
    grade_level: quiz.gradeLevel,
    grade_level_label: gradeLevelToDisplayLabel(quiz.gradeLevel),
    time_limit_minutes: quiz.timeLimitMinutes ?? undefined,
    questionCount: quiz._count?.questions ?? 0,
  };
}

/**
 * @param {import('@prisma/client').Quiz} quiz
 */
export function toQuizMetaDto(quiz) {
  return {
    id: quiz.id,
    slug: quiz.slug,
    title: quiz.title,
    description: quiz.description ?? undefined,
    subject: quiz.subject ?? undefined,
    category: quiz.category,
    category_label: CATEGORY_LABELS[quiz.category] ?? quiz.category,
    difficulty_level: quiz.difficultyLevel,
    difficulty_label: difficultyToDisplayLabel(quiz.difficultyLevel),
    grade_level: quiz.gradeLevel,
    grade_level_label: gradeLevelToDisplayLabel(quiz.gradeLevel),
    time_limit_minutes: quiz.timeLimitMinutes ?? undefined,
  };
}

/**
 * @param {import('@prisma/client').QuizQuestion & { options: import('@prisma/client').QuizQuestionOption[] }} question
 * @param {{ includeCorrect?: boolean, quiz?: import('@prisma/client').Quiz }} [options]
 */
export function toQuestionDto(question, options = {}) {
  const sortedOptions = [...question.options].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );

  const effective =
    question.difficultyLevel ?? options.quiz?.difficultyLevel ?? undefined;

  return {
    id: question.id,
    question_text: question.questionText,
    topic: question.topic ?? undefined,
    difficulty_level: effective,
    options: sortedOptions.map((option) => ({
      id: option.id,
      option_text: option.optionText,
      order_index: option.orderIndex,
      ...(options.includeCorrect ? { is_correct: option.isCorrect } : {}),
    })),
  };
}

/**
 * @param {import('@prisma/client').QuizAttempt} attempt
 * @param {Array<{ question_id: number, selected_option_id: number | null, is_correct: boolean }>} [answers]
 */
export function toAttemptDto(attempt, answers = undefined) {
  const dto = {
    id: attempt.id,
    quiz_id: attempt.quizId,
    child_id: attempt.childId,
    status: attempt.status,
    score: attempt.score ?? 0,
    total_points: attempt.totalPoints ?? 0,
  };

  if (attempt.percentage !== null && attempt.percentage !== undefined) {
    dto.percentage = Number(attempt.percentage);
  }

  if (answers) {
    dto.answers = answers;
  }

  return dto;
}
