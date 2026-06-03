# Kindergarten Tier Pilot — Complete

Adaptive difficulty tiers (Easy / Medium / Hard) are enabled for **Kindergarten only** across all six frozen categories:

- Math
- Science
- Pattern Recognition
- Memory
- Problem Solving
- Critical Thinking

## What changed

| Area | Change |
|------|--------|
| Catalog | 6 existing quizzes labeled **easy**; **12 new** medium + hard quizzes |
| Routing | `kindergarten` uses the same tier routing as `grade_2` (rules unchanged) |
| Other grades | Not modified (Grade 1–3 content, Pre-K, G4–6, adaptive rule thresholds) |

## Verification mapping

| Category status | Recommended tier |
|-----------------|------------------|
| needs_practice | easy |
| progressing | medium |
| mastery | hard |
| unattempted | medium |

## Commands

```bash
npm run db:seed
npm run verify:kindergarten-tier-pilot
npm run report:kindergarten-tier-coverage
npm run verify:content-coverage
```

## Catalog totals

- Kindergarten: **18** quizzes (6 × 3 tiers)
- Full published catalog: **72** quizzes (48 base + 12 G2 extras + 12 K extras)

## Remaining adaptive gaps (system-wide)

- **Pre-K, Grade 1, Grades 3–6:** still one quiz per category (no tier ladder).
- **Grade 2:** tier pilot complete (unchanged by this work).
- **AI / ML / question-level adaptation:** out of scope.
