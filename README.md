# Genshu

See [the developer guide](docs/developer-guide.md) for current behavior,
required v1 features, deferred work, and acceptance scenarios on branch `fresh`.

**Current setup warning:** the MariaDB/Prisma 7 instructions below are historical
and do not describe the current Prisma 8/PostgreSQL configuration. Database
queries, authentication, and package scripts have not yet been reconciled with
that transition. Do not use the historical commands as a verified setup workflow.

## Historical local database setup (needs replacement)

This project uses MariaDB, Prisma 7, and a Better Auth Prisma adapter.
Configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_DATABASE` in
`.env`. These existing MariaDB settings are used by both Prisma CLI and runtime;
the PostgreSQL starter `DATABASE_URL` is not used.

```bash
bun install
bun run db:deploy
bun dev
```

The initial migration creates empty Activities and authentication tables.
No example data is inserted by migrations. To apply pending migrations and seed
master categories plus example Activities with one command:

```bash
bun run db:seed
```

The seed is transactional and can be rerun. It preserves existing categories,
Activities, and their questions; it never resets the database. The example
questions are test content, not authoritative exam material. No users or
passwords are seeded. Category navigation reads labels and descriptions from the database. The
ActivityType enum controls supported category IDs; constants are seed defaults only.

For subsequent schema changes, use
`bun run db:migrate --name describe_change`, then `bun run db:generate`.
Migration deployment is explicit; starting the app does not modify the database.

Better Auth is configured with the database adapter only. Login methods, auth
routes, registration policy, roles, and attempt persistence remain TODOs.
The inactive Prisma 8 contract and guide are retained for reference; the active
schema is `src/prisma/schema.prisma`.

The old copied `types/validator.ts` is excluded from TypeScript because its
relative imports are stale. Next.js-generated validators under `.next/types`
and `.next/dev/types` remain included.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
