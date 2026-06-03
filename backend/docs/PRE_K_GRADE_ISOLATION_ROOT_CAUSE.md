# Pre-K grade isolation — root cause analysis

Generated: 2026-06-01

## Symptom

Parent dashboard correctly shows **Child = Ali**, **Grade = Pre-K**, but the student experience shows:

- Hero: “Try **Grade 2** next!”
- Grade 2 quizzes in the catalog
- Grade 2 recommendations

## Root causes

### 1. Wrong learner session (most common in manual testing)

Parent and student use **different logins**:

| Surface | Auth | Typical child |
|---------|------|----------------|
| Parent dashboard | `parent@demo.com` | Selected child (e.g. Ali, Pre-K) |
| Student app | Student username + PIN | The child tied to that login |

Seeded demo student **`demokid`** is **`grade_2`**. If Ali has a separate username, the student must log in as **Ali’s username**, not `demokid`. Otherwise the API correctly returns Grade 2 content for the logged-in learner.

### 2. Student `childId` could drift from JWT (fixed)

`resolveActiveChildId()` could fall back to parent `localStorage` (`klp-active-child-id`) when the stored user role was ambiguous. Student pages now:

- Read **`childId` from the JWT** first (`jwtSession.ts`)
- Call **`GET /api/children/me/recommendations`** (JWT-scoped, no URL tampering)

### 3. Grade resolution must use DB enum (hardened)

Filtering now uses `loadChildGradeEnumForId()` (reads `children.grade_level` enum via `childQueryPort.findById`), not display labels.

### 4. No fallback when grade is missing (unchanged, confirmed)

If `grade_level` is null or unparsable:

- `filterQuizzesForChildGrade` → `[]`
- Recommendations built from `[]` → empty
- UI shows empty state — **no other grade is shown**

Pre-K with valid `pre_k` in DB returns **6** quizzes and **≤6** recommendations, all `pre_k`.

## API audit

| Endpoint | Role | Grade filter |
|----------|------|----------------|
| `GET /api/quizzes` | Student | `quizCatalog.service` → `loadChildGradeEnumForId` + filter |
| `GET /api/quizzes` | Parent | Full catalog (by design) |
| `GET /api/children/:id/recommendations` | Parent / Student | Orchestrator filter; student uses JWT `childId` only |
| `GET /api/children/me/recommendations` | Student | Same bundle, `childId` from JWT |
| `GET /api/children/recommendations/overview` | Parent | Per-child grade filter |

There is **no** `GET /api/student/recommendations`; student clients should use `/children/me/recommendations`.

## Fixes applied

### Backend

- `analyticsOrchestrator.service.js` — JWT `childId` for students; `loadChildGradeEnumForId`; `assertItemsMatchChildGrade`; `[grade-scope]` logs
- `quizCatalog.service.js` — same enum load + safety filter + logs
- `gradeCatalogFilter.js` — `loadChildGradeEnumForId`, `assertItemsMatchChildGrade`
- Route: `GET /api/children/me/recommendations` (student only)

### Frontend

- `jwtSession.ts` — decode JWT `childId` / role
- `activeChild.ts` — student id from JWT first
- `fetchLearnerRecommendations()` / `fetchStudentRecommendations()`
- `useStudentGradeScope` + client-side grade filter (defense in depth)
- `StudentDashboard`, `QuizList` — scoped APIs + filters

## Affected files

| File | Change |
|------|--------|
| `backend/src/shared/content/gradeCatalogFilter.js` | Enum loader + assert filter |
| `backend/src/modules/analytics/services/analyticsOrchestrator.service.js` | JWT child + logs |
| `backend/src/modules/quiz/services/quizCatalog.service.js` | Enum load + logs |
| `backend/src/modules/analytics/routes/analytics.routes.js` | `/me/recommendations` |
| `backend/src/modules/analytics/controllers/analytics.controller.js` | `studentRecommendations` |
| `backend/scripts/verify-grade-isolation.mjs` | Verification + JSON logs |
| `frontend/src/lib/jwtSession.ts` | New |
| `frontend/src/lib/gradeScope.ts` | New |
| `frontend/src/lib/activeChild.ts` | JWT-first student id |
| `frontend/src/api/recommendations.ts` | `/me` + `fetchLearnerRecommendations` |
| `frontend/src/hooks/useStudentGradeScope.ts` | New |
| `frontend/src/pages/student/StudentDashboard.tsx` | Scoped recs |
| `frontend/src/pages/student/QuizList.tsx` | Scoped catalog |

## Verification

```bash
cd backend
npm run verify:grade-isolation
npm run verify:grade-filtering
```

Example log fields: `childGrade`, `quizGrades`, `recommendationGrades`, `sampleQuizTitles`.

## Expected API responses (Pre-K student)

```json
{
  "childGrade": "pre_k",
  "quizGrades": ["pre_k"],
  "recommendationGrades": ["pre_k"],
  "quizCount": 6,
  "recommendationCount": 6
}
```

## Manual check for Ali

1. Confirm Ali’s **username** in Parent → Manage children.
2. Sign out student; log in with **Ali’s username + PIN** (not `demokid`).
3. Dashboard subtitle should show **Pre-K learning paths**.
4. Hero should reference a **Pre-K** quiz title (e.g. “Pre-K Math”), not Grade 2.
