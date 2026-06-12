# Adaptive Learning System for Kids — Frontend

React single-page application for the Adaptive Learning System. Parents manage children, view analytics and emotional insights, and monitor AI recommendations. Students take grade-scoped quizzes, complete emotional intelligence activities, and track XP, badges, and streaks.

## Tech stack

- **React 19** with TypeScript
- **Vite 7** — dev server and production build
- **Tailwind CSS** — styling and responsive layouts
- **React Router 7** — client-side routing
- **Axios** — API client with JWT bearer auth
- **Recharts** — parent reports and analytics charts
- **Framer Motion** — UI animations
- **Lucide React** — icons

## Pages and routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | LandingPage | Public landing and role selection |
| `/parent/login` | ParentAuth | Parent email/password and Google OAuth login |
| `/student/login` | StudentAuth | Student username + PIN login |
| `/parent/dashboard` | ParentDashboard | Multi-child overview, AI cards, suggested next activity |
| `/parent/reports` | ParentReports | Performance charts, quiz history, child comparison |
| `/parent/insights` | EmotionalInsights | Parent view of child emotional intelligence |
| `/parent/settings` | ParentSettings | Profile and preferences |
| `/parent/settings/children` | ParentManageChildren | Add, edit, and manage child profiles |
| `/parent/onboarding/*` | Onboarding pages | Profile, child setup, and completion flow |
| `/student/dashboard` | StudentDashboard | AI recommendations, stats, recent activity |
| `/student/quizzes` | QuizList | Grade-filtered quiz catalog by category |
| `/student/quiz/:quizId` | QuizPlayer | Timed quiz with multiple-choice questions |
| `/student/quiz/result` | QuizResultPage | Score review and optional emotion feedback |
| `/student/rewards` | StudentRewards | XP, level, badges, and streaks |
| `/student/profile` | StudentProfile | Learner profile and grade info |
| `/student/emotional` | EmotionalProfile | EI dimension overview |
| `/student/emotional/assessment` | EmotionalAssessment | SDQ-style EI assessment |
| `/student/emotional/activity/:slug` | EmotionalActivity | Guided EI activity |
| `/student/emotional/:categorySlug` | EmotionalCategoryDetail | Category-specific EI content |

## Key features

- Role-based layouts (parent sidebar, student bottom navigation)
- Mobile-responsive UI with safe-area support for phones
- AI recommendation cards (`AiRecommendationCard`, `AiRecommendedLevelBadge`)
- Adaptive quiz catalog with category and difficulty badges
- Parent onboarding flow with `ParentFlowGuard`
- JWT session persistence via `AuthContext`

## Local development

### Prerequisites

- Node.js 20+
- Backend API running on port 5000 (see [backend README](../backend/README.md))

### Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

In development, the Vite dev server proxies `/api` to `http://127.0.0.1:5000` — no frontend env file is required for local work.

### Optional environment variable

Create `frontend/.env` only when the API is not on the default proxy target:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

In production (Vercel), set `VITE_API_BASE_URL` to your deployed backend URL including `/api`.

## Build and preview

```bash
npm run build    # tsc -b && vite build → dist/
npm run preview  # serve production build locally
npm run lint     # ESLint
```

## Deployment (Vercel)

1. Set root directory to `frontend`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variable: `VITE_API_BASE_URL` → your Render API base (e.g. `https://adaptive-learning-api.onrender.com/api`)
5. `vercel.json` configures SPA rewrites so client-side routes work on refresh

## Project layout

```
src/
  api/           # Axios client and API modules
  components/    # UI, layout, features (AI, reports, emotional)
  context/       # Auth, theme, parent flow
  pages/         # Route-level pages (auth, parent, student, landing)
  lib/           # Utilities (JWT, responsive, AI helpers)
```
