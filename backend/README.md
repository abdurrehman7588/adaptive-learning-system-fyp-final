# Adaptive Learning System for Kids — Backend API

Modular Node.js REST API for the Adaptive Learning System. Handles parent and student authentication, grade-scoped quiz delivery, attempt grading, emotional intelligence assessments, rewards, analytics, and hybrid ML + adaptive recommendations.

## Tech stack

- **Node.js** (ES modules) + **Express 4**
- **Prisma 6** ORM + **PostgreSQL** (Neon in production)
- **Python scikit-learn** Random Forest (invoked as subprocess for inference)
- **JWT** + **bcryptjs** for authentication
- **Zod** for request validation
- **Helmet** + **CORS** + rate limiting for security

## Modules

Eleven domain modules under `src/modules/`:

| Module | Description |
|--------|-------------|
| **health** | API health check (`GET /api/health`) |
| **auth** | Parent email/password login, Google OAuth, student PIN login, JWT tokens |
| **parent** | Parent profile, preferences, and onboarding state |
| **child** | Child CRUD, credentials (username/PIN), grade level management |
| **quiz** | Published quiz catalog, attempt lifecycle, answer grading |
| **analytics** | Child analytics, subject breakdown, recommendation bundles |
| **ai** | ML recommendation prediction endpoint and feature orchestration |
| **rewards** | XP, levels, badges, and streaks from quiz and EI activity |
| **emotional** | EI assessments (SDQ dimensions), activities, and feelings insights |
| **emotion-feedback** | Optional post-quiz emotional check-in persistence |
| **adaptive** | Hybrid adaptive scoring engine, category difficulty routing, tier pilot logic |

The `adaptive` module is consumed by `analytics` and `ai`; it is not mounted as a standalone router.

## API routes (summary)

| Prefix | Module |
|--------|--------|
| `/api/health` | health |
| `/api/auth` | auth |
| `/api/parent` | parent |
| `/api/children` | child, analytics, emotional, rewards |
| `/api/quizzes` | quiz (catalog) |
| `/api/attempts` | quiz (attempts) |
| `/api/ai` | ai |
| `/api/emotion-feedback` | emotion-feedback |

## Local development

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Python 3 with `scikit-learn` and `joblib` (optional; enables ML predictions)

### Setup

```bash
cd backend
cp .env.example .env
# Set DATABASE_URL and JWT_SECRET

npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start API with file watch (`http://localhost:5000`) |
| `npm run db:seed` | Seed demo parent, student, and 144 quizzes |
| `npm run db:migrate` | Apply migrations (production) |
| `npm run db:generate` | Regenerate Prisma client |

Health check: `GET http://localhost:5000/api/health`

## Environment variables

Names only (set values in `.env`; see `.env.example`):

`PORT`, `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `DEMO_PARENT_EMAIL`, `DEMO_PARENT_PASSWORD`, `DEMO_CHILD_USERNAME`, `DEMO_CHILD_PIN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ML_PYTHON`, `SKIP_DB_MIGRATE`, `DISABLE_AUTH_RATE_LIMIT`, `AUTH_RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_WINDOW_MS`

## ML layer

Recommendation difficulty uses a **hybrid pipeline**:

1. **Feature extraction** — `studentFeatures.service.js` builds `average_score`, `quiz_attempts`, `completion_rate`, and `emotional_score` from quiz attempts and emotional signals.
2. **Python inference** — `mlPrediction.service.js` spawns `backend/ml/predict_recommendation.py` via stdin JSON; loads `model.pkl` and `label_encoder.pkl`.
3. **Hybrid blend** — `adaptiveScore.service.js` blends ML output (60%) with a six-feature adaptive score (40%).
4. **Graceful fallback** — If Python is missing, times out (8s), or errors, `ruleBasedRecommendationLevel()` in `adaptiveRules.js` provides rule-based recommendations using the adaptive score.

Training artifacts live at the repo root (`generate_dataset.py`, `train_model.py`, `student_dataset.csv`, `recommendation_model.pkl`). `train_model.py` syncs copies to `backend/ml/model.pkl`.

## Database

- **Provider:** PostgreSQL via `DATABASE_URL` (Neon recommended for production)
- **ORM:** Prisma (`prisma/schema.prisma`)
- **Migrations:** 8 migration folders under `prisma/migrations/`:
  1. `auth_users`
  2. `parent_profiles`
  3. `quiz_module`
  4. `child_children`
  5. `learning_categories_six`
  6. `adaptive_content_foundation`
  7. `emotional_intelligence`
  8. `quiz_emotion_feedback`

### Key models

`User`, `ParentProfile`, `Child`, `Quiz`, `QuizQuestion`, `QuizAttempt`, `EmotionalAssessment`, `EmotionalActivityCompletion`, `QuizEmotionFeedback`

### Quiz catalog

144 published quizzes seeded from `prisma/quiz/catalog/` (Pre-K–Grade 6, 6 learning categories, 3 difficulty tiers each).

## Deployment (Render)

`render.yaml` defines the web service:

- **Root directory:** `backend`
- **Build:** `npm install && npx prisma generate`
- **Start:** `npm start` → runs `prisma migrate deploy`, `prisma generate`, then `src/server.js`

Required Render environment variables: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV`

See `docs/DEPLOY_RENDER.md` for full deployment notes.

## Verification scripts

```bash
npm run verify:content-coverage
npm run verify:grade-filtering
npm run verify:adaptive-mvp
npm run verify:emotional-module
node scripts/verify-rewards-module.mjs
```

## Project layout

```
src/
  config/           # Environment configuration
  shared/           # Middleware, errors, Prisma client, ports
  modules/          # 11 domain modules
  app.js            # Composition root
  server.js         # HTTP server entry
prisma/
  schema.prisma
  migrations/
  seed.js
  quiz/catalog/     # 144-quiz seed catalog
ml/
  predict_recommendation.py
  model.pkl
  label_encoder.pkl
scripts/
  start-production.mjs
  verify-*.mjs
```
