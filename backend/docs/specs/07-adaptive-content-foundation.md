# 07 — Adaptive content foundation (approved specification)

**Status:** M1–M3 implemented (May 2026). M4 dual-read active; M5 (`subject` drop) pending.  
**Approved:** May 2026  
**Scope:** Database schema, taxonomy, seed strategy, and migration plan only.

**Out of scope (explicit):** AI/LLM, dynamic question generation, real-time difficulty switching, adaptive engine tables, catalog filter APIs, FastAPI microservices.

---

## Approval record

| Decision | Resolution |
|----------|------------|
| `CategoryGroup` enum | **Removed** — not in schema v1 |
| Logic Lab category | **`critical_thinking` only** |
| Quiz category | **Exactly one `LearningCategory` per quiz** (required, non-null after migration) |
| Quiz difficulty | **Default difficulty** for the quiz |
| Question difficulty | **Optional override**; `null` → inherit quiz default |
| Grade vs difficulty | **Separate concepts** — grade = access band; difficulty = challenge level |

---

## 1. Purpose

Prepare PostgreSQL and module boundaries for:

- Grade-based learning (Pre-K through Grade 6)
- Difficulty progression (Easy / Medium / Hard)
- Future adaptive learning (rules-based, then optional ML/AI)
- Future AI recommendations (structured metadata, not free-text `subject`)
- Question-level performance tracking (`timeTakenSeconds`, `isCorrect`, `answeredAt`)

**No change to current runtime behavior** until later implementation phases complete additive migration and dual-read DTOs.

---

## 2. Architecture context (unchanged)

- **Modular monolith** — Quiz module owns catalog persistence; Analytics/Rewards read `quiz_attempts` via own repositories.
- **Cross-module rule** — Taxonomy labels and enum→display maps live in `shared/content/taxonomy` (to be added); Analytics reads `quiz.category` with legacy `subject` fallback during transition.
- **Compute-on-read** — No analytics mastery tables in this spec.

---

## 3. Enum definitions

### 3.1 `GradeLevel`

Canonical grade band for **content access** (what a learner is eligible to see).

| Prisma value | Display label (API/FE) |
|--------------|------------------------|
| `pre_k` | Pre-K |
| `kindergarten` | Kindergarten |
| `grade_1` | Grade 1 |
| `grade_2` | Grade 2 |
| `grade_3` | Grade 3 |
| `grade_4` | Grade 4 |
| `grade_5` | Grade 5 |
| `grade_6` | Grade 6 |

**Ordering (for filters and future progression):**  
`pre_k` < `kindergarten` < `grade_1` … < `grade_6` (application-level sort key, not DB ordering).

**Alignment:** Matches frontend `CHILD_GRADE_OPTIONS` in `childProfileFields.ts`.

---

### 3.2 `DifficultyLevel`

Challenge level for **how hard** content is. Independent of grade.

| Prisma value | Display label |
|--------------|---------------|
| `easy` | Easy |
| `medium` | Medium |
| `hard` | Hard |

**Ordering:** `easy` < `medium` < `hard` (application-level).

---

### 3.3 `LearningCategory`

Exactly **one** category per quiz. No `CategoryGroup` enum in v1.

#### Academic

| Prisma value | Display label |
|--------------|---------------|
| `math` | Math |
| `science` | Science |

#### Cognitive skills

| Prisma value | Display label |
|--------------|---------------|
| `pattern_recognition` | Pattern Recognition |
| `memory` | Memory |
| `sequencing` | Sequencing |
| `problem_solving` | Problem Solving |
| `critical_thinking` | Critical Thinking |
| `visual_reasoning` | Visual Reasoning |

**Application grouping (code only, not DB):**

- Academic: `math`, `science`
- Cognitive: all other `LearningCategory` values

---

### 3.4 Existing enums (unchanged)

- `UserRole` — `parent`, `admin`
- `QuizAttemptStatus` — `in_progress`, `completed`, `abandoned`

---

## 4. Final Prisma schema changes

Below is the **target state** for content-related models. Unlisted models (`User`, `ParentProfile`, etc.) are unchanged.

### 4.1 Prisma enum block (add to `schema.prisma`)

```prisma
enum GradeLevel {
  pre_k
  kindergarten
  grade_1
  grade_2
  grade_3
  grade_4
  grade_5
  grade_6
}

enum DifficultyLevel {
  easy
  medium
  hard
}

enum LearningCategory {
  math
  science
  pattern_recognition
  memory
  sequencing
  problem_solving
  critical_thinking
  visual_reasoning
}
```

