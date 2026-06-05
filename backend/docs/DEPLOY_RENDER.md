# Deploying the backend on Render

## Root cause: missing emotional intelligence tables

The EI feature uses Prisma migration `20250601000000_emotional_intelligence`, which creates:

- `emotional_assessments`
- `emotional_assessment_responses`
- `emotional_activity_completions`

There is **no** separate `learning_paths` or legacy `emotional_*` SQL outside Prisma. If production logs show `relation "public.emotional_assessments" does not exist`, the Render database has **not** applied that migration (local `prisma migrate dev` does not update production).

## Required Render settings

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install && npx prisma generate` |
| **Start Command** | `npm start` |

`npm start` runs `scripts/start-production.mjs`, which executes:

1. `npx prisma migrate deploy`
2. `npx prisma generate`
3. `node src/server.js` (via `src/server.js` import)

## Environment variables

- `DATABASE_URL` — Render PostgreSQL **Internal** URL (same DB for build and runtime)
- `JWT_SECRET`
- `FRONTEND_URL` — Vercel origin for CORS

Optional: `SKIP_DB_MIGRATE=true` only for local debugging (do **not** set on Render).

## One-time production migration (Shell)

In Render → your Web Service → **Shell**:

```bash
cd backend   # omit if Root Directory is already backend
npx prisma migrate deploy
npx prisma generate
```

Verify:

```bash
npx prisma migrate status
```

Expected: all migrations **applied**, including `20250601000000_emotional_intelligence`.

## Verify endpoints after deploy

```bash
# Student token required for /me/*
curl -s -H "Authorization: Bearer <student_jwt>" \
  https://<your-api>/api/children/me/emotional-profile

curl -s -H "Authorization: Bearer <parent_or_student_jwt>" \
  https://<your-api>/api/children/<childId>/rewards
```

Local:

```bash
cd backend
npm run db:migrate
npm run verify:emotional-module
```
