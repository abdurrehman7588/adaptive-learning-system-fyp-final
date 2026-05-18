const pool = require("../config/db");

const formatSubjectLabel = (subject) => {
  if (!subject) return "General";
  const lower = subject.toLowerCase();
  if (lower.includes("iq") || lower.includes("logic")) return "Logic & IQ";
  if (lower.includes("gk") || lower.includes("general") || lower.includes("world")) {
    return "General Knowledge";
  }
  if (lower.includes("math") || lower.includes("cognitive") || lower.includes("pattern")) {
    return "Cognitive";
  }
  return subject.charAt(0).toUpperCase() + subject.slice(1);
};

const mapSubjectRow = (row) => ({
  subject: row.subject,
  label: formatSubjectLabel(row.subject),
  attempts: Number(row.attempts) || 0,
  averagePercent: Number(row.average_percentage) || 0,
});

const buildWeeklySeries = (rows) => {
  const byDate = {};
  for (const row of rows) {
    const key = row.attempt_date.toISOString().slice(0, 10);
    byDate[key] = {
      date: key,
      label: row.attempt_date.toLocaleDateString("en-US", { weekday: "short" }),
      averagePercent: Number(row.average_percentage) || 0,
      attempts: Number(row.attempts) || 0,
    };
  }

  const series = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    series.push(
      byDate[key] ?? {
        date: key,
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        averagePercent: 0,
        attempts: 0,
      }
    );
  }

  return series;
};

const getChildAnalytics = async (childId) => {
  const summaryResult = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_attempts,
       COUNT(*)::int AS total_attempts,
       ROUND(AVG(percentage) FILTER (WHERE status = 'completed'), 2) AS average_percentage
     FROM quiz_attempts
     WHERE child_id = $1`,
    [childId]
  );

  const subjectResult = await pool.query(
    `SELECT
       COALESCE(NULLIF(TRIM(q.subject), ''), 'general') AS subject,
       COUNT(*)::int AS attempts,
       ROUND(AVG(qa.percentage), 2) AS average_percentage
     FROM quiz_attempts qa
     JOIN quizzes q ON q.id = qa.quiz_id
     WHERE qa.child_id = $1
       AND qa.status = 'completed'
       AND qa.percentage IS NOT NULL
     GROUP BY COALESCE(NULLIF(TRIM(q.subject), ''), 'general')
     ORDER BY average_percentage DESC`,
    [childId]
  );

  const recentResult = await pool.query(
    `SELECT
       qa.id,
       qa.quiz_id,
       qa.score,
       qa.total_points,
       qa.percentage,
       qa.completed_at,
       q.title AS quiz_title,
       COALESCE(NULLIF(TRIM(q.subject), ''), 'general') AS subject
     FROM quiz_attempts qa
     JOIN quizzes q ON q.id = qa.quiz_id
     WHERE qa.child_id = $1
       AND qa.status = 'completed'
     ORDER BY qa.completed_at DESC NULLS LAST, qa.id DESC
     LIMIT 10`,
    [childId]
  );

  const weeklyResult = await pool.query(
    `SELECT
       DATE(qa.completed_at) AS attempt_date,
       ROUND(AVG(qa.percentage), 2) AS average_percentage,
       COUNT(*)::int AS attempts
     FROM quiz_attempts qa
     WHERE qa.child_id = $1
       AND qa.status = 'completed'
       AND qa.completed_at IS NOT NULL
       AND qa.completed_at >= CURRENT_DATE - INTERVAL '6 days'
     GROUP BY DATE(qa.completed_at)
     ORDER BY attempt_date ASC`,
    [childId]
  );

  const summaryRow = summaryResult.rows[0] || {};
  const subjectBreakdown = subjectResult.rows.map(mapSubjectRow);
  const strongestSubject = subjectBreakdown[0] ?? null;
  const weakestSubject =
    subjectBreakdown.length > 1
      ? subjectBreakdown[subjectBreakdown.length - 1]
      : subjectBreakdown[0] ?? null;

  return {
    summary: {
      totalAttempts: Number(summaryRow.total_attempts) || 0,
      completedAttempts: Number(summaryRow.completed_attempts) || 0,
      averageScorePercent: Number(summaryRow.average_percentage) || 0,
      strongestSubject,
      weakestSubject,
    },
    subjectBreakdown,
    weeklyProgress: buildWeeklySeries(weeklyResult.rows),
    recentHistory: recentResult.rows.map((row) => ({
      attemptId: row.id,
      quizId: row.quiz_id,
      quizTitle: row.quiz_title,
      subject: row.subject,
      subjectLabel: formatSubjectLabel(row.subject),
      score: row.score,
      totalPoints: row.total_points,
      percentage: Number(row.percentage) || 0,
      completedAt: row.completed_at,
    })),
  };
};

const getParentOverview = async (parentId) => {
  const childrenResult = await pool.query(
    `SELECT id, name, grade_level
     FROM children
     WHERE parent_id = $1
     ORDER BY name ASC`,
    [parentId]
  );

  const aggregateResult = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE qa.status = 'completed')::int AS completed_attempts,
       COUNT(*)::int AS total_attempts,
       ROUND(AVG(qa.percentage) FILTER (WHERE qa.status = 'completed'), 2) AS average_percentage
     FROM quiz_attempts qa
     JOIN children c ON c.id = qa.child_id
     WHERE c.parent_id = $1`,
    [parentId]
  );

  const children = [];

  for (const child of childrenResult.rows) {
    const analytics = await getChildAnalytics(child.id);
    children.push({
      id: child.id,
      name: child.name,
      gradeLevel: child.grade_level,
      ...analytics,
    });
  }

  const aggregateRow = aggregateResult.rows[0] || {};

  return {
    summary: {
      childCount: childrenResult.rows.length,
      totalAttempts: Number(aggregateRow.total_attempts) || 0,
      completedAttempts: Number(aggregateRow.completed_attempts) || 0,
      averageScorePercent: Number(aggregateRow.average_percentage) || 0,
    },
    children,
  };
};

module.exports = {
  getChildAnalytics,
  getParentOverview,
  formatSubjectLabel,
};
