# Genshu

Genshu is a learning-management workspace for Indonesian students in Japanese scholarship learning programs. The first live release provides public materials and anonymous practice, with Sensei content authoring and Tantōsha staff access. Attendance, assignments, exams, cohorts, and user management remain prototype workflows.

## Current release work

Published materials and anonymous practice read shared content from
PostgreSQL. The Supabase schema is provisioned with one published material and
one published practice set. Student answers are temporary and are not official
records. Staff login and content authoring use Supabase Auth plus server-side
role checks; Sensei and Tantōsha identities are mapped. Production-browser
checks passed on 2026-09-26 for Sensei authoring/publishing, Tantōsha
authoring denial, anonymous student reading/practice, and hidden drafts. Those
local production checks have now been repeated through Data API, including
expired-session refresh and desktop/mobile practice. They do not verify the
current Vercel deployment.
Attendance, assignments, exams, cohort
management, and user management still use prototype data and are hidden in
production until released separately.

Vercel and Supabase PostgreSQL are the initial deployment targets. Development
remains local-first with versioned database migrations.

The interface supports Indonesian and Japanese, dark mode, responsive navigation,
and mobile-oriented student workflows.

## Development

Use Bun for local development:

```bash
bun install
bun run dev
```

Open <http://localhost:3000>. Before handing off changes, run:

```bash
bun run verify
```

The project uses Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/Base UI primitives, `next-intl`, and `next-themes`.

## Vercel production status and setup

Run `bun run db:check-data-api` to check migrations, RLS with all five role
cases, JSON round trips, and RPC rollback in a temporary local PostgreSQL
database. This needs PostgreSQL binaries (`POSTGRES_BIN` can override their
directory) and permission to create a local Unix socket. It does not connect
to Supabase or replace direct Data API and browser verification.

`bun run db:check-data-api-live` uses the publishable key and QA Auth sessions
to check direct API permissions, JSON, and atomic replacement. Provide
`SENSEI_EMAIL`/`SENSEI_PASSWORD`, `TANTOSHA_EMAIL`/`TANTOSHA_PASSWORD`,
`NONSTAFF_EMAIL`/`NONSTAFF_PASSWORD`, and
`INACTIVE_STAFF_EMAIL`/`INACTIVE_STAFF_PASSWORD` in local env only. The script
creates uniquely named QA content and deletes it afterward; missing roles
cause an incomplete-coverage exit. It never creates identities or modifies
staff membership.

Verification on 2026-09-26: local SQL checks pass for all five roles; live Data
API checks pass for all five roles. QA content has been removed and
original row hashes remain unchanged. Local production browser checks and
build/start with `POSTGRES_URL` absent pass. `bun run verify --webpack` passes;
the default Turbopack build cannot bind its worker port in this sandbox.

1. In the existing `genshu` project, verify the `amalrivel/genshu` Git
   connection, Next.js preset, repository root, and `main` production branch.
   Use `bun install --frozen-lockfile` for installation and `bun run build` for
   the build. Keep the default Next.js Node.js runtime; using Bun for
   installation/build does not require Bun runtime.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to each Vercel environment that will
   access the app. Runtime database queries use Supabase Data API with RLS;
   Vercel does not need a PostgreSQL connection string. Keep test-account
   passwords out of GitHub and Vercel.
3. Apply schema migrations separately with `bun run db:migrate` from a trusted
   administration environment with `POSTGRES_URL` and `psql`. This connection
   is for migrations and database checks only, not application runtime. Do not
   run migrations or local sample seeds as part of the Vercel build. Migration
   `005_supabase_data_api.sql` grants minimum Data API access and configures RLS.
4. Set the Supabase Auth Site URL to the deployment's final URL. Configure
   allowed redirect URLs when using invitations or password recovery.
5. On the deployed domain, check Sensei login/logout and create/edit/publish,
   Tantōsha authoring denial, anonymous material reading and practice, draft
   detail 404s, Indonesian/Japanese display, and phone navigation. Confirm
   attendance, assignments, and exams redirect to materials. Local production
   checks do not verify Vercel environment variables or deployed cookies.

### Supabase Auth and preview safety

Set Supabase Auth **Site URL** to the final HTTPS production domain. Add that
exact domain to **Authentication → URL Configuration → Redirect URLs**, along
with `http://localhost:3000/**` for local development. Add a Vercel preview
wildcard only if preview authentication is needed; prefer an exact production
URL and keep preview allow-list entries scoped to the Vercel team/account slug.
The Site URL is the fallback for email links and recovery flows.

Vercel Preview and Production have separate environment scopes. Do not put the
   production administration `POSTGRES_URL` in Preview: previews connected to production can read
published content and staff authoring can change live content. Give previews a
separate database, or omit production credentials and do not use previews for
flows that require database access.

### Logs, feedback, and rollback