---

### 4.2 `Child` (target)

```prisma
model Child {
  id                  Int         @id @default(autoincrement())
  parentId            Int         @map("parent_id")
  name                String
  username            String      @unique
  pinHash             String      @map("pin_hash")
  age                 Int?
  dateOfBirth         DateTime?   @map("date_of_birth") @db.Date
  gradeLevel          GradeLevel? @map("grade_level")
  avatarUrl           String?     @map("avatar_url")
  learningPreferences Json        @default("{}") @map("learning_preferences")
  isActive            Boolean     @default(true) @map("is_active")
  createdAt           DateTime    @default(now()) @map("created_at")
  updatedAt           DateTime    @updatedAt @map("updated_at")

  user         User          @relation(fields: [parentId], references: [id], onDelete: Cascade)
  quizAttempts QuizAttempt[]

  @@index([parentId])
  @@index([gradeLevel])
  @@map("children")
}
```

**Notes:**

- `gradeLevel` column name stays `grade_level` in PostgreSQL; type changes from `TEXT` to enum.
- **Post-migration goal:** `gradeLevel` required on **new** child creates (validator); existing nulls fixed in backfill phase before NOT NULL if desired.

---

### 4.3 `Quiz` (target)

```prisma
model Quiz {
  id               Int              @id @default(autoincrement())
  slug             String           @unique
  title            String
  description      String?
  category         LearningCategory
  gradeLevel       GradeLevel       @map("grade_level")
  difficultyLevel  DifficultyLevel  @default(medium) @map("difficulty_level")
  subject          String?          // DEPRECATED — remove after FE/Analytics cutover
  timeLimitMinutes Int?             @map("time_limit_minutes")
  passPercentage   Int              @default(60) @map("pass_percentage")
  isPublished      Boolean          @default(true) @map("is_published")
  createdAt        DateTime         @default(now()) @map("created_at")
  updatedAt        DateTime         @updatedAt @map("updated_at")

  questions QuizQuestion[]
  attempts  QuizAttempt[]

  @@index([isPublished, gradeLevel, category, difficultyLevel])
  @@index([category])
  @@map("quizzes")
}
```

**Rules:**

| Field | Rule |
|-------|------|
| `category` | **Required** — exactly one `LearningCategory` per quiz |
| `difficultyLevel` | **Required** — default difficulty for all questions in quiz |
| `gradeLevel` | **Required** — primary target grade for catalog |
| `slug` | **Required, unique** — stable key for seed/import |
| `subject` | Legacy only; nullable until deprecation migration |

---

### 4.4 `QuizQuestion` (target)

```prisma
model QuizQuestion {
  id                   Int              @id @default(autoincrement())
  quizId               Int              @map("quiz_id")
  questionText         String           @map("question_text")
  orderIndex           Int              @default(0) @map("order_index")
  difficultyLevel      DifficultyLevel? @map("difficulty_level")
  topic                String?          @db.VarChar(255)
  skillArea            LearningCategory? @map("skill_area")
  estimatedTimeSeconds Int?             @map("estimated_time_seconds")

  quiz    Quiz                 @relation(fields: [quizId], references: [id], onDelete: Cascade)
  options QuizQuestionOption[]
  answers QuizAttemptAnswer[]

  @@index([quizId])
  @@index([quizId, difficultyLevel])
  @@index([skillArea])
  @@map("quiz_questions")
}
```

**Effective difficulty (application rule, not stored):**

```text
effectiveDifficulty(question) =
  question.difficultyLevel ?? quiz.difficultyLevel
```

**Field semantics:**

| Field | Required? | Purpose |
|-------|-----------|---------|
| `difficultyLevel` | Optional | Override quiz default when set |
| `topic` | Optional | Fine-grained unit label (e.g. "Repeating patterns") |
| `skillArea` | Optional | Override when quiz spans multiple skills; default = quiz.`category` in seed/app layer |
| `estimatedTimeSeconds` | Optional | Expected item duration for analytics |

---

### 4.5 `QuizQuestionOption` (unchanged)

No schema changes for foundation.

---

### 4.6 `QuizAttempt` (unchanged)

Optional future addition (not in v1 migration): `difficultyLevelAtAttempt DifficultyLevel?` snapshot — **deferred**.

---

### 4.7 `QuizAttemptAnswer` (target)

