const pool = require("../config/db");

const attemptColumns =
  "id, quiz_id, child_id, status, score, total_points, percentage, started_at, completed_at";

const findById = async (attemptId) => {
  const result = await pool.query(
    `SELECT ${attemptColumns} FROM quiz_attempts WHERE id = $1`,
    [attemptId]
  );
  return result.rows[0] || null;
};

const findByIdWithDetails = async (attemptId) => {
  const attempt = await findById(attemptId);
  if (!attempt) {
    return null;
  }

  const answersResult = await pool.query(
    `SELECT aa.id, aa.question_id, aa.selected_option_id, aa.is_correct, aa.points_earned,
            q.question_text, q.points AS question_points,
            qo.option_text AS selected_option_text
     FROM attempt_answers aa
     JOIN questions q ON q.id = aa.question_id
     LEFT JOIN question_options qo ON qo.id = aa.selected_option_id
     WHERE aa.attempt_id = $1
     ORDER BY q.order_index ASC, q.id ASC`,
    [attemptId]
  );

  return { ...attempt, answers: answersResult.rows };
};

const findByChildId = async (childId) => {
  const result = await pool.query(
    `SELECT qa.id, qa.quiz_id, qa.child_id, qa.status, qa.score, qa.total_points,
            qa.percentage, qa.started_at, qa.completed_at,
            q.title AS quiz_title, q.subject, q.grade_level
     FROM quiz_attempts qa
     JOIN quizzes q ON q.id = qa.quiz_id
     WHERE qa.child_id = $1
     ORDER BY qa.started_at DESC`,
    [childId]
  );

  return result.rows;
};

const findInProgress = async (quizId, childId) => {
  const result = await pool.query(
    `SELECT ${attemptColumns}
     FROM quiz_attempts
     WHERE quiz_id = $1 AND child_id = $2 AND status = 'in_progress'
     ORDER BY started_at DESC
     LIMIT 1`,
    [quizId, childId]
  );
  return result.rows[0] || null;
};

const create = async (quizId, childId, totalPoints) => {
  const result = await pool.query(
    `INSERT INTO quiz_attempts (quiz_id, child_id, status, total_points)
     VALUES ($1, $2, 'in_progress', $3)
     RETURNING ${attemptColumns}`,
    [quizId, childId, totalPoints]
  );
  return result.rows[0];
};

const submitAnswers = async (attemptId, answers) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const attemptResult = await client.query(
      `SELECT ${attemptColumns} FROM quiz_attempts WHERE id = $1 FOR UPDATE`,
      [attemptId]
    );

    const attempt = attemptResult.rows[0];
    if (!attempt) {
      await client.query("ROLLBACK");
      return { error: "not_found" };
    }

    if (attempt.status !== "in_progress") {
      await client.query("ROLLBACK");
      return { error: "already_completed" };
    }

    const questionsResult = await client.query(
      `SELECT q.id, q.points, q.quiz_id
       FROM questions q
       WHERE q.quiz_id = $1`,
      [attempt.quiz_id]
    );

    const questions = questionsResult.rows;
    const questionIds = questions.map((q) => q.id);

    if (!questionIds.length) {
      await client.query("ROLLBACK");
      return { error: "no_questions" };
    }

    const optionsResult = await client.query(
      `SELECT id, question_id, is_correct
       FROM question_options
       WHERE question_id = ANY($1::int[])`,
      [questionIds]
    );

    const correctByQuestion = {};
    const optionBelongsToQuestion = {};

    for (const option of optionsResult.rows) {
      optionBelongsToQuestion[option.id] = option.question_id;
      if (option.is_correct) {
        correctByQuestion[option.question_id] = option.id;
      }
    }

    let score = 0;
    let totalPoints = 0;
    const gradedAnswers = [];

    for (const question of questions) {
      totalPoints += question.points;

      const submitted = answers.find((a) => a.question_id === question.id);
      let isCorrect = false;
      let pointsEarned = 0;
      let selectedOptionId = submitted?.selected_option_id ?? null;

      if (
        selectedOptionId &&
        optionBelongsToQuestion[selectedOptionId] === question.id &&
        correctByQuestion[question.id] === selectedOptionId
      ) {
        isCorrect = true;
        pointsEarned = question.points;
        score += question.points;
      } else if (selectedOptionId && optionBelongsToQuestion[selectedOptionId] !== question.id) {
        selectedOptionId = null;
      }

      const answerResult = await client.query(
        `INSERT INTO attempt_answers (attempt_id, question_id, selected_option_id, is_correct, points_earned)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, question_id, selected_option_id, is_correct, points_earned`,
        [attemptId, question.id, selectedOptionId, isCorrect, pointsEarned]
      );

      gradedAnswers.push(answerResult.rows[0]);
    }

    const percentage =
      totalPoints > 0
        ? Math.round((score / totalPoints) * 10000) / 100
        : 0;

    const updatedAttempt = await client.query(
      `UPDATE quiz_attempts
       SET status = 'completed',
           score = $2,
           total_points = $3,
           percentage = $4,
           completed_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING ${attemptColumns}`,
      [attemptId, score, totalPoints, percentage]
    );

    await client.query("COMMIT");

    return {
      attempt: updatedAttempt.rows[0],
      answers: gradedAnswers,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  findById,
  findByIdWithDetails,
  findByChildId,
  findInProgress,
  create,
  submitAnswers,
};
