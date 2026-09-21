# Genshu

Genshu is a learning-management workspace for Indonesian students in Japanese scholarship learning programs. It supports three simulated roles—Gakusei, Sensei, and Tantōsha—with workflows for attendance, practice, assignments, exams, cohorts, and users.

## Current MVP

The current application is a frontend-first prototype. Its realistic mock data and role preview are persisted in browser `localStorage`, so changes are local to the current browser and are not yet suitable for shared or official learning history. The planned persistence direction is PostgreSQL/Supabase, but that backend is not implemented yet.

The interface supports Indonesian and Japanese, dark mode, responsive navigation, and mobile-oriented student workflows.

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
