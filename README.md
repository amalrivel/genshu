# Genshu

Genshu supports Indonesian students in Japanese scholarship learning programs.
The first release provides published materials and anonymous practice, with
Sensei content authoring and Tantōsha staff access. Student answers and scores
are temporary browser-session state, not official academic records.
Attendance, assignments, exams, cohorts, and user management remain prototype
workflows and are not operational release features.

## Architecture and content

The application uses Next.js 16, React 19, TypeScript, Bun, Tailwind CSS 4,
shadcn/Base UI, next-intl, and next-themes. Runtime data access uses Supabase
Data API through `@supabase/supabase-js`; cookie sessions use `@supabase/ssr`.
Authorization is enforced in server actions and RLS using active
`staff_members` roles. Tantōsha cannot author content.

The imported Gentsuki baseline contains 12 sets, 614 child/standard questions,
and 14 illustration groups. Of those questions, 602 are published and 12 remain
editorial drafts. These counts describe the imported baseline, not all live
content or future Sensei edits. See [import documentation](docs/gentsuki-bank-import.md).
Illustration JPEGs are bundled with the application; uploaded file storage is
not implemented.

## Development

Use a local Supabase stack or isolated development Supabase project for Auth
and Data API. Plain PostgreSQL alone cannot serve runtime requests. Copy
`.env.example` to `.env.local` and configure:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`POSTGRES_URL` is administration-only for SQL migrations/checks with `psql`.
It is not required by the application or Vercel runtime. Keep credentials and
QA passwords in untracked environment files.

```sh
bun install --frozen-lockfile
bun run dev
```

Open http://localhost:3000. Apply versioned migrations separately with
`bun run db:migrate` after confirming the target and its migration ledger.
`bun run db:seed` is only for local sample data; never seed the hosted project.
Use the dedicated importer for Gentsuki content, not the sample seed.

## Verification

For implementation work:

```sh
bun run verify
```

This runs typecheck, lint, locale validation, Graphify update, diff checks, and
production build. It writes tracked Graphify files. If sandbox restrictions
prevent Turbopack worker-port binding, document the failure and use
`bun run verify --webpack`; this does not verify Vercel's remote build.
Documentation-only changes require consistency/link checks and `git diff --check`.

Additional checks:

- `bun run db:check-data-api`: creates a temporary local PostgreSQL database
  and tests migrations plus the existing five-role SQL fixtures.
- `bun run db:verify-permissions`: read-only grants/RLS inspection against the
  database selected by administration `POSTGRES_URL`.
- `bun run db:check-data-api-live`: authenticates QA roles, creates temporary
  test content, and cleans it afterward. It is not a read-only review command.
- `bun db/scripts/import-gentsuki-ready-web.ts --check`: validates local import.
- `bun db/scripts/import-gentsuki-ready-web.ts --verify-live`: authenticates
  Sensei and reads the stored import plus anonymous visibility; no content writes.
- `bun .ai/scripts/check-supabase-config.ts`: tests missing-variable diagnostics
  without disclosing values.

Live role checks require local `SENSEI_EMAIL`/`SENSEI_PASSWORD`,
`TANTOSHA_EMAIL`/`TANTOSHA_PASSWORD`, `NONSTAFF_EMAIL`/`NONSTAFF_PASSWORD`, and
`INACTIVE_STAFF_EMAIL`/`INACTIVE_STAFF_PASSWORD`. Non-staff must have no staff
membership; inactive staff must have `is_active=false`. Never modify real staff
accounts to create test cases.

The existing permission fixtures do not yet cover illustration groups and
repair RPCs. A passing legacy verifier is insufficient for the group release.
Current evidence and remaining work are in [release readiness](docs/release-readiness.md).

## Vercel setup

Use the existing `genshu` project linked to `amalrivel/genshu`, the Next.js
preset, repository root, and `main` production branch. Install with
`bun install --frozen-lockfile`, build with `bun run build`, and retain the
standard Next.js Node.js runtime.

Configure the two Supabase runtime values in the appropriate Vercel environment
scope. Verify their availability in the deployed build; local `.env` values do
not configure Vercel. Changing variables requires a new deployment, including
for public variables embedded at build time. Do not upload QA passwords or
administration `POSTGRES_URL` to Vercel. Builds must not run migrations or seeds.

Apply required migrations separately after checking the target ledger. The
current worktree includes migrations 001–013; presence here is not proof of
application to a target or inclusion in a deployment.

Set Supabase Auth Site URL to the final production HTTPS URL and configure
redirect URLs for the invitation/recovery flows actually used. Scope preview
redirects to the project/team. Preview and Production have separate environment
scopes; preview authoring still changes live data if it points to production
Supabase. Prefer isolated development/preview projects.

Before release, identify the exact deployment ID and source commit, then test
anonymous catalogs/details/practice, draft privacy, staff login/logout/session
refresh, Sensei authoring, and Tantōsha denial. Test Indonesian/Japanese and
phone/desktop viewports. HTTP 200 alone does not prove these interactions.

## Feedback and recovery

Use the project's GitHub Issues for non-sensitive beta feedback. Include route,
time, locale, and reproduction steps; keep private data and credentials out of
public reports. Confirm a private reporting channel with the owner when needed.

Inspect Vercel build/runtime logs for the deployment involved. Roll back to a
verified compatible deployment when required; code rollback does not reverse
migrations or content edits. Follow [backup and recovery](docs/recovery.md).

## Agent workflow

Read [AGENTS.md](AGENTS.md), [project decisions](.ai/PROJECT.md), and
[AI workflow](.ai/README.md). Reviewer documentation edits and worker code
changes have separate task scopes. The next bounded worker goal is in
[worker-next-goal.md](docs/worker-next-goal.md).
