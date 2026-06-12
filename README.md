# Adaptive Learning System for Kids

An adaptive learning platform for children (Pre-K through Grade 6) that combines grade-scoped quizzes, emotional intelligence (EI) assessments, rewards, and AI-driven difficulty recommendations. Parents manage child profiles and view analytics; students take quizzes, complete EI activities, and earn XP and badges. The backend uses a hybrid engine: a Python scikit-learn Random Forest model blended with a six-feature adaptive scoring system for personalized Easy / Medium / Hard recommendations and per-category quiz routing.

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS, React Router, Recharts, Framer Motion |
| Backend API | Node.js, Express 4, Prisma 6, PostgreSQL, Zod, JWT, bcrypt |
| ML | Python scikit-learn Random Forest (`backend/ml/predict_recommendation.py`) |
| Database | PostgreSQL (Neon in production) |

## Architecture

```
┌─────────────────┐     HTTPS      ┌──────────────────────┐
│  React SPA      │ ──────────────▶│  Express API         │
│  (Vercel)       │                │  (Render)            │
└─────────────────┘                └──────────┬───────────┘
                                              │
                         ┌────────────────────┼────────────────────┐
                         ▼                    ▼                    ▼
                  PostgreSQL            Python ML            Prisma ORM
                  (Neon)           (subprocess predictor)   (migrations/seed)
```

- **Frontend** — Single-page app deployed on Vercel; calls `/api` (proxied in dev, or `VITE_API_BASE_URL` in production).
- **Backend** — Modular monolith on Render; runs Prisma migrations on startup (`scripts/start-production.mjs`).
- **Database** — PostgreSQL via Neon; 144 published quizzes (8 grades × 6 categories × 3 difficulty tiers).
- **ML layer** — Node spawns `predict_recommendation.py` with a four-feature JSON payload; falls back to rule-based adaptive scoring if Python is unavailable.

## Features

- **Adaptive quizzing** — Grade-filtered catalog; easy / medium / hard tiers; category-specific difficulty routing for tier-pilot grades
- **Hybrid adaptive engine** — Six-feature adaptive score blended with Random Forest ML recommendations
- **Emotional intelligence** — SDQ-style assessments, dimension activities, parent emotional insights
- **Post-quiz emotion feedback** — Optional student check-in after completed quizzes
- **Rewards** — XP, levels, badges, and streaks from quiz and EI activity completion
- **Parent dashboard** — Multi-child overview, AI recommendation cards, reports, settings
- **Student dashboard** — Personalized quiz picks, learning profile, rewards, EI profile
- **Analytics & reports** — Subject breakdown, quiz history, performance charts, child comparison

## Local development

### Prerequisites

- Node.js 20+
- PostgreSQL (local or Neon connection string)
- Python 3 with `scikit-learn` and `joblib` (for ML predictions; optional — API falls back without it)

### Backend

```bash
cd backend
cp .env.example .env
# Set DATABASE_URL and JWT_SECRET

npm install
npm run db:migrate:dev
npm run db:seed
npm run dev
```

API: `http://localhost:5000`  
Health: `GET http://localhost:5000/api/health`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173` (Vite proxies `/api` → `http://127.0.0.1:5000`)

### ML model (optional local retrain)

```bash
python generate_dataset.py
python train_model.py
```

Copies `recommendation_model.pkl` to `backend/ml/model.pkl`.

## Environment variables

### Backend (`backend/.env`)

`PORT`, `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `DEMO_PARENT_EMAIL`, `DEMO_PARENT_PASSWORD`, `DEMO_CHILD_USERNAME`, `DEMO_CHILD_PIN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ML_PYTHON`, `SKIP_DB_MIGRATE`, `DISABLE_AUTH_RATE_LIMIT`, `AUTH_RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_WINDOW_MS`

### Frontend (`frontend/.env`)

`VITE_API_BASE_URL`

## Deployment

| Component | Platform | Config |
|-----------|----------|--------|
| Frontend | [Vercel](https://vercel.com) | `frontend/vercel.json` (SPA rewrites) |
| Backend API | [Render](https://render.com) | `backend/render.yaml` |

Set `FRONTEND_URL` on Render to your Vercel URL. Set `VITE_API_BASE_URL` on Vercel to your Render API URL (e.g. `https://your-api.onrender.com/api`).

## Demo credentials

Demo parent and student logins are seeded when you run `npm run db:seed`. Use them for local testing only — not in production.

## Project structure

```
adaptive-learning-system/
├── frontend/          # React SPA (Vercel)
├── backend/           # Express API (Render)
│   ├── prisma/        # Schema, migrations, seed, quiz catalog
│   ├── src/modules/   # 11 domain modules
│   └── ml/            # Python prediction script + model artifacts
├── generate_dataset.py
├── train_model.py
└── student_dataset.csv
```

## Team

**Group:** F25CS162  
**Supervisor:** Mam Arshia Naeem  
**Members:** Abdur Rehman, Kasib Malik, Saqib Fiaz  
**University:** University of Central Punjab (UCP)

## Further documentation

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- Backend docs: `backend/docs/`
