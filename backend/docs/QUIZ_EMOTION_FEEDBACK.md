# Post-Quiz Emotional Feedback (Optional)

## Purpose

After a child finishes a quiz on the server, the app may show an **optional** popup:

> "How did you feel while solving this quiz?"

This captures **real-time** emotional signals tied to a specific `quiz_attempt_id`, separate from the baseline SDQ emotional assessment.

## Why optional?

- Reduces pressure on young learners during demos and daily use.
- Avoids blocking navigation or quiz completion.
- Aligns with ethical UX: feelings are sensitive; skip is always valid.

**When skipped:** no database row is created. Recommendations continue normally.

## Database

Table: `quiz_emotion_feedback`

| Column | Description |
|--------|-------------|
| `child_id` | Learner |
| `quiz_attempt_id` | Unique — one feedback row per attempt |
| `emotion_label` | Display label (e.g. "Frustrated") |
| `emotion_score` | Mapped score 20–90 |
| `created_at` | Timestamp |

## API

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/emotion-feedback` | Student | Save optional feedback |
| GET | `/api/emotion-feedback/:childId` | Parent / Student | List feedback history |

### POST body

```json
{
  "quiz_attempt_id": 42,
  "emotion_label": "difficult"
}
```

Slug values: `very_easy_fun`, `confident`, `okay`, `difficult`, `frustrated`.

## Emotion score mapping

| Option | Score |
|--------|-------|
| Very Easy & Fun | 90 |
| Confident | 80 |
| Okay | 60 |
| Difficult | 40 |
| Frustrated | 20 |

## Adaptive learning integration

Resolver: `backend/src/modules/emotion-feedback/services/emotionalSignal.service.js`

**Priority order:**

1. Latest `quiz_emotion_feedback` row (real-time)
2. Latest SDQ `emotional_assessments.overall_percent` (baseline)
3. Neutral default — `assessed: false`, engines use **50** internally

The emotional signal contributes **10%** of the Adaptive Score (`adaptiveScore.service.js`).

### Recommendation reasoning examples

- Frustrated / Difficult → *"Student reported difficulty during recent quizzes, therefore additional practice is recommended before increasing difficulty."*
- Confident / Very Easy & Fun → confidence to progress
- Skipped → neutral weight; SDQ used if available

## Key files

| Layer | Path |
|-------|------|
| Constants | `backend/src/modules/emotion-feedback/constants/emotionFeedback.constants.js` |
| API module | `backend/src/modules/emotion-feedback/` |
| Signal resolver | `backend/src/modules/emotion-feedback/services/emotionalSignal.service.js` |
| Adaptive score | `backend/src/modules/adaptive/adaptiveScore.service.js` |
| ML / predictions | `backend/src/modules/ai/services/recommendationPrediction.service.js` |
| Reasoning text | `backend/src/modules/ai/services/recommendationReasoning.service.js` |
| UI modal | `frontend/src/components/features/emotional/PostQuizEmotionFeedbackModal.tsx` |
| Result page | `frontend/src/pages/student/QuizResultPage.tsx` |

## Verify

```bash
cd backend
npx prisma migrate deploy
node scripts/verify-quiz-emotion-feedback.mjs
```
