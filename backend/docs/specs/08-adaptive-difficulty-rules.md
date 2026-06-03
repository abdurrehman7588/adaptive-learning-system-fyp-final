# 08 — Adaptive difficulty rules (rules-based v1)

**Status:** Implemented (no ML, no real-time question swapping)  
**Depends on:** [07-adaptive-content-foundation.md](./07-adaptive-content-foundation.md)

---

## Effective difficulty

```text
effectiveDifficulty(question, quiz) = question.difficultyLevel ?? quiz.difficultyLevel
```

Implemented in `src/shared/content/effectiveDifficulty.js`.

---

## Suggestion inputs

| Input | Source |
|-------|--------|
| `quizDifficulty` | `Quiz.difficultyLevel` |
| `quizGradeLevel` | `Quiz.gradeLevel` |
| `childGradeLevel` | `Child.gradeLevel` |
| `lastScorePercent` | Latest completed attempt on that quiz |
| `attemptCount` | Completed attempts on that quiz |
| `overallAveragePercent` | Child analytics summary |
| `recentAccuracyPercent` | Same as overall in v1 (future: rolling window) |

---

## Thresholds

| Constant | Value | Use |
|----------|-------|-----|
| `STRONG_ACCURACY` | 80% | Step up / advanced match |
| `WEAK_ACCURACY` | 60% | Step down / review |
| `MASTERY_ATTEMPTS` | 2 | Minimum attempts before step up |

---

## Decision table

| Condition | Action | Suggested difficulty |
|-----------|--------|----------------------|
| Quiz grade ≥ child grade + 2 bands | `review` | `easy` |
| Unattempted + strong overall (≥80%) + grade OK | `step_up` | +1 level (max `hard`) |
| Last score &lt; 60% | `step_down` | −1 level (min `easy`) |
| ≥2 attempts, last ≥80%, recent ≥80% | `step_up` | +1 level |
| Recent &lt; 60% with prior attempts | `review` | −1 level |
| Default | `stay` | Quiz default |

Implementation: `src/modules/adaptive/adaptiveDifficulty.service.js` → `suggestQuizDifficulty()`.

---

## Recommendations integration

- Each recommendation includes `suggestedDifficulty` (1–3 ordinal), `difficultyLevel`, and updated `reason` when adaptive rules fire.
- `conceptProfile.difficultyProgression.byDifficulty` aggregates answer rows by **effective** difficulty.

---

## Out of scope (unchanged)

- Changing questions mid-attempt
- LLM-generated items
- Persisting `difficultyLevelAtAttempt` on `QuizAttempt`
