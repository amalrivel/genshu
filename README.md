# Genshu

Genshu is a learning-management workspace for Indonesian students in Japanese scholarship learning programs. The first live release provides public materials and anonymous practice, with Sensei content authoring and Tantōsha staff access. Attendance, assignments, exams, cohorts, and user management remain prototype workflows.

## Current release work

Published materials and anonymous practice read shared content from
PostgreSQL. The Supabase schema is provisioned with one published material and
one published practice set. Student answers are temporary and are not official
records. Staff login and content authoring use Supabase Auth plus server-side
role checks; Sensei and Tantōsha identities are mapped. Production-browser
verification passed on 2026-09-26 for Sensei authoring/publishing, Tantōsha
authoring denial, anonymous student reading/practice, and hidden drafts.
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

## First Vercel deployment

1. Import `amalrivel/genshu`, choose the Next.js preset, repository root, and
   `main` as the production branch. Use `bun install --frozen-lockfile` for
   installation and `bun run build` for the build. Keep the default Next.js
   Node.js runtime; using Bun for installation/build does not require Bun runtime.
2. Add `POSTGRES_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel for each environment that
   will access the app. Use the Supabase transaction pooler URL for serverless
   runtime connections; prepared statements are already disabled in the app.
   Keep database credentials private. Do not upload `.env` or test-account
   passwords to GitHub or Vercel.
3. Schema migrations are applied separately with `bun run db:migrate` from an
   environment with `psql`. Do not run migrations or local sample seeds as part
   of the Vercel build. Migrations 001–004 have been verified on the configured
   Supabase project.
4. Set the Supabase Auth Site URL to the deployment's final URL. Configure
   allowed redirect URLs when using invitations or password recovery.
5. On the deployed domain, check Sensei login/logout and create/edit/publish,
   Tantōsha authoring denial, anonymous material reading and practice, draft
   detail 404s, Indonesian/Japanese display, and phone navigation. Confirm
   attendance, assignments, and exams redirect to materials. Local production
   checks do not verify Vercel environment variables or deployed cookies.

Preview deployments use their configured database. If they share production
credentials, staff authoring changes the same content; use controlled draft
content for checks. An application rollback does not undo database migrations
or content edits.