```prisma
model QuizAttemptAnswer {
  id               Int       @id @default(autoincrement())
  attemptId        Int       @map("attempt_id")
  questionId       Int       @map("question_id")
  selectedOptionId Int?      @map("selected_option_id")
  isCorrect        Boolean   @default(false) @map("is_correct")
  timeTakenSeconds Int?      @map("time_taken_seconds")
  answeredAt       DateTime? @map("answered_at")

  attempt        QuizAttempt         @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question       QuizQuestion        @relation(fields: [questionId], references: [id], onDelete: Cascade)
  selectedOption QuizQuestionOption? @relation(fields: [selectedOptionId], references: [id], onDelete: SetNull)

  @@unique([attemptId, questionId])
  @@index([attemptId])
  @@index([questionId])
  @@map("quiz_attempt_answers")
}
```

**Submit behavior (future implementation):** Set `answeredAt = now()` per answer row when attempt is submitted (in addition to existing `timeTakenSeconds`).

---

## 5. Difficulty inheritance contract

Documented for services, analytics, and future adaptive logic:

```text
function effectiveDifficulty(question, quiz):
  return question.difficultyLevel ?? quiz.difficultyLevel
```

- **Quiz** always has `difficultyLevel` (NOT NULL).
- **Question** may omit `difficultyLevel` to use quiz default.
- Analytics aggregations by difficulty should use **effective** difficulty at read time unless historical snapshot is added later.

---

## 6. Migration plan

### Phase M0 — Preconditions

- [ ] This spec approved (done).
- [ ] Backup production/staging DB if applicable.
- [ ] Run content audit (`scripts/audit-quiz-content.mjs`) and child grade quality report.

---

### Phase M1 — Additive schema (no NOT NULL on new enums yet)

**Migration name (suggested):** `YYYYMMDD_adaptive_content_foundation_additive`

1. Create PostgreSQL enums: `GradeLevel`, `DifficultyLevel`, `LearningCategory`.
2. Add columns (all nullable initially except where safe):

   | Table | Column | Type |
   |-------|--------|------|
   | `children` | `grade_level` | Change strategy — see M1b |
   | `quizzes` | `slug` | `TEXT UNIQUE` nullable first |
   | `quizzes` | `category` | `LearningCategory` nullable |
   | `quizzes` | `difficulty_level` | `DifficultyLevel` nullable |
   | `quizzes` | `grade_level_new` | **Avoid** — prefer in-place type change in M2 |
   | `quiz_questions` | `difficulty_level` | `DifficultyLevel` nullable |
   | `quiz_questions` | `topic` | `VARCHAR(255)` nullable |
   | `quiz_questions` | `skill_area` | `LearningCategory` nullable |
   | `quiz_questions` | `estimated_time_seconds` | `INT` nullable |
   | `quiz_attempt_answers` | `answered_at` | `TIMESTAMP` nullable |

**M1b — Child `grade_level` type change (single migration or M2):**

PostgreSQL cannot cast arbitrary text to enum safely in one step. Recommended approach:

1. Add `grade_level_enum` `"GradeLevel"` nullable on `children`.
2. Backfill (Phase M3).
3. Drop `grade_level` text column; rename `grade_level_enum` → `grade_level` **or** swap via Prisma `@map`.

**Quizzes `grade_level`:** Same pattern if column is currently `TEXT` (`2nd Grade`).

**Safer Prisma approach:**

- Migration 1: add new enum columns alongside legacy text (`grade_level_legacy` rename + new enum column).
- Migration 2: backfill.
- Migration 3: drop legacy, enforce NOT NULL.

For minimal churn, **one migration file** can:

1. Create enums.
2. Add `quizzes.slug`, `quizzes.category`, `quizzes.difficulty_level` as nullable enum columns (keep old `grade_level` text).
3. Add question + answer columns.
4. Do **not** drop `subject` yet.

---

### Phase M2 — Backfill data (script, idempotent)

**Script (suggested):** `prisma/scripts/backfill-adaptive-content.mjs`

#### Child `grade_level` text → `GradeLevel`

| Input pattern (examples) | `GradeLevel` |
|--------------------------|--------------|
| `Pre-K`, `pre k` | `pre_k` |
| `Kindergarten`, `K` | `kindergarten` |
| `Grade 1`, `1st Grade`, `first grade` | `grade_1` |
| `Grade 2`, `2nd Grade` | `grade_2` |
| … | … |
| `Grade 6`, `6th Grade` | `grade_6` |
| Unmapped (`2`, `3nd Grade`, null) | `NULL` + log to report |

