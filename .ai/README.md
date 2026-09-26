# Genshu AI development workflow

This playbook helps coding agents work from repository evidence rather than
conversation memory. It is shared across agent tools.

## Sources and scope

- `.ai/PROJECT.md`: product truth, release scope, architecture, and open decisions.
- `AGENTS.md`: short entry point and required verification.
- `.agents/skills/`: a small set of optional, task-specific web development skills.
- `.ai/scripts/verify.ts`: canonical implementation verification.
- `.ai/scripts/check-supabase-config.ts`: focused missing-config diagnostic check.
- `.agents/rules/antigravity-rtk-rules.md`: optional Agy output filtering, with raw-output fallback.
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
initial release targets Vercel and Supabase, with local development and
versioned SQL migrations. Application data access uses Supabase Data API
through `@supabase/supabase-js`; Next.js server code uses the cookie-aware
`@supabase/ssr` client. Runtime requires only `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `POSTGRES_URL` is administration-only
for migration and database-check scripts using `psql`. Staff login and
server-side `staff_members` authorization remain unchanged. Migration 005
defines public reads of published content, Sensei reads of drafts, and
Sensei-only authoring. Tantōsha cannot author. Practice-set and question
replacement is atomic through a restricted database RPC. Review evidence and outstanding group-validation work are tracked in
`docs/release-readiness.md`. Earlier five-role tests for materials and practice
questions do not establish permission coverage for newly added group tables
or RPCs. Verify the exact changed interfaces before claiming completion.

User-facing learning data used officially must persist on the server.
Anonymous practice in the first release has no official student attempt
history. Treat attendance, assignments, and exams as prototype workflows until
their own release requirements are verified.

## Reviewer and worker boundaries

Use the role assigned in the current task. For a reviewer/support task, inspect
core application code, migrations, import data, and verification scripts
read-only. Documentation edits are allowed when the user authorizes them.
Implementation and database mutations belong to the worker's authorized task.
Do not turn a review into a code change or deployment without that scope.

For a worker task, preserve existing worktree changes, identify the relevant
acceptance criteria, implement the authorized work, and hand off an actual
diff plus evidence. Treat prior successful runs as historical context until
checked against the current revision and target environment. Do not repeatedly
continue a loop that needs unavailable credentials; state the missing access
precisely and continue independent work.

For imported content, compare the pinned source data and its original renderer.
Preserve groups, answer keys, assets, and source wording. Do not turn unused
source metadata into student-facing hints. Requirements and current behavior
must be documented separately until all acceptance checks pass.

## Verification

`bun run verify` performs type checking, linting, locale validation,
Graphify update, diff checks, and a production build. Add focused behavior
tests when they protect an important user or permission flow. Browser checks
should cover the changed workflow on a phone-sized and desktop viewport.
If a sandbox prohibits Turbopack's worker port binding, use
`bun run verify --webpack` to run the same checks with Next.js's supported
Webpack build option.

The full verifier writes tracked Graphify output and is not a read-only check.
For documentation-only work, validate links, referenced commands, consistency,
and `git diff --check`; no application build is required solely for prose edits.
For a read-only review, run focused checks that do not rewrite tracked files
and explicitly list checks omitted because they mutate the worktree.

Report the command, outcome, source revision/worktree state, date, environment,
and coverage limitations. Do not equate HTTP 200, successful import counts,
or typecheck/build success with browser interaction or role authorization.
If a required check cannot run or fails, state the blocker and do not call the
implementation complete.

## Repository knowledge

Store stable project decisions in `.ai/PROJECT.md`, detailed feature
information in `docs/`, reusable procedures in relevant skills, and
deterministic checks in `.ai/scripts/`. Keep temporary run output out of
project truth. Do not duplicate active instructions across these files.

## Local learning-content database

1. Start a local Supabase stack or use an isolated development Supabase project
   for runtime Data API and Auth. A plain PostgreSQL service supports migrations
   and checks but not app runtime queries.
2. Set the two Supabase runtime values in `.env.local`. Set `POSTGRES_URL` only
   when running administration scripts with `psql`.
3. Run `bun run db:migrate` to apply versioned migrations. Run `bun run db:seed`
   only against local PostgreSQL; never seed the configured Supabase project.
4. Run `bun run db:verify` to validate local sample publication state, or
   `bun run db:verify-permissions` to check RLS and public-role grants without
   requiring or changing sample content. The permissions check is read-only and
   can also be run against the configured Supabase project. Its current coverage
   omits illustration groups; consult `docs/release-readiness.md` before using
   a passing result as a release gate for that feature.
5. Start the app with `bun run dev`; `/` opens the published materials catalog.

The app uses the Data API with the caller's cookie session and RLS. Never put a
PostgreSQL URL or secret/service-role key in the runtime or browser.

## Staff access setup

Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY from
the Supabase project. Keep POSTGRES_URL out of app runtime. Apply migrations before
using the staff area. Create staff identities through Supabase Auth using an
invitation or administrator workflow; public self-registration is not exposed
in Genshu. Insert the identity UUID in staff_members with role SENSEI or
TANTOSHA and an appropriate display_name. Only an active SENSEI may write
learning content. The role row is authoritative even if a session claims
otherwise. Test login, expired-session refresh, denied access, and an actual
create/edit/publish cycle against the chosen Supabase project before release.

Run db:seed only against local PostgreSQL. It overwrites its sample records and
is intentionally blocked for remote URLs.
