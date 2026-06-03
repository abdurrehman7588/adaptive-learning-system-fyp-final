-- Reduce LearningCategory to 6 values (merge sequencing → problem_solving, visual_reasoning → critical_thinking)

UPDATE "quizzes"
SET "category" = 'problem_solving'
WHERE "category"::text = 'sequencing';

UPDATE "quizzes"
SET "category" = 'critical_thinking'
WHERE "category"::text = 'visual_reasoning';

UPDATE "quiz_questions"
SET "skill_area" = 'problem_solving'
WHERE "skill_area"::text = 'sequencing';

UPDATE "quiz_questions"
SET "skill_area" = 'critical_thinking'
WHERE "skill_area"::text = 'visual_reasoning';

CREATE TYPE "LearningCategory_new" AS ENUM (
  'math',
  'science',
  'pattern_recognition',
  'memory',
  'problem_solving',
  'critical_thinking'
);

ALTER TABLE "quizzes"
  ALTER COLUMN "category" TYPE "LearningCategory_new"
  USING ("category"::text::"LearningCategory_new");

ALTER TABLE "quiz_questions"
  ALTER COLUMN "skill_area" TYPE "LearningCategory_new"
  USING (
    CASE
      WHEN "skill_area" IS NULL THEN NULL
      ELSE "skill_area"::text::"LearningCategory_new"
    END
  );

DROP TYPE "LearningCategory";
ALTER TYPE "LearningCategory_new" RENAME TO "LearningCategory";
