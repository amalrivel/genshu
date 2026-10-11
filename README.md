# Genshu

Genshu is a managed student learning portal. Administrators provision accounts;
students sign in with email and password. See the [developer guide](docs/developer-guide.md)
for the v1 scope, security boundaries, and acceptance coverage.

## Local setup

Requirements: Bun, Docker Compose, and PostgreSQL 15 or newer. The repository's
Compose service publishes PostgreSQL on `127.0.0.1:5433` and persists it in the
`postgres_data` volume.

```sh
cp .env.example .env
# Set POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB in .env to match DATABASE_URL.
docker compose up -d db
bun install
bun run contract:emit
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
bun run account:create-first-admin
bun dev
```

The seed inserts only the `practice` activity category and does not overwrite
existing categories or create sample questions, users, or passwords. Starting or
building the app does not migrate the database. Never use reset or destructive
schema commands against an existing database. The v1 contract leaves the starter
`User` and `Post` tables intact and adds Genshu tables.

`DATABASE_URL`, `BETTER_AUTH_SECRET` (a unique random secret of at least 32
characters), and `BETTER_AUTH_URL` are required. The example values are for local
development only. Production secrets must be configured through the deployment
environment.

## Accounts and recovery

There is no public registration. Use the management page to provision student and
teacher accounts; administrators alone can provision accounts or reset passwords.
The first administrator is created with the interactive, non-echoing
`bun run account:create-first-admin` command, which refuses to create another
administrator. To recover a student's or teacher's password, an administrator can
reset it in `/admin`. If all administrators are locked out, an operator with
database access can run `bun run account:reset-password` interactively; it updates
only the credential password and revokes that account's sessions. Protect the
database credentials and rotate the recovered password through an administrator.

## Database and authentication

The app uses the Prisma 8 contract/runtime against PostgreSQL. Better Auth 1.7's
Prisma adapter supports Prisma 5–7, so Genshu uses its supported Kysely adapter
with `pg` Pool against the same PostgreSQL database. This keeps auth and domain
data on one database without relying on the incompatible Prisma adapter.

For subsequent schema changes, use `bun run db:plan --name <change>` to plan
contract changes, inspect them with `prisma migration show <migration>`, and apply
reviewed pending migrations with `bun run db:migrate`. `bun run db:status` inspects
local migration state. `bun run db:generate` emits contract types. Database
commands operate on `DATABASE_URL` in `.env`; verify the target and backup first.

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
bun run tsc --noEmit
bun run lint
bun run build
```
