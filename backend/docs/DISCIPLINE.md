# Backend implementation discipline

These rules apply to **every module** (Shared Kernel, Auth, Parent, Child, Quiz, Analytics, Rewards). Code reviews and new PRs must comply before merge.

## 1. Repository isolation

- A module may only use **its own** repositories (e.g. `UserRepository` inside Auth).
- **Forbidden:** `import`ing another module’s repository or calling `prisma.<otherModel>` from foreign services.

## 2. Cross-module communication

- Modules talk through **ports/contracts** (interfaces) defined in the consumer or in `shared/ports/`.
- Wiring happens in the **composition root** (`app.js` or `createXModule(deps)`), not inside repositories.
- Example: Auth → `ChildAuthPort`, Parent → `ChildQueryPort` (implemented by Child when ready).

## 3. No persistence in HTTP handlers

- HTTP handlers (controllers) must not import Prisma or repositories.
- Flow: **handler → service → repository**.

## 4. Thin routes

- Route files only: path, middleware chain, bind controller methods.
- **Forbidden:** validation rules, branching business rules, or service construction beyond delegating to a module factory.

## 5. Temporary compatibility code

- Stubs, shims, and FE-compat paths must live under `adapters/` or `compat/` and include a header comment: `// COMPAT:` or `// TEMP:` with removal condition.
- Do not scatter compat logic across services.

## 6. Frontend compatibility first

- Restore existing [frontend/src/api/](../../../frontend/src/api/) contracts before adding new fields or routes.
- New endpoints are additive; breaking changes require FE coordination.

## 7. Shared kernel scope

- Shared kernel: HTTP envelope, errors, logging, config, generic middleware contracts.
- **Avoid** importing module-specific services from shared (e.g. shared must not import `TokenService` from Auth).
- JWT verify/sign lives in `shared/auth/jwt.js`; Auth `TokenService` may wrap it for module-specific claims builders.

## 8. Infrastructure restraint

- No RabbitMQ, FastAPI sidecar, or extra services until **Quiz + Analytics compatibility** are stable.
- Single Node process + PostgreSQL for Phase 1.

## Composition checklist (per new module)

| Check | |
|-------|---|
| Repository used only inside owning module | |
| Ports registered in `app.js` / module factory | |
| Controllers delegate to services only | |
| Routes file has no Prisma / business rules | |
| FE client types still satisfied | |
| Compat code labeled and isolated | |
