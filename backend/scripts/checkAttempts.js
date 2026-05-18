const pool = require("../src/config/db");

async function main() {
  const completed = await pool.query(
    "SELECT COUNT(*)::int AS c FROM quiz_attempts WHERE status = 'completed'"
  );
  const recent = await pool.query(
    `SELECT id, quiz_id, child_id, status, score, percentage, started_at, completed_at
     FROM quiz_attempts ORDER BY id DESC LIMIT 10`
  );
  const children = await pool.query(
    "SELECT id, name, parent_id FROM children ORDER BY id"
  );
  console.log("completed_count", completed.rows[0]);
  console.log("recent_attempts", recent.rows);
  console.log("children", children.rows);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