#### Quiz legacy fields → new enums

| Quiz title | `slug` | `gradeLevel` | `category` | `difficultyLevel` |
|------------|--------|--------------|------------|-------------------|
| Pattern Puzzles | `pattern-puzzles` | `grade_2` | `pattern_recognition` | `easy` |
| World Explorer | `world-explorer` | `grade_3` | `science` | `easy` |
| Logic Lab | `logic-lab` | `grade_4` | **`critical_thinking`** | `medium` |

**Legacy `subject` → `category` (for any row still using text only):**

| Legacy `subject` contains | `LearningCategory` |
|---------------------------|-------------------|
| math, pattern, cognitive | `math` or `pattern_recognition` (prefer explicit seed table above) |
| science, world, gk, general | `science` |
| iq, logic, reasoning | **`critical_thinking`** (Logic Lab uses seed row, not inference) |

#### Questions

- `difficultyLevel` = `null` (inherit quiz default).
- `skillArea` = `null` (effective skill = quiz.`category`).
- `topic` = optional short label per question in seed v2.
- `estimatedTimeSeconds` = optional (e.g. 30–60 for demo).

#### Attempt answers

- `answeredAt`: backfill from parent attempt `completedAt` or `startedAt` where answer exists and `answeredAt` is null (best-effort historical).

---

### Phase M3 — Enforce constraints

**Migration name (suggested):** `YYYYMMDD_adaptive_content_not_null`

1. `quizzes.slug` — NOT NULL UNIQUE (assign slug to any row missing one before alter).
2. `quizzes.category` — NOT NULL.
3. `quizzes.difficulty_level` — NOT NULL DEFAULT `medium`.
4. `quizzes.grade_level` — NOT NULL (enum column).
5. `children.grade_level` — NOT NULL optional per product policy (recommend NOT NULL for new writes only until manual cleanup of bad rows).

6. Drop or retain `quizzes.subject`:
   - **Retain** through Phase M4 dual-read.
   - **Drop** in Phase M5 after Analytics/FE verified.

---

### Phase M4 — Application layer (dual-read, additive API)

| Layer | Change |
|-------|--------|
| Quiz DTO | Emit `category`, `difficulty_level`, `grade_level` (enum strings) + legacy `subject` |
| Child DTO | Emit enum `grade_level` + display label |
| Validators | `LearningCategory`, `GradeLevel`, `DifficultyLevel` on quiz create/update (admin future) |
| Analytics | Prefer `quiz.category`; fallback `normalizeSubject(quiz.subject)` |
| Recommendations | Map `suggestedDifficulty` from `DifficultyLevel` ordinals later |

**No catalog filtering by grade in this phase** unless separately scheduled.

---

### Phase M5 — Deprecation cleanup

1. Remove `quizzes.subject` column.
2. Remove legacy text grade columns if duplicate.
3. Update seed to never write `subject`.
4. Update docs and remove COMPAT fallbacks.

---

### Rollback strategy

- M1 additive: rollback = drop new columns/enums (if no data dependency).
- M3 NOT NULL: rollback requires downgrade migration restoring nullable + legacy columns.
- Keep DB backup before M3.

---

## 7. Seed content strategy

### 7.1 Goals

- Idempotent dev/demo catalog aligned with approved taxonomy.
- **No destructive** `deleteMany` on questions for existing slugs in production path.
- Every seeded quiz has: `slug`, `category`, `gradeLevel`, `difficultyLevel`.
- Questions use **quiz default difficulty** unless override specified in seed spec.

### 7.2 Seed file structure (future `quizSeed.v2.js`)

```text
quizSeed/
  catalog.js          // QUIZ_CATALOG constant array
  taxonomy.js         // re-exports enum values + display labels
  upsertQuiz.js         // slug-based upsert logic
```

### 7.3 Approved catalog (v1 demo)

| slug | title | gradeLevel | category | difficultyLevel | timeLimitMinutes |
|------|-------|------------|----------|-------------------|------------------|
| `pattern-puzzles` | Pattern Puzzles | `grade_2` | `pattern_recognition` | `easy` | 10 |
| `world-explorer` | World Explorer | `grade_3` | `science` | `easy` | 12 |
| `logic-lab` | Logic Lab | `grade_4` | `critical_thinking` | `medium` | 15 |

**Deprecated seed fields:**

- Do **not** write `subject` in new seed (column optional until dropped).
- Do **not** use free-text `2nd Grade` — use `GradeLevel` enum only.

