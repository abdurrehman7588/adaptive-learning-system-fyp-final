const pool = require("../config/db");

const childColumns =
  "id, parent_id, name, date_of_birth, grade_level, avatar_url, learning_preferences, created_at, updated_at";

const findByParentId = async (parentId) => {
  const result = await pool.query(
    `SELECT ${childColumns} FROM children WHERE parent_id = $1 ORDER BY created_at ASC`,
    [parentId]
  );
  return result.rows;
};

const findByIdAndParentId = async (childId, parentId) => {
  const result = await pool.query(
    `SELECT ${childColumns} FROM children WHERE id = $1 AND parent_id = $2`,
    [childId, parentId]
  );
  return result.rows[0] || null;
};

const create = async (parentId, data) => {
  const { name, date_of_birth, grade_level, avatar_url, learning_preferences } =
    data;

  const result = await pool.query(
    `INSERT INTO children (parent_id, name, date_of_birth, grade_level, avatar_url, learning_preferences)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${childColumns}`,
    [
      parentId,
      name,
      date_of_birth || null,
      grade_level || null,
      avatar_url || null,
      JSON.stringify(learning_preferences || {}),
    ]
  );

  return result.rows[0];
};

const update = async (childId, parentId, data) => {
  const { name, date_of_birth, grade_level, avatar_url, learning_preferences } =
    data;

  const result = await pool.query(
    `UPDATE children
     SET name = $3,
         date_of_birth = $4,
         grade_level = $5,
         avatar_url = $6,
         learning_preferences = $7,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND parent_id = $2
     RETURNING ${childColumns}`,
    [
      childId,
      parentId,
      name,
      date_of_birth || null,
      grade_level || null,
      avatar_url || null,
      JSON.stringify(learning_preferences || {}),
    ]
  );

  return result.rows[0] || null;
};

const remove = async (childId, parentId) => {
  const result = await pool.query(
    "DELETE FROM children WHERE id = $1 AND parent_id = $2 RETURNING id",
    [childId, parentId]
  );
  return result.rows[0] || null;
};

module.exports = {
  findByParentId,
  findByIdAndParentId,
  create,
  update,
  remove,
};
