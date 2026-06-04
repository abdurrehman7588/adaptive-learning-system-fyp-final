-- Emotional Intelligence (lightweight EI module)

CREATE TYPE "EmotionalDimension" AS ENUM ('self_awareness', 'empathy', 'self_regulation');
CREATE TYPE "EmotionalScoreStatus" AS ENUM ('developing', 'good', 'strong');

CREATE TABLE "emotional_assessments" (
    "id" SERIAL NOT NULL,
    "child_id" INTEGER NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "self_awareness_percent" DECIMAL(5,2) NOT NULL,
    "empathy_percent" DECIMAL(5,2) NOT NULL,
    "self_regulation_percent" DECIMAL(5,2) NOT NULL,
    "overall_percent" DECIMAL(5,2) NOT NULL,
    "self_awareness_status" "EmotionalScoreStatus" NOT NULL,
    "empathy_status" "EmotionalScoreStatus" NOT NULL,
    "self_regulation_status" "EmotionalScoreStatus" NOT NULL,

    CONSTRAINT "emotional_assessments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "emotional_assessment_responses" (
    "id" SERIAL NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "dimension" "EmotionalDimension" NOT NULL,
    "question_index" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "emotional_assessment_responses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "emotional_activity_completions" (
    "id" SERIAL NOT NULL,
    "child_id" INTEGER NOT NULL,
    "activity_slug" TEXT NOT NULL,
    "dimension" "EmotionalDimension" NOT NULL,
    "xp_awarded" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emotional_activity_completions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "emotional_assessment_responses_assessment_id_dimension_question_index_key"
  ON "emotional_assessment_responses"("assessment_id", "dimension", "question_index");
CREATE INDEX "emotional_assessment_responses_assessment_id_idx"
  ON "emotional_assessment_responses"("assessment_id");
CREATE INDEX "emotional_assessments_child_id_completed_at_idx"
  ON "emotional_assessments"("child_id", "completed_at");
CREATE INDEX "emotional_activity_completions_child_id_completed_at_idx"
  ON "emotional_activity_completions"("child_id", "completed_at");

ALTER TABLE "emotional_assessments"
  ADD CONSTRAINT "emotional_assessments_child_id_fkey"
  FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "emotional_assessment_responses"
  ADD CONSTRAINT "emotional_assessment_responses_assessment_id_fkey"
  FOREIGN KEY ("assessment_id") REFERENCES "emotional_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "emotional_activity_completions"
  ADD CONSTRAINT "emotional_activity_completions_child_id_fkey"
  FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;
