const pool = require("../config/db");

const questionColumns =
  "id, quiz_id, question_text, question_type, points, order_index, created_at";

const mapOptions = (rows, includeCorrect) =>
  rows.map((row) => {
    const option = {
      id: row.id,
      option_text: row.option_text,
      order_index: row.order_index,
    };
    if (includeCorrect) {
      option.is_correct = row.is_correct;
    }
    return option;
  });

const getOptionsForQuestions = async (questionIds, includeCorrect) => {
  if (!questionIds.length) {
    return {};
  }

  const result = await pool.query(
    `SELECT id, question_id, option_text, is_correct, order_index
     FROM question_options
     WHERE question_id = ANY($1::int[])
     ORDER BY order_index ASC`,
    [questionIds]
  );

  const grouped = {};
  for (const row of result.rows) {
    if (!grouped[row.question_id]) {
      grouped[row.question_id] = [];
    }
    grouped[row.question_id].push(row);
  }

  const mapped = {};
  for (const [questionId, rows] of Object.entries(grouped)) {
    mapped[questionId] = mapOptions(rows, includeCorrect);
  }

  return mapped;
};

const attachOptions = async (questions, includeCorrect) => {
  const ids = questions.map((q) => q.id);
  const optionsByQuestion = await getOptionsForQuestions(ids, includeCorrect);

  return questions.map((question) => ({
    ...question,
    options: optionsByQuestion[question.id] || [],
  }));
};

const findByQuizId = async (quizId, includeCorrect = false) => {
  const result = await pool.query(
    `SELECT ${questionColumns} FROM questions WHERE quiz_id = $1 ORDER BY order_index ASC, id ASC`,
    [quizId]
  );

  return attachOptions(result.rows, includeCorrect);
};

const findByIdAndQuizId = async (questionId, quizId) => {
  const result = await pool.query(
    `SELECT ${questionColumns} FROM questions WHERE id = $1 AND quiz_id = $2`,
    [questionId, quizId]
  );

  if (!result.rows[0]) {
    return null;
  }

  const [question] = await attachOptions([result.rows[0]], true);
  return question;
};

const createWithOptions = async (quizId, data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const questionResult = await client.query(
      `INSERT INTO questions (quiz_id, question_text, question_type, points, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${questionColumns}`,
      [
        quizId,
        data.question_text,
        data.question_type,
        data.points,
        data.order_index ?? 0,
      ]
    );

    const question = questionResult.rows[0];
    const options = [];

    for (const option of data.options) {
      const optionResult = await client.query(
        `INSERT INTO question_options (question_id, option_text, is_correct, order_index)
         VALUES ($1, $2, $3, $4)
         RETURNING id, option_text, is_correct, order_index`,
        [
          question.id,
          option.option_text,
          option.is_correct,
          option.order_index ?? 0,
        ]
      );
      options.push(optionResult.rows[0]);
    }

    await client.query("COMMIT");
    return { ...question, options };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const updateWithOptions = async (questionId, quizId, data) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT ${questionColumns} FROM questions WHERE id = $1 AND quiz_id = $2`,
      [questionId, quizId]
    );

    if (!existing.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    const current = existing.rows[0];

    const questionResult = await client.query(
      `UPDATE questions
       SET question_text = $3,
           question_type = $4,
           points = $5,
           order_index = $6
       WHERE id = $1 AND quiz_id = $2
       RETURNING ${questionColumns}`,
      [
        questionId,
        quizId,
        data.question_text ?? current.question_text,
        data.question_type ?? current.question_type,
        data.points ?? current.points,
        data.order_index ?? current.order_index,
      ]
    );

    const question = questionResult.rows[0];

    if (data.options) {
      await client.query("DELETE FROM question_options WHERE question_id = $1", [
        questionId,
      ]);

      for (const option of data.options) {
        await client.query(
          `INSERT INTO question_options (question_id, option_text, is_correct, order_index)
           VALUES ($1, $2, $3, $4)`,
          [
            questionId,
            option.option_text,
            option.is_correct,
            option.order_index ?? 0,
          ]
        );
      }
    }

    await client.query("COMMIT");

    return findByIdAndQuizId(questionId, quizId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const remove = async (questionId, quizId) => {
  const result = await pool.query(
    "DELETE FROM questions WHERE id = $1 AND quiz_id = $2 RETURNING id",
    [questionId, quizId]
  );
  return result.rows[0] || null;
};

const getTotalPoints = async (quizId) => {
  const result = await pool.query(
    "SELECT COALESCE(SUM(points), 0)::int AS total FROM questions WHERE quiz_id = $1",
    [quizId]
  );
  return result.rows[0].total;
};

module.exports = {
  findByQuizId,
  findByIdAndQuizId,
  createWithOptions,
  updateWithOptions,
  remove,
  getTotalPoints,
};
