# Backend implementation specifications

**Stage:** Implementation planning (no application code in spec documents).

**Architecture reference:** Approved modular monolith plan — compatibility-first with existing React frontend.

**Discipline rules (mandatory):** [../DISCIPLINE.md](../DISCIPLINE.md)

## Spec index

| Order | Document | Status | Depends on |
|-------|----------|--------|------------|
| — | Shared kernel (envelope, middleware host, config) | **Implemented** | — |
| 1 | [01-auth-module.md](./01-auth-module.md) | **Implemented** | Shared kernel |
| 2 | [02-parent-module.md](./02-parent-module.md) | **Implemented** | Auth |
| 3 | [03-child-module.md](./03-child-module.md) | Ready for review | Auth, Parent |
| 4 | Quiz module | Pending | Auth, Parent, Child |
| 5 | Analytics compatibility | Pending | Quiz, Child |
| 6 | Rewards compatibility | **Implemented** | Analytics |
| 7 | [07-adaptive-content-foundation.md](./07-adaptive-content-foundation.md) | **M1–M3 implemented** | Quiz, Child |
| 8 | [08-adaptive-difficulty-rules.md](./08-adaptive-difficulty-rules.md) | **Implemented (rules v1)** | 07, Analytics |
| — | [CURRICULUM_BLUEPRINT.md](../curriculum/CURRICULUM_BLUEPRINT.md) | **Content blueprint** | Full grade grid |
| — | [CONTENT_COVERAGE_REPORT.md](../CONTENT_COVERAGE_REPORT.md) | **Coverage report** | `npm run report:content-coverage` |

## Approved build sequence (Auth + Parent)

```mermaid
flowchart LR
  SK[Shared kernel]
  AUTH[Auth module]
  PARENT[Parent module]
  CHILD[Child module next]
  SK --> AUTH
  AUTH --> PARENT
  PARENT --> CHILD
```

1. Shared kernel — response envelope, `asyncHandler`, `AppError`, DB pool, `authenticate` / `authorize` contracts
2. Auth module — steps A1–A7 in [01-auth-module.md](./01-auth-module.md)
3. Parent module — steps P1–P7 in [02-parent-module.md](./02-parent-module.md)
4. Child module — [03-child-module.md](./03-child-module.md) (review, then implement C1–C8)

## What each spec contains

- Module responsibilities and forbidden boundaries
- Layered internal flows (no Express/Prisma code)
- HTTP contracts as DTO tables (not route implementations)
- Token and auth lifecycle
- Middleware and validation rules
- Service/repository/port boundaries
- Frontend compatibility mapping to `frontend/src/api/*`
- Error codes and envelope usage
- Migration **ownership** (not DDL)
- Phased implementation order and acceptance criteria

## Explicitly excluded from all specs

- Express controllers, route wiring, OAuth SDK code
- ORM/Prisma models, SQL DDL
- Production deployment configs
- Full application source

## Review checklist (Auth + Parent)

Before authorizing code generation:

- [ ] Auth Google + email JWT shapes match [frontend/src/api/auth.ts](../../../frontend/src/api/auth.ts)
- [ ] `PUT /auth/profile` vs Parent preferences split is understood
- [ ] Student `POST /auth/student/login` port contract agreed with upcoming Child spec
- [ ] Parent module does not duplicate `GET /api/children`
- [ ] Dashboard remains Analytics-driven; Parent bootstrap optional

## Review checklist (Child)

- [ ] `ChildAuthPort` / `ChildQueryPort` match Auth §6 and Parent §6
- [ ] `POST /children` requires username + PIN; thin FE fields only
- [ ] Active child remains client-side; list order `created_at ASC`
- [ ] snake_case `grade_level` / `avatar_url` preserved for existing extractors
- [ ] Hard delete + cascade coordinated with Quiz spec

## After Child approval

Request implementation specs for: **Quiz → Analytics compatibility → Rewards compatibility**.

Adaptive engine and advanced AI planning remain deferred.
