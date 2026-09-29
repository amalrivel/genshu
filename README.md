# Genshu

Learning materials and anonymous practice for Indonesian students in Japanese scholarship programs, with Sensei authoring and Tantōsha staff access.
Attendance, assignments, exams, cohorts, and user management remain prototypes.

See [product and architecture](.ai/PROJECT.md) for scope, permissions, and imported-content rules.

## Local development
Use a local Supabase stack or isolated development project; plain PostgreSQL alone cannot serve runtime Auth/Data API.
Copy [.env.example](.env.example) to an untracked `.env.local` and configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

```sh
bun install --frozen-lockfile
bun run dev
```

Open http://localhost:3000.
Set administration-only `POSTGRES_URL` when running SQL scripts with `psql`.
Confirm the target and migration ledger before `bun run db:migrate`.
Run `bun run db:seed` only locally; use the dedicated importer for Gentsuki content.
Never commit credentials or QA passwords.

## Verification
Run `bun run verify` for implementation: typecheck, lint, locale checks, Graphify update, diff checks, and production build.
This writes Graphify files. If sandbox worker-port restrictions block Turbopack, report them and use `bun run verify --webpack`.
Documentation-only changes need link/consistency checks and `git diff --check`.

Focused checks:
- `bun run db:check-data-api`: temporary local PostgreSQL migration/permission fixtures.
- `bun run db:verify-permissions`: read-only grants/RLS checks against the selected target.
- `bun run db:check-data-api-live`: QA-role checks that create and clean up temporary content.
- `bun db/scripts/import-gentsuki-ready-web.ts --check`: local import validation.
- `bun db/scripts/import-gentsuki-ready-web.ts --verify-live`: stored-import and anonymous-visibility checks.
- `bun .ai/scripts/check-supabase-config.ts`: missing-config diagnostics.

Live role tests require separate Sensei, Tantōsha, non-staff, and inactive-staff QA accounts supplied through local environment variables. Never repurpose real staff accounts.
Check each script's actual coverage; passing one check does not establish complete release readiness.

## Deployment and recovery
Use the existing Vercel project, repository root, Next.js preset, `main` production branch, `bun install --frozen-lockfile`, and `bun run build`.
Keep the standard Next.js Node.js runtime. Configure both Supabase runtime variables in the target Vercel scope and redeploy after changes.
Do not put administration URLs or QA passwords in app runtime, or run migrations/seeds during builds.

Keep development/preview data isolated. Configure Supabase Auth URLs for the actual domains and flows.
Before release, record the deployment ID/commit and check public content, draft privacy, practice/group scoring, staff sessions, Sensei authoring, Tantōsha denial, both locales, and phone/desktop behavior.
Rehearse an off-site backup restore on an isolated target. Application rollback does not undo migrations or content edits.

Use GitHub Issues for non-sensitive feedback, including route and reproduction steps.
Development priorities and annotation handling are in [.ai/README.md](.ai/README.md); agent entry instructions are in [AGENTS.md](AGENTS.md).
