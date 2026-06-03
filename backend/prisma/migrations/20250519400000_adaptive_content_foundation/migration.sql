-- M1 + M2 + M3: Adaptive content foundation (additive enums, backfill, constraints)

-- CreateEnum
CREATE TYPE "GradeLevel" AS ENUM ('pre_k', 'kindergarten', 'grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5', 'grade_6');
CREATE TYPE "DifficultyLevel" AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE "LearningCategory" AS ENUM ('math', 'science', 'pattern_recognition', 'memory', 'sequencing', 'problem_solving', 'critical_thinking', 'visual_reasoning');

-- Children: text grade_level -> enum
ALTER TABLE "children" ADD COLUMN "grade_level_enum" "GradeLevel";

UPDATE "children"
SET "grade_level_enum" = CASE
  WHEN "grade_level" IS NULL THEN NULL
  WHEN LOWER(TRIM("grade_level")) IN ('pre-k', 'pre k', 'pre_k', 'prek') THEN 'pre_k'::"GradeLevel"
  WHEN LOWER(TRIM("grade_level")) IN ('kindergarten', 'k', 'kinder') THEN 'kindergarten'::"GradeLevel"
  WHEN LOWER(TRIM("grade_level")) ~ '^(grade\s*)?1|1st' THEN 'grade_1'::"GradeLevel"
  WHEN LOWER(TRIM("grade_level")) ~ '^(grade\s*)?2|2nd' THEN 'grade_2'::"GradeLevel"
  WHEN LOWER(TRIM("grade_level")) ~ '^(grade\s*)?3|3rd' THEN 'grade_3'::"GradeLevel"
  WHEN LOWER(TRIM("grade_level")) ~ '^(grade\s*)?4|4th' THEN 'grade_4'::"GradeLevel"
  WHEN LOWER(TRIM("grade_level")) ~ '^(grade\s*)?5|5th' THEN 'grade_5'::"GradeLevel"
  WHEN LOWER(TRIM("grade_level")) ~ '^(grade\s*)?6|6th' THEN 'grade_6'::"GradeLevel"
  ELSE NULL
END;

ALTER TABLE "children" DROP COLUMN "grade_level";
ALTER TABLE "children" RENAME COLUMN "grade_level_enum" TO "grade_level";
CREATE INDEX "children_grade_level_idx" ON "children"("grade_level");

-- Quizzes: add taxonomy columns (nullable first)
ALTER TABLE "quizzes" ADD COLUMN "slug" TEXT;
ALTER TABLE "quizzes" ADD COLUMN "category" "LearningCategory";
ALTER TABLE "quizzes" ADD COLUMN "difficulty_level" "DifficultyLevel";
ALTER TABLE "quizzes" ADD COLUMN "grade_level_enum" "GradeLevel";

-- Legacy quiz backfill by title
UPDATE "quizzes" SET "slug" = 'pattern-puzzles', "category" = 'pattern_recognition', "difficulty_level" = 'easy', "grade_level_enum" = 'grade_2'
WHERE "title" = 'Pattern Puzzles' AND "slug" IS NULL;

UPDATE "quizzes" SET "slug" = 'world-explorer', "category" = 'science', "difficulty_level" = 'easy', "grade_level_enum" = 'grade_3'
WHERE "title" = 'World Explorer' AND "slug" IS NULL;

UPDATE "quizzes" SET "slug" = 'logic-lab', "category" = 'critical_thinking', "difficulty_level" = 'medium', "grade_level_enum" = 'grade_4'
WHERE "title" = 'Logic Lab' AND "slug" IS NULL;

