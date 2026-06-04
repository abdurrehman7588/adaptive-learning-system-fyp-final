# Emotional Intelligence Module — Verification & Manual Testing

Lightweight EI assessment for FYP: **Self Awareness**, **Empathy**, and **Self Regulation**. No SDQ, no clinical features, no AI chatbot. Adaptive quiz routing is unchanged.

---

## Verification checklist

Run automated checks from `backend/`:

```bash
npm run db:migrate
npm run verify:emotional-module
```

| # | Check | Expected |
|---|--------|----------|
| 1 | Prisma models | `EmotionalAssessment`, `EmotionalAssessmentResponse`, `EmotionalActivityCompletion` |
| 2 | Scoring service | Category % from Likert 1–4; status Developing / Good / Strong |
| 3 | `GET /children/me/emotional-profile` | Questionnaire + profile (student auth) |
| 4 | `POST /children/me/emotional-assessment` | Saves 12 responses, returns category scores |
| 5 | `GET /children/me/emotional-history` | Past assessments with dates |
| 6 | Feelings activity | Structured `emotion` + `reason` enums (no free text) |
| 7 | Profile DTO | 3 category cards metadata + `activities[]` with `isRecommended` |
| 8 | Parent insights | `feelingsInsights.mostCommonEmotion` / `mostCommonReason` |
| 9 | Rewards bundle | Total XP includes EI activity bonus |

---

## Manual testing guide

### Demo accounts

| Role | Credentials |
|------|-------------|
| Parent | `parent@demo.com` / `password123` |
| Student | `demokid` / `1234` |

### Student flow

1. Sign in as **demokid**.
2. Open **Emotional Intelligence** in the sidebar (heart icon).
3. If no assessment: tap **Start assessment**.
4. Answer all **12 questions** (Never / Sometimes / Often / Always).
5. Submit → profile shows category percentages, overall EI score, and recommended activity.
6. Complete the recommended activity (15 XP on success).
7. Open **Rewards** — total XP should increase.
8. Return to **Home** — EI summary card shows overall score.

### Parent flow

1. Sign in as **parent@demo.com**.
2. On **Dashboard**, find **Emotional Progress**.
3. Confirm strongest area, needs improvement, and recommended activity.
4. Optional: **Parent → Insights** for full EI breakdown.

### Recommendation logic

| Lowest category | Recommended activity |
|-----------------|----------------------|
| Self Awareness | My Feelings Today |
| Empathy | Helping a Friend |
| Self Regulation | Calm Down Challenge |

### Scoring reference

- Never=1, Sometimes=2, Often=3, Always=4
- **0–49%** Developing · **50–74%** Good · **75–100%** Strong
