# Student greeting root-cause report

Generated: 2026-06-01

## Symptom

Student dashboard showed **"Hi, Student!"** even when the learner profile name was **Khan**, **Ali**, etc.

## Root cause

Two layers contributed; the primary bug was on the **backend session restore** path.

### 1. Backend: `GET /api/auth/me` hardcoded student name (primary)

**File:** `backend/src/modules/auth/services/auth.service.js`

For `auth.role === 'student'`, `getCurrentUser()` returned a stub object:

```javascript
user: {
  id: Number(auth.childId ?? auth.userId),
  name: 'Student',  // ← always literal "Student"
  role: 'student',
  age: 8,
  grade: '1st Grade',
}
```

**Effect:** On every full page load, `AuthContext` calls `fetchCurrentUser()` and overwrites the session user with `name: "Student"`.

**Note:** `POST /api/auth/student/login` was already correct — it uses `mapStudentUserDto(identity)` with `identity.name` from the `children` table. The bug appeared **after refresh**, not necessarily on first login.

### 2. Frontend: student UI bound greetings to `User.name`

**Files:** `StudentDashboard.tsx`, `StudentProfile.tsx`, `StudentAuth.tsx`

Student screens used `useAuth().user.name`, which is the **auth session DTO**, not the **Child profile** contract. Even with a fixed `/me`, product requirement is to show **`Child.name`** from `/children/:id`, not the auth user record.

## Fix summary

| Layer | Change |
|-------|--------|
| Backend | `/auth/me` loads child via `childQueryPort.findById(childId)` and `mapStudentUserDto()` |
| Frontend | `useActiveLearnerProfile()` hook loads `fetchChildProfile()`; student pages use `learnerName` / `learnerFirstName` |

## Components that used `User.name` (audit)

### Student-facing (fixed to use Child profile)

| File | Usage | Fix |
|------|--------|-----|
| `frontend/src/pages/student/StudentDashboard.tsx` | `Hi, {user?.name...}` | `learnerFirstName` from hook |
| `frontend/src/pages/student/StudentProfile.tsx` | `<h2>{user?.name}</h2>` | `learnerName` from hook |
| `frontend/src/pages/student/StudentRewards.tsx` | Generic header only | Personalized with `learnerFirstName` |
| `frontend/src/pages/student/QuizList.tsx` | No name before | `{learnerFirstName}'s grade adventures` |
| `frontend/src/pages/auth/StudentAuth.tsx` | `Signed in as {user.name}` | `learnerName` from hook |

### Student-facing (uses `user.id` only — not display name)

| File | Usage |
|------|--------|
| `frontend/src/pages/student/QuizPlayer.tsx` | `user?.id` for local result storage (auth child id) |

### Parent / account (correct — keep `User.name`)

| File | Usage |
|------|--------|
| `frontend/src/pages/parent/ParentDashboard.tsx` | Parent welcome |
| `frontend/src/pages/parent/ParentSettings.tsx` | Parent profile form |
| `frontend/src/pages/parent/onboarding/ParentOnboardingProfile.tsx` | Parent name onboarding |
| `frontend/src/pages/auth/ParentAuth.tsx` | Signed in as parent |

### Auth infrastructure (session only)

| File | Role |
|------|------|
| `frontend/src/context/AuthContext.tsx` | Stores session `User` after login/`/me` |
| `frontend/src/api/auth.ts` | Maps API user DTO → `User` / `Student` |

## Expected behavior after fix

| Child.name | Dashboard greeting |
|------------|-------------------|
| Khan | Hi, Khan! |
| Ali | Hi, Ali! |
| bunty | Hi, bunty! |

## Verification

1. Log in as a student (e.g. `demokid` / `1234`).
2. Confirm dashboard shows the child profile name, not "Student".
3. Refresh the page — greeting should remain correct.
4. Check Profile, Rewards, and Quizzes headers for the same name.
