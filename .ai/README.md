# Genshu AI development workflow

This playbook helps coding agents work from repository evidence rather than
conversation memory. It is shared across agent tools.

## Sources and scope

- `.ai/PROJECT.md`: product truth, release scope, architecture, and open decisions.
- `AGENTS.md`: short entry point and required verification.
- `.agents/skills/`: a small set of optional, task-specific web development skills.
- `.ai/scripts/verify.ts`: canonical deterministic verification.
- `docs/`: detailed feature documentation when a feature needs it.

The `.ai/policies/`, `.ai/skills/`, and `.ai/runs/` directories do not
currently define active rules or workflows. Do not assume a Worker/Reviewer
orchestration loop exists. Add a policy, skill, or automation only when repeated
project work justifies its maintenance.

## Development loop

1. Read `.ai/PROJECT.md` and identify the current release boundary.
2. Inspect the relevant source, tests, framework guide, and optional skill.
3. State the smallest coherent change and any unresolved product decision.
4. Implement using the existing stack where practical.
5. Verify the behavior and run `bun run verify` before reporting completion.
6. Review the actual diff for correctness, permissions, regressions, and UX.
7. Report evidence and limitations. Update documentation when it becomes wrong.

For broad tasks, split work into reviewable milestones. Agent continuation
features may help with a well-defined milestone, but are not a substitute for
acceptance criteria, verification, or review.

## Decision boundaries

Do not silently change the database platform, authentication approach, role
model, hosting architecture, or major dependencies. Propose the specific
tradeoff and update `.ai/PROJECT.md` when the decision is accepted. The
initial release targets Vercel and Supabase PostgreSQL, with local development
and versioned migrations. Published student content uses server-only Postgres.js
queries with a private `POSTGRES_URL`; student routes filter to published rows.
Staff login uses Supabase Auth and server-side staff_members roles. Sensei may
edit materials and practice; Tantōsha currently has read-only staff access.
The integration needs real Supabase Auth and browser verification before release.

User-facing learning data used officially must persist on the server.
Anonymous practice in the first release has no official student attempt
history. Treat attendance, assignments, and exams as prototype workflows until
their own release requirements are verified.

## Verification

`bun run verify` performs type checking, linting, locale validation,
Graphify update, diff checks, and a production build. Add focused behavior
tests when they protect an important user or permission flow. Browser checks
should cover the changed workflow on a phone-sized and desktop viewport.

Report what actually passed. If a required check cannot run or fails, state
the blocker and do not call the implementation complete.

## Repository knowledge

Store stable project decisions in `.ai/PROJECT.md`, detailed feature
information in `docs/`, reusable procedures in relevant skills, and
deterministic checks in `.ai/scripts/`. Keep temporary run output out of
project truth. Do not duplicate active instructions across these files.

## Local learning-content database

1. Install/start local PostgreSQL and create a database plus an application login.
2. Copy `.env.example` to `.env.local` and set the server-only `POSTGRES_URL`.
3. Run `bun run db:migrate` and `bun run db:seed`. Both commands are safe to rerun.
4. Start the app with `bun run dev`; `/` opens the published materials catalog.

The app role needs read access for its server queries. Do not grant database
credentials to browser code or create anonymous write grants. Supabase runtime
connections should use an appropriate pooler URL and keep prepared statements
disabled for transaction-pooler compatibility.

## Staff access setup

Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY from
the Supabase project. Keep POSTGRES_URL server-only. Apply migrations before
using the staff area. Create staff identities through Supabase Auth using an
invitation or administrator workflow; public self-registration is not exposed
in Genshu. Insert the identity UUID in staff_members with role SENSEI or
TANTOSHA and an appropriate display_name. Only an active SENSEI may write
learning content. The role row is authoritative even if a session claims
otherwise. Test login, expired-session refresh, denied access, and an actual
create/edit/publish cycle against the chosen Supabase project before release.

Run db:seed only against local PostgreSQL. It overwrites its sample records and
is intentionally blocked for remote URLs.
