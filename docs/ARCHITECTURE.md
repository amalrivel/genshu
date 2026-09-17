# Genshu — Architecture

**Status:** Initial architecture  
**Date:** September 17, 2026

## 1. Architecture Goals

Genshu should use the simplest architecture that reliably supports the MVP.

The architecture prioritizes:

1. clarity
2. maintainability
3. correctness
4. low operational complexity
5. good user experience
6. reasonable portability

Architectural complexity must be justified by an existing product requirement rather than hypothetical future scale.

Genshu initially targets fewer than 30 invited participants.

## 2. Application Architecture

Genshu is a single full-stack Next.js application.

### Framework

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

A separate frontend and backend application will not be maintained.

The previous Vite + Express architecture is not carried forward into the Next.js rebuild.

### Package Management and Tooling

Bun is the project package manager and primary local JavaScript tooling.

Use:

- `bun install`
- `bun add`
- `bun remove`
- `bunx`
- `bun run`

Application code should not depend on Bun-specific runtime APIs unless a future architecture decision explicitly requires them.

This keeps production deployment portable.

## 3. Next.js Boundaries

### Server Components

Use Server Components by default for:

- database-backed pages
- initial data retrieval
- layouts
- non-interactive content

Do not add `"use client"` merely for convenience.

### Client Components

Use Client Components when browser-side behavior is actually required, including:

- interactive question answering
- temporary UI state
- browser APIs
- effects
- rich client interactions

Keep client boundaries as small as practical.

### Mutations

Prefer Server Actions for mutations initiated from the Genshu application.

Examples:

- creating a topic
- editing a question
- creating a practice set
- submitting an attempt
- changing account preferences

Use Route Handlers when a real HTTP endpoint is required, such as:

- external integrations
- callbacks
- webhooks
- file-serving behavior requiring an endpoint

Do not build an internal REST API merely to connect the Next.js frontend to the same Next.js application.

## 4. Database

Use PostgreSQL.

The primary managed database provider is Supabase.

Genshu data is relational and includes relationships among:

- users
- topics
- materials
- questions
- practice sets
- attempts
- submitted answers

Database schema design will be documented separately as it is introduced.

Do not reproduce the previous database schema automatically. The new schema must be derived from the current PRD.

## 5. Database Access

Initial application data access should use the supported Supabase client.

Do not introduce an ORM during the initial MVP foundation unless a concrete requirement demonstrates that it materially improves the implementation.

Database queries must remain server-side unless direct browser access is deliberately protected using Row Level Security.

Prefer explicit and understandable queries over generic repository abstractions.

Do not introduce:

- repository layers
- service layers
- generic data-access frameworks

unless repeated application behavior creates a concrete need.

## 6. Authentication

Use Supabase Auth.

Genshu does not provide public registration.

Supported application roles:

- Participant
- Admin

Authorization must be enforced on the server and must not rely only on hidden UI elements.

Account invitation and recovery behavior must follow the final product decisions in `PRD.md` and `DECISIONS.md`.

Role information belonging to Genshu should remain application data rather than relying solely on client-controlled metadata.

## 7. Authorization

Participants may access only data permitted to their own account.

Admins may manage Genshu content and view participant results according to product requirements.

Security-sensitive operations must execute in trusted server-side code.

Supabase administrative credentials must never be exposed to the browser.

Where Row Level Security is used, policies must be treated as part of the application's authorization model and reviewed accordingly.

## 8. File Storage

Use Supabase Storage for uploaded Genshu assets unless a future requirement demonstrates a reason to use another provider.

Initial use cases include:

- question illustrations
- material illustrations

Do not store application images directly in the PostgreSQL database.

File ownership, replacement, deletion, and access policies must be defined when the upload feature is implemented.

## 9. UI State

Use React's built-in state management capabilities first.

Do not introduce Redux, Zustand, or another global-state library without a concrete requirement.

Persistent product data belongs on the server.

Temporary interaction state should remain close to the component that owns it.

## 10. Validation

Validation rules must exist on trusted server boundaries.

Client-side validation may improve user experience but must not be the only validation.

Do not introduce a validation library until validation complexity justifies one.

## 11. Deployment

The initial deployment target is Vercel.

Bun is the package manager and development tooling choice; application code should remain compatible with the deployment runtime used by Next.js hosting.

Supabase provides managed:

- PostgreSQL
- Auth
- Storage

Deployment architecture may be revisited if operational cost or platform limitations become meaningful.

## 12. Testing

Testing should follow actual product risk.

Initial priorities are:

- core business logic
- authorization behavior
- scoring
- attempt submission
- prevention of duplicate submissions

Do not build an extensive testing infrastructure before meaningful application behavior exists.

## 13. Explicit Non-Goals

The MVP architecture does not require:

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
- generic repository patterns
- speculative caching infrastructure

These may only be introduced after a concrete requirement establishes their need.

## 14. Source of Truth

Product requirements:

`docs/PRD.md`

Technical architecture:

`docs/ARCHITECTURE.md`

User experience decisions:

`docs/UI-UX.md`

Significant decisions and rationale:

`docs/DECISIONS.md`

When implementation and documentation disagree, the conflict must be identified instead of silently choosing one.