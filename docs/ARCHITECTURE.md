# Genshu — Architecture

**Status:** Current MVP architecture  
**Date:** September 19, 2026

## 1. Architecture Goals

Genshu should use the simplest architecture that reliably supports the MVP.

Priorities:

1. clarity
2. maintainability
3. correctness
4. low operational complexity
5. good user experience
6. reasonable portability

Architectural complexity must be justified by an existing product requirement, not hypothetical future scale. The initial target is fewer than 30 invited participants.

## 2. Application Architecture

Genshu is a single full-stack Next.js application.

### Current stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Bun for package management and local JavaScript tooling

A separate frontend and backend application is not part of the current architecture. The previous Vite + Express structure is not carried forward.

### Bun

Use Bun for project commands:

- `bun install`
- `bun add`
- `bun remove`
- `bunx`
- `bun run`

Do not depend on Bun-specific runtime APIs unless a concrete requirement later justifies them. Keeping application code runtime-portable reduces unnecessary coupling.

## 3. Next.js Boundaries

### Server Components

Use Server Components by default for database-backed pages, initial data retrieval, layouts, and non-interactive content.

Do not add `"use client"` merely for convenience.

### Client Components

Use Client Components only when browser-side behavior is required, including interactive question answering, temporary UI state, browser APIs, effects, and rich client interactions.

Keep client boundaries as small as practical.

### Mutations

Prefer Server Actions for mutations initiated from the Genshu application.

Use Route Handlers only when a real HTTP endpoint is required, such as an external integration, callback, webhook, or file-serving endpoint.

Do not build an internal REST API merely to connect the Next.js frontend to the same Next.js application.

## 4. Database

Genshu currently uses **PostgreSQL running locally** during development.

The database must be treated as a normal PostgreSQL database, without coupling the application to Supabase or another managed database platform.

Use one environment variable for the connection string:

```text
DATABASE_URL=postgresql://...
```

Do not commit credentials or machine-specific connection values.

Genshu data is relational and includes relationships among users, topics, materials, questions, practice sets, attempts, and submitted answers.

The schema must be derived from current product requirements rather than copied automatically from an older implementation.

When schema migrations are introduced, they must be version-controlled and reproducible. Migration tooling should remain minimal and should only be selected when database implementation actually begins.

## 5. Database Access

Do not introduce an ORM during the initial MVP foundation.

When database access is implemented, prefer a small PostgreSQL driver and explicit server-side SQL over an additional framework or abstraction layer.

Database access must remain in trusted server-side code. Browser code must never receive database credentials or connect directly to PostgreSQL.

Prefer understandable queries over generic abstractions. Do not introduce repository layers, service layers, generic data-access frameworks, caching layers, or connection abstractions unless repeated application behavior creates a concrete need.

## 6. Authentication

The product requires authenticated Participant and Admin accounts, but the authentication implementation is **not selected yet**.

For now:

- do not introduce Supabase Auth
- do not introduce another external auth provider merely for convenience
- do not implement public registration
- enforce authorization on the server once authentication is implemented

Account invitation, activation, login, and recovery behavior must follow final decisions in `PRD.md` and `DECISIONS.md`.

Application roles belong to Genshu's own data model.

## 7. Authorization

Participants may access only data permitted to their own account.

Admins may manage Genshu content and view participant results according to product requirements.

Security-sensitive operations must execute in trusted server-side code. Hiding controls in the UI is not authorization.

## 8. Files and Illustrations

No external file-storage provider is selected for the current local-development phase.

Static development assets may live in the repository when appropriate. A user-upload storage design should be introduced only when the upload workflow is implemented and its requirements are clear.

Do not store image binary data directly in PostgreSQL unless a future requirement explicitly justifies it.

## 9. UI State

Use React's built-in state management capabilities first.

Do not introduce Redux, Zustand, or another global-state library without a concrete requirement.

Persistent product data belongs on the server. Temporary interaction state should remain close to the component that owns it.

## 10. Validation

Validation rules must exist on trusted server boundaries.

Client-side validation may improve user experience but must not be the only validation.

Do not introduce a validation library until validation complexity justifies one.

## 11. Local Development and Deployment

The current architecture is optimized for local development first:

- Next.js application running locally
- local PostgreSQL
- local environment configuration

A production hosting provider, managed database, authentication provider, and object-storage provider are not current architecture decisions.

Do not add production infrastructure solely because it may be useful later. Deployment decisions should be made when the MVP is ready to be deployed and actual operational requirements are known.

## 12. Testing

Testing should follow actual product risk.

Initial priorities are core business logic, authorization behavior, scoring, attempt submission, and prevention of duplicate submissions.

Do not build extensive testing infrastructure before meaningful application behavior exists.

## 13. Explicit Non-Goals

The MVP architecture does not currently require:

- microservices
- a separate API server
- monorepo tooling
- event-driven architecture
- queues
- Redis
- global state libraries
- Kubernetes
- Docker-based local development
- GraphQL
- an ORM by default
- generic repository patterns
- speculative caching infrastructure
- Supabase
- hosted database services during local development
- third-party auth or storage services without an approved need

These may only be introduced after a concrete requirement establishes their value.

## 14. Sources of Truth

- Product requirements: `docs/PRD.md`
- Technical architecture: `docs/ARCHITECTURE.md`
- User experience decisions: `docs/UI-UX.md`
- Significant decisions and rationale: `docs/DECISIONS.md`

When implementation and documentation disagree, identify the conflict and resolve it explicitly rather than silently choosing one.
