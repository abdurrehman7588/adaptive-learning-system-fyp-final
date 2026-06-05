-- Optional post-quiz emotional feedback (one check-in per completed attempt).
CREATE TABLE "quiz_emotion_feedback" (
    "id" SERIAL NOT NULL,
    "child_id" INTEGER NOT NULL,
    "quiz_attempt_id" INTEGER NOT NULL,
    "emotion_label" TEXT NOT NULL,
    "emotion_score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_emotion_feedback_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "quiz_emotion_feedback_quiz_attempt_id_key" ON "quiz_emotion_feedback"("quiz_attempt_id");
CREATE INDEX "quiz_emotion_feedback_child_id_created_at_idx" ON "quiz_emotion_feedback"("child_id", "created_at");

ALTER TABLE "quiz_emotion_feedback" ADD CONSTRAINT "quiz_emotion_feedback_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quiz_emotion_feedback" ADD CONSTRAINT "quiz_emotion_feedback_quiz_attempt_id_fkey" FOREIGN KEY ("quiz_attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