-- Generic grade text -> enum for remaining rows
UPDATE "quizzes"
SET "grade_level_enum" = CASE
  WHEN "grade_level" IS NULL THEN 'grade_2'::"GradeLevel"
  WHEN LOWER(TRIM("grade_level")) ~ 'pre' THEN 'pre_k'::"GradeLevel"
  WHEN LOWER(TRIM("grade_level")) ~ 'kinder' THEN 'kindergarten'::"GradeLevel"
  WHEN LOWER(TRIM("grade_level")) ~ '1' THEN 'grade_1'::"GradeLevel"
  WHEN LOWER(TRIM("grade_level")) ~ '2' THEN 'grade_2'::"GradeLevel"
  WHEN LOWER(TRIM("grade_level")) ~ '3' THEN 'grade_3'::"GradeLevel"
  WHEN LOWER(TRIM("grade_level")) ~ '4' THEN 'grade_4'::"GradeLevel"
  WHEN LOWER(TRIM("grade_level")) ~ '5' THEN 'grade_5'::"GradeLevel"
  WHEN LOWER(TRIM("grade_level")) ~ '6' THEN 'grade_6'::"GradeLevel"
  ELSE 'grade_2'::"GradeLevel"
END
WHERE "grade_level_enum" IS NULL;

-- Subject -> category fallback
UPDATE "quizzes"
SET "category" = CASE
  WHEN LOWER(COALESCE("subject", '')) ~ 'pattern' THEN 'pattern_recognition'::"LearningCategory"
  WHEN LOWER(COALESCE("subject", '')) ~ 'iq|logic|reason' THEN 'critical_thinking'::"LearningCategory"
  WHEN LOWER(COALESCE("subject", '')) ~ 'science|world|gk|general' THEN 'science'::"LearningCategory"
  WHEN LOWER(COALESCE("subject", '')) ~ 'math|cognitive' THEN 'math'::"LearningCategory"
  ELSE 'math'::"LearningCategory"
END
WHERE "category" IS NULL;

UPDATE "quizzes" SET "difficulty_level" = 'medium'::"DifficultyLevel" WHERE "difficulty_level" IS NULL;

UPDATE "quizzes"
SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE("title", '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
WHERE "slug" IS NULL;

-- Dedupe slugs if any collision
UPDATE "quizzes" q
SET "slug" = q."slug" || '-' || q."id"::text
WHERE q."id" IN (
  SELECT "id" FROM (
    SELECT "id", ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "id") AS rn
    FROM "quizzes"
  ) t WHERE rn > 1
);

ALTER TABLE "quizzes" DROP COLUMN "grade_level";
ALTER TABLE "quizzes" RENAME COLUMN "grade_level_enum" TO "grade_level";

ALTER TABLE "quizzes" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_slug_key" UNIQUE ("slug");
ALTER TABLE "quizzes" ALTER COLUMN "category" SET NOT NULL;
ALTER TABLE "quizzes" ALTER COLUMN "difficulty_level" SET NOT NULL;
ALTER TABLE "quizzes" ALTER COLUMN "difficulty_level" SET DEFAULT 'medium';
ALTER TABLE "quizzes" ALTER COLUMN "grade_level" SET NOT NULL;

CREATE INDEX "quizzes_is_published_grade_level_category_difficulty_level_idx"
  ON "quizzes"("is_published", "grade_level", "category", "difficulty_level");
CREATE INDEX "quizzes_category_idx" ON "quizzes"("category");

-- Quiz questions: optional metadata
ALTER TABLE "quiz_questions" ADD COLUMN "difficulty_level" "DifficultyLevel";
ALTER TABLE "quiz_questions" ADD COLUMN "topic" VARCHAR(255);
ALTER TABLE "quiz_questions" ADD COLUMN "skill_area" "LearningCategory";
ALTER TABLE "quiz_questions" ADD COLUMN "estimated_time_seconds" INTEGER;

CREATE INDEX "quiz_questions_quiz_id_difficulty_level_idx" ON "quiz_questions"("quiz_id", "difficulty_level");
CREATE INDEX "quiz_questions_skill_area_idx" ON "quiz_questions"("skill_area");

-- Attempt answers: answered_at
ALTER TABLE "quiz_attempt_answers" ADD COLUMN "answered_at" TIMESTAMP(3);

UPDATE "quiz_attempt_answers" aa
SET "answered_at" = COALESCE(a."completed_at", a."started_at")
FROM "quiz_attempts" a
WHERE aa."attempt_id" = a."id" AND aa."answered_at" IS NULL;

CREATE INDEX "quiz_attempt_answers_question_id_idx" ON "quiz_attempt_answers"("question_id");
