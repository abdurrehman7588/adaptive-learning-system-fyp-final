/**
 * @param {Array<{
 *   id: number,
 *   options: Array<{ id: number, isCorrect: boolean }>
 * }>} questions
 * @param {Array<{
 *   question_id: number,
 *   selected_option_id: number | null,
 *   time_taken_seconds?: number
 * }>} submittedAnswers
 * @param {number} passPercentage
 */
export function gradeQuizAttempt(questions, submittedAnswers, passPercentage) {
  const answerByQuestion = new Map(
    submittedAnswers.map((row) => [Number(row.question_id), row]),
  );

  const gradedRows = [];
  let score = 0;

  for (const question of questions) {
    const submitted = answerByQuestion.get(question.id);
    const correctOption = question.options.find((option) => option.isCorrect);
    const selectedOptionId =
      submitted?.selected_option_id !== undefined &&
      submitted?.selected_option_id !== null
        ? Number(submitted.selected_option_id)
        : null;

    const isCorrect =
      Boolean(correctOption) &&
      selectedOptionId !== null &&
      selectedOptionId === correctOption.id;

    if (isCorrect) {
      score += 1;
    }

    gradedRows.push({
      questionId: question.id,
      selectedOptionId,
      isCorrect,
      timeTakenSeconds:
        typeof submitted?.time_taken_seconds === 'number'
          ? submitted.time_taken_seconds
          : null,
      response: {
        question_id: question.id,
        selected_option_id: selectedOptionId,
        is_correct: isCorrect,
      },
    });
  }

  const totalPoints = questions.length;
  const percentage =
    totalPoints > 0 ? Math.round((score / totalPoints) * 10000) / 100 : 0;
  const passed = percentage >= passPercentage;

  return {
    score,
    totalPoints,
    percentage,
    passed,
    gradedRows,
    answerDtos: gradedRows.map((row) => row.response),
  };
}