### 7.4 Question seed shape (per question)

```javascript
{
  text: string,
  options: string[],
  correctIndex: number,
  // Optional overrides:
  difficultyLevel?: 'easy' | 'medium' | 'hard',  // omit → inherit quiz
  topic?: string,
  skillArea?: LearningCategory,  // omit → inherit quiz.category
  estimatedTimeSeconds?: number,
}
```

**v1 demo:** All questions omit `difficultyLevel` and `skillArea`; optional `topic` strings for future reports.

### 7.5 Upsert algorithm (replace current title-only + question wipe)

```text
FOR each catalog entry by slug:
  UPSERT quiz ON slug
    SET metadata fields (title, description, category, gradeLevel, difficultyLevel, ...)
  FOR each question in catalog (by orderIndex):
    UPSERT question ON (quizId, orderIndex) OR stable question slug (future)
    SYNC options for question
  DO NOT delete entire question set if quiz exists (avoids orphaning attempt FKs)
```

**Development-only reset:** Separate `npm run db:reset-catalog` command if full wipe needed locally — not default `db:seed`.

### 7.6 Demo child alignment

`seed.js` demo child:

- `age: 8`
- `gradeLevel: grade_2` (enum, not `"2nd Grade"`)

Ensures future grade-filter QA matches Pattern Puzzles band.

### 7.7 Content expansion (post-foundation)

New quizzes must specify all required fields. Suggested CSV import columns:

`slug, title, description, grade_level, category, difficulty_level, time_limit_minutes, pass_percentage, is_published`

Question rows in separate CSV keyed by `quiz_slug, order_index, ...`.

---

## 8. Backward compatibility matrix

| Consumer | During M1–M3 | After M5 |
|----------|--------------|----------|
| `GET /api/quizzes` | +`category`, `difficulty_level`, enum `grade_level`; keep `subject` | `subject` removed |
| Analytics subject breakdown | `category` + fallback | `category` only |
| Parent Reports | Map category labels | Same |
| FE `subjectToQuizType()` | Map from `category` first | Deprecate string heuristics |
| Existing attempts | Join quiz; backfilled metadata | Unchanged rows |

---

## 9. Risk analysis (approved design)

| Risk | Mitigation |
|------|------------|
| Enum migration on existing `grade_level` text | Two-column or rename strategy; backfill report |
| Logic Lab miscategorized | **Locked** to `critical_thinking` in seed + backfill table |
| Required `category` blocks incomplete rows | Backfill before NOT NULL |
| Seed wipe breaks attempts | Slug-based upsert without mass question delete |
| Question override confusion | Document `effectiveDifficulty()` in quiz services |

---

## 10. Implementation order (when approved to code)

| Step | Deliverable | Modifies runtime? |
|------|-------------|-------------------|
| 1 | Prisma enums + M1 migration | No |
| 2 | Backfill script + audit output | Data only |
| 3 | M3 NOT NULL migration | No |
| 4 | `shared/content/taxonomy` + mappers | Additive reads |
| 5 | `quizSeed` v2 (approved catalog) | Dev content |
| 6 | Child validator enum | Writes on create/update |
| 7 | Quiz submit sets `answeredAt` | Minor behavior (timestamp) |
| 8 | Analytics dual-read `category` | Should match charts |
| 9 | Drop `subject` (M5) | Coordinated release |
| 10 | Grade-filtered catalog API | New feature (separate task) |

---

## 11. Verification checklist (post-implementation)

- [ ] All quizzes have non-null `slug`, `category`, `gradeLevel`, `difficultyLevel`.
- [ ] Logic Lab `category = critical_thinking`.
- [ ] No quiz has multiple categories.
- [ ] Questions with null `difficultyLevel` resolve to quiz default in service unit tests.
- [ ] `audit-quiz-content.mjs` reports enum fields correctly.
- [ ] Analytics overview still returns data (no regression).
- [ ] Existing `quiz_attempts` remain valid.

---

## 12. Related documents

- [FUTURE_ENHANCEMENTS.md](../FUTURE_ENHANCEMENTS.md) — adaptive engine, AI deferred
- [DISCIPLINE.md](../DISCIPLINE.md) — module boundaries
- Content audit (conversation / `scripts/audit-quiz-content.mjs`)

---

**End of approved specification.** Implementation PRs must reference this document version and must not introduce `CategoryGroup`, AI services, or real-time adaptive questioning without a new spec amendment.
