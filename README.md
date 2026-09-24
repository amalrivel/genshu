# Genshu

Genshu is a learning-management workspace for Indonesian students in Japanese scholarship learning programs. It supports three simulated roles—Gakusei, Sensei, and Tantōsha—with workflows for attendance, practice, assignments, exams, cohorts, and users.

## Current release work

Published materials and anonymous practice now read shared content from local
PostgreSQL. Student answers are temporary and are not official records. Staff
login and content authoring use Supabase Auth plus server-side role checks, but
need a configured Supabase project and end-to-end browser verification before
release. Attendance, assignments, exams, cohort management, and user management
still use prototype data and are hidden in production until released separately.

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
bun run check
```

The project uses Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/Base UI primitives, `next-intl`, and `next-themes`.