Open the Vercel project **Deployments** page for build logs. Use **Logs** to
filter runtime requests by deployment, domain, route, status, or error. Vercel
retains runtime logs for a limited period, so include the deployment URL, route,
approximate time, locale, and steps to reproduce when reporting an issue. The
repository is public and GitHub Issues are enabled, so use
<https://github.com/amalrivel/genshu/issues> for non-sensitive beta feedback.
Do not include student information, credentials, or private content in a public
issue. No private feedback or security-reporting channel has been confirmed;
establish one before collecting sensitive reports.

For an application rollback, use Vercel Deployments to promote the last known
good deployment. This only rolls back application code. It does not reverse
database migrations, published content, or other database changes; recover
those separately from a verified database export or restore.

### Database backup and recovery

The configured Supabase organization is currently on the Free plan. Free
projects do not have downloadable scheduled database backups. Install the
Supabase CLI and Docker on an authenticated, trusted workstation. Export weekly
and before each migration or significant content change; the CLI excludes
Supabase-managed schemas:

```sh
umask 077
backup_dir="/path/to/restricted/genshu-$(date +%F)"
mkdir -p "$backup_dir"
supabase db dump --db-url "$POSTGRES_URL" -f "$backup_dir/roles.sql" --role-only
supabase db dump --db-url "$POSTGRES_URL" -f "$backup_dir/schema.sql"
supabase db dump --db-url "$POSTGRES_URL" -f "$backup_dir/data.sql" \
  --use-copy --data-only -x "storage.buckets_vectors" -x "storage.vector_indexes"
```

Encrypt the files before moving them to restricted off-site storage; never put
the dump or its connection URL in Git. `db dump` does not include Supabase Auth
users or project Auth settings, so record the staff account IDs and be ready to
recreate/invite those accounts and reapply their `staff_members` mappings after
a project-level recovery.

Rehearse by restoring the export into a separate, isolated Supabase project or
local Supabase stack, never production. On the isolated target, revoke default
public table grants before restoring, then apply the three files in order:

```sh
psql "$RESTORE_DB_URL" --set ON_ERROR_STOP=1 \
  --command 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated'
psql --single-transaction --variable ON_ERROR_STOP=1 \
  --file "$backup_dir/roles.sql" \
  --file "$backup_dir/schema.sql" \
  --command 'SET session_replication_role = replica' \
  --file "$backup_dir/data.sql" \
  --dbname "$RESTORE_DB_URL"
```

Verify the four `genshu_schema_migrations` rows and published content. Run the
RLS/no-public-grant check against the restore:

```sh
POSTGRES_URL="$RESTORE_DB_URL" bun run db:verify-permissions
```

The CLI export excludes Supabase Auth users and settings. If restoring to a new
Supabase project, invite staff there and map their new Auth UUIDs to their
`staff_members` roles. Follow Supabase's current
[database backup and restore guide](https://supabase.com/docs/guides/platform/backups)
and [CLI dump reference](https://supabase.com/docs/reference/cli/supabase-db-dump)
for target setup and any extensions or Auth customizations.
This environment has no running local PostgreSQL service or Docker/Supabase
stack, and the Supabase Free project has no automatic downloadable backups, so
no restore rehearsal has been completed. A restore rehearsal remains a gate
before relying on real content.

### Current deployment status

The existing `genshu` Vercel project serves `genshu.vercel.app` from READY
deployment `dpl_7Vraq7P3RP8gxZifswCkvubJoyNF`, deployed through the CLI from
commit `4216e53`. The 2026-09-26 18:05 JST incident on the previous deployment
failed during Supabase client creation with "Your project's URL and Key are
required", digest `2431554270`. The two required public variables were stored
as Secret; their Production targets were replaced with validated Config
values and the app was rebuilt. Preview targets were preserved.
Cookie-free live HTTP checks now return 200 with actual Supabase content on
both catalogs and published detail routes. Live browser checks pass for
anonymous reading/practice, Sensei authoring, login/logout, expired-session
refresh, and Tantōsha authoring denial. Draft URLs remain anonymous 404.
New runtime logs show 200 on the fix deployment with no 5xx in the checked
post-deployment interval. QA content is removed and original row hashes remain
unchanged. Migration 005 remains applied; no seed/reset or RLS changes were
needed. Builds must not run migrations or seed data.

Incident recovery: open the existing project's
[Environment Variables settings](https://vercel.com/amalrivels-projects/genshu/settings/environment-variables),
set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as
**Config** from the existing Supabase project with **Production** selected, then create a new
Production deployment from `main`. Changing variables does not update an
existing deployment. The runtime needs no `POSTGRES_URL`. Check the four
published catalog/detail routes anonymously and inspect new runtime logs.
Run `bun .ai/scripts/check-supabase-config.ts` to check that missing-variable
errors identify names without exposing their values.
