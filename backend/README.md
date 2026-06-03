# Adaptive Learning — Backend API

Modular monolith (Node.js + Express + Prisma + PostgreSQL).

**Implemented:** Shared kernel, Auth, Parent, Child, Quiz, Analytics compatibility, Rule-based recommendations  
**Pending:** Rewards, ML/adaptive services

**Implementation discipline:** [docs/DISCIPLINE.md](docs/DISCIPLINE.md)

## Quick start

```powershell
cd backend
copy .env.example .env
# Edit DATABASE_URL and JWT_SECRET

npm install
npm run db:migrate:dev
npm run db:seed
npm run dev
```

API: `http://localhost:5000`  
Health: `GET http://localhost:5000/api/health`

Frontend (Vite) proxies `/api` → port 5000.

## Demo parent login

After seed:

- Email: `parent@demo.com`
- Password: `password123`

## Parent endpoints (Bearer parent JWT)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/parent/me` | Profile + preferences + onboarding |
| PUT | `/api/parent/me/preferences` | Merge preferences JSON |
| GET | `/api/parent/onboarding` | Onboarding status |
| PUT | `/api/parent/onboarding` | Complete/skip onboarding |
| GET | `/api/parent/bootstrap` | Optional dashboard session bundle |

## Auth endpoints

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/auth/google` | Google OAuth start (requires env vars) |
| GET | `/api/auth/google/callback` | Redirects to FE with `?token=` |
| POST | `/api/auth/register` | Parent email signup |
| POST | `/api/auth/login` | Parent email login |
| POST | `/api/auth/student/login` | Username + PIN (Child module required) |
| POST | `/api/auth/admin/login` | Optional admin seed |
| GET | `/api/auth/me` | Bearer token |
| PUT | `/api/auth/profile` | Parent name update |

Responses use `{ success, message, data }`. Login `data` includes `{ token, user }`.

## Google OAuth

Set in `.env`:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL` (default `http://localhost:5000/api/auth/google/callback`)

Add authorized redirect URI in Google Cloud Console. After login, browser lands on:

`http://localhost:5173/parent/login?token=<jwt>`

Add a thin FE handler to store the token (see frontend `client.ts` envelope unwrap).

## Project layout

```
src/
  config/           # Environment
  shared/           # Envelope, errors, middleware, Prisma client
  modules/
    auth/           # OAuth, JWT, parent/student login
    health/
  app.js
  server.js
prisma/
  schema.prisma
  migrations/
  seed.js
```

## Next implementation

1. Parent module  
2. ~~Child module~~ (implemented — `ChildAuthPort` / `ChildQueryPort`, `/api/children`)  
3. Quiz, Analytics, Rewards compatibility
