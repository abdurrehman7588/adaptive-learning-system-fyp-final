const path = require("path");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const DEMO_PARENT = {
  name: "Demo Parent",
  email: "parent@demo.com",
  password: "password123",
  role: "parent",
};

const DEMO_CHILD = {
  name: "Demo Student",
  grade_level: "2nd Grade",
};

const SAMPLE_QUIZZES = [
  {
    title: "Pattern Recognition",
    description: "Spot patterns and shapes",
    subject: "cognitive",
    grade_level: "1st Grade",
    time_limit_minutes: 10,
    questions: [
      {
        text: "Which shape comes next? Red, Blue, Red, Blue ...",
        options: ["Red", "Blue", "Green", "Yellow"],
        correctIndex: 0,
      },
      {
        text: "Pick the odd one out.",
        options: ["Apple", "Banana", "Car", "Grape"],
        correctIndex: 2,
      },
      {
        text: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctIndex: 1,
      },
    ],
  },
  {
    title: "World Around Us",
    description: "General knowledge for curious kids",
    subject: "gk",
    grade_level: "2nd Grade",
    time_limit_minutes: 10,
    questions: [
      {
        text: "Which planet do we live on?",
        options: ["Mars", "Earth", "Jupiter", "Venus"],
        correctIndex: 1,
      },
      {
        text: "How many days are in a week?",
        options: ["5", "6", "7", "8"],
        correctIndex: 2,
      },
    ],
  },
  {
    title: "Brain Teasers",
    description: "Logic and reasoning puzzles",
    subject: "iq",
    grade_level: "3rd Grade",
    time_limit_minutes: 15,
    questions: [
      {
        text: "If you have 3 apples and eat 1, how many are left?",
        options: ["1", "2", "3", "0"],
        correctIndex: 1,
      },
      {
        text: "Which number completes the sequence 2, 4, 6, ?",
        options: ["7", "8", "9", "10"],
        correctIndex: 1,
      },
    ],
  },
];

async function ensureDemoParent(client) {
  const normalizedEmail = DEMO_PARENT.email.toLowerCase();
  const existing = await client.query(
    "SELECT id FROM users WHERE email = $1",
    [normalizedEmail]
  );

  if (existing.rows[0]) {
    return existing.rows[0].id;
  }

  const hashedPassword = await bcrypt.hash(DEMO_PARENT.password, 12);
  const created = await client.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [DEMO_PARENT.name, normalizedEmail, hashedPassword, DEMO_PARENT.role]
  );

  return created.rows[0].id;
}

async function ensureDemoChild(client, parentId) {
  const existing = await client.query(
    "SELECT id FROM children WHERE parent_id = $1 AND name = $2 LIMIT 1",
    [parentId, DEMO_CHILD.name]
  );

  if (existing.rows[0]) {
    console.log(`  skip child (exists): ${DEMO_CHILD.name}`);
    return existing.rows[0].id;
  }

  const created = await client.query(
    `INSERT INTO children (parent_id, name, grade_level, learning_preferences)
     VALUES ($1, $2, $3, '{}'::jsonb)
     RETURNING id`,
    [parentId, DEMO_CHILD.name, DEMO_CHILD.grade_level]
  );

  console.log(`  added child: ${DEMO_CHILD.name}`);
  return created.rows[0].id;
}

async function insertQuiz(client, creatorId, quizData) {
  const existing = await client.query(
    "SELECT id FROM quizzes WHERE title = $1 AND created_by = $2 LIMIT 1",
    [quizData.title, creatorId]
  );

  if (existing.rows[0]) {
    console.log(`  skip (exists): ${quizData.title}`);
    return;
  }

  const quizResult = await client.query(
    `INSERT INTO quizzes (title, description, subject, grade_level, time_limit_minutes, is_published, created_by)
     VALUES ($1, $2, $3, $4, $5, true, $6)
     RETURNING id`,
    [
      quizData.title,
      quizData.description,
      quizData.subject,
      quizData.grade_level,
      quizData.time_limit_minutes,
      creatorId,
    ]
  );

  const quizId = quizResult.rows[0].id;

  for (let i = 0; i < quizData.questions.length; i += 1) {
    const question = quizData.questions[i];
    const questionResult = await client.query(
      `INSERT INTO questions (quiz_id, question_text, question_type, points, order_index)
       VALUES ($1, $2, 'multiple_choice', 1, $3)
       RETURNING id`,
      [quizId, question.text, i]
    );

    const questionId = questionResult.rows[0].id;

    for (let j = 0; j < question.options.length; j += 1) {
      await client.query(
        `INSERT INTO question_options (question_id, option_text, is_correct, order_index)
         VALUES ($1, $2, $3, $4)`,
        [questionId, question.options[j], j === question.correctIndex, j]
      );
    }
  }

  console.log(`  added: ${quizData.title}`);
}

async function run() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const parentId = await ensureDemoParent(client);
    console.log(`Demo parent id: ${parentId} (${DEMO_PARENT.email} / ${DEMO_PARENT.password})`);

    await ensureDemoChild(client, parentId);

    console.log("Seeding published quizzes...");
    for (const quiz of SAMPLE_QUIZZES) {
      await insertQuiz(client, parentId, quiz);
    }

    await client.query("COMMIT");
    console.log("Seed completed.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
