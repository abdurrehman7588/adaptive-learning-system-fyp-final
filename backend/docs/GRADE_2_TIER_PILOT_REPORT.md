# Grade 2 Adaptive Difficulty Tier Pilot — Report

**Date:** May 2026  
**Scope:** Grade 2 only — Math, Science, Pattern Recognition (3 tiers each). Other grades unchanged.

---

## 1. New quizzes added

| # | Slug | Title | Category | Difficulty | Questions |
|---|------|-------|----------|------------|-----------|
| 1 | `grade_2-science-easy` | Grade 2 Science Easy: My World | science | easy | 6 |
| 2 | `grade_2-science-hard` | Grade 2 Science Hard: Matter & Systems | science | hard | 6 |
| 3 | `grade_2-math-medium` | Grade 2 Math Medium: Add & Subtract | math | medium | 6 |
| 4 | `grade_2-math-hard` | Grade 2 Math Hard: Stretch to 100 | math | hard | 6 |
| 5 | `grade_2-pattern_recognition-easy` | Grade 2 Patterns Easy: What Comes Next? | pattern_recognition | easy | 6 |
| 6 | `grade_2-pattern_recognition-hard` | Grade 2 Patterns Hard: Rules & Tables | pattern_recognition | hard | 6 |

### Existing Grade 2 quizzes (updated labels / explicit tier)

| Slug | Title | Difficulty |
|------|-------|------------|
| `grade_2-math-easy` | Grade 2 Math: Two-Digit Numbers | easy |
| `grade_2-science-medium` | Grade 2 Science Medium: Matter & Life | medium |
| `grade_2-pattern_recognition-medium` | Grade 2 Pattern Recognition Medium | medium |
| `grade_2-memory-medium` | Grade 2 Memory | medium (single-tier) |
| `grade_2-problem_solving-medium` | Grade 2 Problem Solving | medium (single-tier) |
| `grade_2-critical_thinking-medium` | Grade 2 Critical Thinking | medium (single-tier) |

**Grade 2 totals:** 12 published quizzes (6 new + 6 existing).  
**System total:** 54 published quizzes (48 + 6).

**Source files:** `prisma/quiz/catalog/grades/grade_2_pilot_tiers.js`, `grade_2.js`.

---

## 2. Routing logic used

### Category status → recommended tier

| Category status | Avg % | Recommended difficulty |
|-----------------|-------|------------------------|
| needs_practice | &lt; 60% | **easy** |
| progressing | 60–79% | **medium** |
| mastery | ≥ 80% | **hard** |
| unattempted | — | **medium** |

Rules: `adaptiveRules.js` → `recommendedDifficultyForStatus()`.

### Grade 2 pilot selection

For `gradeLevel === 'grade_2'` and categories **math**, **science**, **pattern_recognition**:

1. Compute category status from all completed attempts in that category (any tier).
2. Map status → `recommendedDifficulty`.
3. Select the published quiz with matching `gradeLevel`, `category`, and `difficultyLevel` via `selectQuizForAdaptiveTier()` (`adaptiveTierRouting.js`).
4. Emit **one recommendation per category** (not one per quiz).

**Fallback (pilot cells only):** If exact tier missing, pick nearest tier (step down, then step up). With full pilot content, fallbacks should not trigger.

### Non-pilot Grade 2 categories

**memory**, **problem_solving**, **critical_thinking** — still one quiz each; recommendation uses that quiz (tier label may differ from recommended band).

### Other adaptive grades (Pre-K – G3 except G2 tier pilot)

Unchanged: legacy loop over all grade-filtered quizzes (no multi-tier routing).

### Response fields

Each recommendation includes:

- `recommendedDifficulty` — target tier from status  
- `difficultyLevel` — actual quiz tier  
- `tierMatched` — `true` when they align (pilot categories)

---

## 3. Test scenarios

| # | Scenario | Setup | Expected routed quiz |
|---|----------|--------|-------------------------|
| 1 | Science needs practice | G2 student; science attempts avg &lt; 60% | `grade_2-science-easy` |
| 2 | Science progressing | Science avg 60–79% | `grade_2-science-medium` |
| 3 | Science mastery | Science avg ≥ 80% | `grade_2-science-hard` |
| 4 | Math retry | Last math attempt &lt; 60% (any tier) | `grade_2-math-easy` (needs_practice → easy) |
| 5 | Math challenge | Math avg ≥ 80% | `grade_2-math-hard` |
| 6 | Patterns unattempted | No pattern attempts | `grade_2-pattern_recognition-medium` |
| 7 | Memory single-tier | Any memory status | `grade_2-memory-medium` only option |
| 8 | Catalog scope | G2 student lists quizzes | 12 quizzes, all `grade_2` |
| 9 | Parent other grades | Pre-K child | Still 6 quizzes (unchanged) |
| 10 | Recommendations count | G2 `/children/me/recommendations` | 6 rows (one per category) |

---

## 4. Verification steps

### Automated

```bash
cd backend
npm run db:seed
npm run verify:grade2-tier-pilot
npm run verify:content-coverage
npm run verify:grade-filtering
npm run verify:grade-isolation
```

**`verify:grade2-tier-pilot`** checks:

- 12 Grade 2 published quizzes  
- Pilot categories have easy + medium + hard  
- All 6 new slugs exist  
- Student recommendations return 6 items  
- Pilot categories: `difficultyLevel` matches status-driven tier (`tierMatched === true`)

### Manual (UI)

1. Log in as `demokid` / `1234` (Grade 2).  
2. **Quizzes** — confirm 12 quizzes; science/math/patterns each show three difficulty slugs.  
3. **Dashboard** — What’s next points at tier-matched quiz; only one rec per category in API.  
4. Complete science quiz with low score → next science rec should be **easy** tier slug.

### Regression

- Grades Pre-K, K, G1, G3–G6: still **6** quizzes per grade.  
- Total published count **54**.

---

## Files touched (implementation reference)

| Area | Path |
|------|------|
| New content | `prisma/quiz/catalog/grades/grade_2_pilot_tiers.js` |
| Grade 2 catalog | `prisma/quiz/catalog/grades/grade_2.js` |
| Catalog validation | `prisma/quiz/catalog/index.js`, `catalog/utils.js` |
| Tier routing | `src/modules/adaptive/adaptiveTierRouting.js` |
| Recommendations | `src/modules/adaptive/adaptiveRecommendations.service.js` |
| Verify script | `scripts/verify-grade2-tier-pilot.mjs` |

---

## Next steps (out of pilot scope)

- Extend tier triplets to Pre-K–G1 and G3 using same pattern.  
- Wire tier routing when `tierMatched` is false for non-pilot cells.  
- Do **not** enable AI until tier coverage and routing are verified per grade band.
