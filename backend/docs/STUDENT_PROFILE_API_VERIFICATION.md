# Student Profile API Verification Report

**Date:** May 2026

---

## 1. Primary profile endpoint

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| **GET** | `/api/children/me/profile` | `student` | Full profile bundle (learner + parent + account) |
| **PATCH** | `/api/children/me` | `student` | Update `avatar_url` only |

### Secondary endpoints (still used elsewhere)

| Method | Path | Used on profile? |
|--------|------|----------------|
| GET | `/api/children/:id` | No (replaced by `/me/profile` on profile page) |
| GET | `/api/children/:id/rewards` | No (rewards merged into `/me/profile`) |
| PUT | `/api/children/:id` | No — **parent-only**; students cannot PATCH via this route |

---

## 2. Field sources

### Child table (`children`)

| UI field | API field | DB column |
|----------|-----------|-----------|
| Name | `learner.name` | `name` |
| Username | `learner.username` | `username` |
| Age | `learner.age` | `age` |
| Grade | `learner.grade_level` | `grade_level` (display label via mapper) |
| Child ID | `learner.id` | `id` |
| Avatar | `learner.avatar_url` | `avatar_url` |
| Member since | `account.member_since` | `created_at` |

### Parent / User tables

| UI field | API field | DB source |
|----------|-----------|-----------|
| Parent name | `parent.name` | `users.name` via `children.parent_id` |
| Parent email | **Not exposed** to students | `users.email` (withheld for privacy) |
| Account linked | `parent.account_linked` | Derived (`user` relation exists) |

### Rewards / level system (computed from attempts)

| UI field | API field | Source |
|----------|-----------|--------|
| Level | `account.current_level` | `buildChildRewards()` from completed `quiz_attempts` |
| XP | `account.total_xp` | Same |
| Badges earned | `account.badges_earned` | `achievementCount` from rewards calculator |
| Level title | `account.level_title` | Rewards constants (subtitle only) |

---

## 3. Missing database fields

| Desired field | Status |
|---------------|--------|
| Student email | N/A — students use username + PIN, no email on `Child` |
| Parent email on student profile | **Intentionally omitted** — show “Parent account linked ✓” |
| Persisted difficulty preference | No column — `learning_preferences` JSON exists but preview UI not wired |
| Separate `badges` table | No — badges derived from attempt rules in rewards module |

No schema migration required for this profile MVP.

---

## 4. API issues found and fixed

| Issue | Before | After |
|-------|--------|-------|
| Profile mostly cosmetic | Only rewards + AuthContext patch | `GET /children/me/profile` loads full bundle |
| Avatar not persisted for students | `PUT /children/:id` parent-only | `PATCH /children/me` saves `avatar_url` |
| Parent info missing | Not loaded | Parent name + linked status |
| Duplicate dashboard data on profile | N/A on old page | Profile excludes analytics/adaptive |
| Difficulty preview non-functional | Theme toggle only | Marked “Coming soon” |

---

## 5. Broken calls (verification)

Run:

```bash
cd backend
node scripts/verify-student-profile.mjs
```

Expected: all PASS for student login + profile GET + avatar PATCH + persistence check.

---

## 6. Response example

```json
{
  "learner": {
    "id": 1,
    "name": "Demo Learner",
    "username": "demokid",
    "grade_level": "Grade 2",
    "grade_level_enum": "grade_2",
    "avatar_url": "🦁",
    "age": 7,
    "created_at": "2026-05-01T12:00:00.000Z"
  },
  "parent": {
    "name": "Demo Parent",
    "account_linked": true
  },
  "account": {
    "current_level": 2,
    "level_title": "Curious Explorer",
    "total_xp": 120,
    "badges_earned": 1,
    "member_since": "2026-05-01T12:00:00.000Z"
  }
}
```
