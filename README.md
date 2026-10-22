# Genshu

Genshu is a managed Japanese-learning portal with an Indonesian interface.
Administrators provision accounts; students sign in with email and password.

## Documentation

- [Product requirements](docs/PRD.md): current scope, roles, journeys, acceptance criteria and unresolved decisions.
- [Architecture](docs/ARCHITECTURE.md): routes, auth/data boundaries, publication, practice persistence and technical limits.
- [Agent instructions](AGENTS.md): development conventions and when to read each document.
- [Design](DESIGN.md): UI and interaction requirements.
- [Demo and testing](docs/demo-testing.md): local fixtures, demo accounts and browser checklist.
- [Developer guide](docs/developer-guide.md): compatibility links and dated verification evidence.

## Local setup

Requirements: Bun (package manager pinned to 1.4.2), Docker Compose, and PostgreSQL
15 or newer. The repository's Compose service uses PostgreSQL 18, publishes it on
`127.0.0.1:5433`, and persists it in the `postgres_data` volume.

Create a local, ignored `.env` with `DATABASE_URL`, `BETTER_AUTH_SECRET` and
`BETTER_AUTH_URL`. For Compose, also set `POSTGRES_USER`, `POSTGRES_PASSWORD` and
`POSTGRES_DB` to match the connection URL and use port 5433. Use a unique random
auth secret of at least 32 characters; for local development the auth URL is
`http://localhost:3000`. Do not commit secrets. The local `.env.example` is currently
ignored/untracked, so fresh-clone setup cannot depend on copying that file.

```sh
docker compose up -d db
bun install
bun run db:generate
bun run db:init:preview
```

Review the additive operations from the preview and confirm `DATABASE_URL` points
at the intended database. Back up existing data first. `db init` creates missing
contract objects, preserves compatible existing tables, stops on changes that
would need destructive operations, and signs the resulting schema. After reviewing
the preview:

```sh
bun run db:init
bun run db:seed
bun run dev
```

The seed inserts only the `practice` activity category and does not overwrite
existing categories or create sample questions, users, or passwords. Starting or
building the app does not migrate the database. Never use reset or destructive
schema commands against an existing database. The v1 contract leaves the starter
`User` and `Post` tables intact and adds Genshu tables.

Production secrets and its actual public `BETTER_AUTH_URL` must be configured
through the deployment environment.

For local development, set `BETTER_AUTH_URL="http://localhost:3000"` in `.env`.
The dev configuration also allows `127.0.0.1` for Next.js resources and
authentication requests on port 3000. Restart `bun run dev` after changing
environment variables or configuration. Production must use its actual public
URL; the additional local authentication origins apply only in development.

## Accounts and recovery

There is no public registration. An existing administrator can use `/admin` to
provision student and teacher accounts or reset their passwords.

Administrators can also update a student's or teacher's name, email, and role,
or delete an account that has no practice attempts/results. Changing an email or
role revokes the target account's sessions; password resets remain a separate
action. Administrator accounts are protected from profile/role edits and deletion
in this management flow. Deleting a managed account also removes its sign-in
credentials and sessions; practice history is preserved by refusing deletion of
accounts that have attempts.

For local evaluation, run `bun run db:seed:demo` after initializing the schema,
then sign in with the administrator account described in
[demo accounts](docs/demo-testing.md#akun-pengujian). This seed is for a local demo
database only and preserves existing accounts and passwords.

This checkout does not provide a first-administrator or operator password-recovery
script. Production setup requires a separate administrator-provisioning procedure;
do not use the demo seed for production. If all administrators lose access, an
operator recovery procedure is also required. Public self-service password reset
is not available.

## Database and authentication

The app uses the Prisma 8 contract/runtime against PostgreSQL. Better Auth receives
a `pg` Pool directly and uses its built-in SQL/Kysely integration against the same
database; Genshu does not use a Better Auth Prisma adapter. See
[architecture](docs/ARCHITECTURE.md#authentication-and-database-integration) for
the separate runtime boundaries and authoritative files.

For subsequent schema changes, use `bun run db:plan --name <change>` to plan
contract changes, inspect them with `bunx prisma migration show <migration>`, and apply
reviewed pending migrations with `bun run db:migrate`. `bun run db:status` inspects
local migration state. `bun run db:generate` emits contract types. Database
commands use `DATABASE_URL` from the process environment, with `.env` loaded by
the Prisma configuration; verify the target and backup first. No migration
directory is currently present, so these commands do not establish a deployed
migration history. `dev` does not automatically emit the contract; generate it
after contract changes. `build` emits it before compiling the app.

## Local demo data

Run `bun run db:seed:demo` after the local schema exists, then `bun run demo:docx`
to generate a Word upload fixture. This adds managed demo accounts, published and
draft content, practice drafts/results, recordings, and relative-date events
without resetting existing data. It refuses remote/production targets.
See [demo accounts and the behavior checklist](docs/demo-testing.md) for login
details, rerun behavior, and scenarios. `bun run db:seed` remains category-only.

## Checks

```sh
bun run test
bunx tsc --noEmit --incremental false
bun run lint
bun run build
```

Run relevant checks and record their scope. Unit/render tests do not prove live
auth, database concurrency, browser uploads or deployment readiness. Historical
build/browser results remain in the [developer guide](docs/developer-guide.md#historical-verification).
Known limits, including the DOCX converter/request-size mismatch, are recorded in
[architecture](docs/ARCHITECTURE.md#limits-and-verification); product decisions
remain in [PRD](docs/PRD.md#unresolved-product-decisions).
