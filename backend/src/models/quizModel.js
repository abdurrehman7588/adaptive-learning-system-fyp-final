const pool = require("../config/db");

const quizColumns =
  "id, title, description, subject, grade_level, time_limit_minutes, is_published, created_by, created_at, updated_at";

const findAll = async ({ publishedOnly = false, createdBy = null } = {}) => {
  const conditions = [];
  const values = [];

  if (publishedOnly) {
    conditions.push("is_published = true");
  }

  if (createdBy) {
    values.push(createdBy);
    conditions.push(`created_by = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `SELECT ${quizColumns} FROM quizzes ${where} ORDER BY created_at DESC`,
    values
  );

  return result.rows;
};

const findById = async (quizId) => {
  const result = await pool.query(
    `SELECT ${quizColumns} FROM quizzes WHERE id = $1`,
    [quizId]
  );
  return result.rows[0] || null;
};

const findByIdAndCreator = async (quizId, userId) => {
  const result = await pool.query(
    `SELECT ${quizColumns} FROM quizzes WHERE id = $1 AND created_by = $2`,
    [quizId, userId]
  );
  return result.rows[0] || null;
};

const create = async (userId, data) => {
  const {
    title,
    description,
    subject,
    grade_level,
    time_limit_minutes,
    is_published,
  } = data;

  const result = await pool.query(
    `INSERT INTO quizzes (title, description, subject, grade_level, time_limit_minutes, is_published, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${quizColumns}`,
    [
      title,
      description || null,
      subject || null,
      grade_level || null,
      time_limit_minutes || null,
      is_published ?? false,
      userId,
    ]
  );

  return result.rows[0];
};

const update = async (quizId, userId, data, isAdmin = false) => {
  const existing = isAdmin
    ? await findById(quizId)
    : await findByIdAndCreator(quizId, userId);

  if (!existing) {
    return null;
  }

  const values = {
    title: data.title ?? existing.title,
    description:
      data.description !== undefined ? data.description : existing.description,
    subject: data.subject !== undefined ? data.subject : existing.subject,
    grade_level:
      data.grade_level !== undefined ? data.grade_level : existing.grade_level,
    time_limit_minutes:
      data.time_limit_minutes !== undefined
        ? data.time_limit_minutes
        : existing.time_limit_minutes,
    is_published:
      data.is_published !== undefined ? data.is_published : existing.is_published,
  };

  const whereClause = isAdmin
    ? "WHERE id = $1"
    : "WHERE id = $1 AND created_by = $2";
  const params = isAdmin
    ? [
        quizId,
        values.title,
        values.description,
        values.subject,
        values.grade_level,
        values.time_limit_minutes,
        values.is_published,
      ]
    : [
        quizId,
        userId,
        values.title,
        values.description,
        values.subject,
        values.grade_level,
        values.time_limit_minutes,
        values.is_published,
      ];

  const result = await pool.query(
    `UPDATE quizzes
     SET title = $${isAdmin ? 2 : 3},
         description = $${isAdmin ? 3 : 4},
         subject = $${isAdmin ? 4 : 5},
         grade_level = $${isAdmin ? 5 : 6},
         time_limit_minutes = $${isAdmin ? 6 : 7},
         is_published = $${isAdmin ? 7 : 8},
         updated_at = CURRENT_TIMESTAMP
     ${whereClause}
     RETURNING ${quizColumns}`,
    params
  );

  return result.rows[0] || null;
};

const remove = async (quizId, userId, isAdmin = false) => {
  const query = isAdmin
    ? "DELETE FROM quizzes WHERE id = $1 RETURNING id"
    : "DELETE FROM quizzes WHERE id = $1 AND created_by = $2 RETURNING id";
  const params = isAdmin ? [quizId] : [quizId, userId];
  const result = await pool.query(query, params);
  return result.rows[0] || null;
};

const canManage = async (quizId, userId, isAdmin) => {
  if (isAdmin) {
    return Boolean(await findById(quizId));
  }
  return Boolean(await findByIdAndCreator(quizId, userId));
};

module.exports = {
  findAll,
  findById,
  findByIdAndCreator,
  create,
  update,
  remove,
  canManage,
};
