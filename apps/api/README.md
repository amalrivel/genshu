# Content API

## API architecture

The API is a small modular monolith. `src/app.ts` builds the Express app and
`src/server.ts` starts the listener. Domain routers live under
`src/modules/` (`auth`, `users`, `topics`, `materials`, `questions`,
`practice-sets`, and participant `practice`). Shared validation/errors and
authentication middleware are under `src/shared/` and `src/middleware/`.
Operational commands live under `src/scripts/`, tests under `src/tests/` (with
the legacy integration entry point retained), and Prisma contract/runtime
files remain owned by `src/prisma/`.

Run `pnpm run dev` from the workspace root. The API uses `apps/api/.env` for
`DATABASE_URL` and listens on port 3000. The web UI is at
`http://localhost:5173/topics` or `http://127.0.0.1:5173/topics`. In local
development, Vite proxies the browser's same-origin `/api` requests to port
3000, so either hostname keeps its own session cookie. Set `VITE_API_URL` for
an explicitly configured API URL, including production deployments.

| Method | Route                        | Body / behavior                                                                                                                                                         |
| ------ | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | /topics                      | Topics sorted by title, then ID                                                                                                                                         |
| GET    | /topics/:id                  | One topic                                                                                                                                                               |
| POST   | /topics                      | `{ "title": "Road signs" }`                                                                                                                                             |
| PUT    | /topics/:id                  | `{ "title": "Updated title" }`                                                                                                                                          |
| DELETE | /topics/:id                  | 409 if materials still reference the topic                                                                                                                              |
| GET    | /materials                   | Materials sorted by title, then ID; optional `?topicId=1`                                                                                                               |
| GET    | /materials/:id               | One material                                                                                                                                                            |
| POST   | /materials                   | `{ "title": "Stop", "content": "# Stop", "topicId": 1 }`                                                                                                                |
| PUT    | /materials/:id               | Required title/content; optional topicId to move material                                                                                                               |
| DELETE | /materials/:id               | Deletes only the specified material                                                                                                                                     |
| GET    | /questions                   | Questions sorted by Japanese text, then ID; optional `?topicId=1`                                                                                                       |
| GET    | /questions/:id               | One question                                                                                                                                                            |
| POST   | /questions                   | `{ "japaneseText": "…", "indonesianTranslation": "…", "furigana": "…", "correctAnswer": true, "japaneseExplanation": "…", "indonesianExplanation": "…", "topicId": 1 }` |
| PUT    | /questions/:id               | Required question fields; optional topicId to move the question                                                                                                         |
| DELETE | /questions/:id               | Deletes only the specified question; 409 while included in a practice set                                                                                               |
| GET    | /practice-sets               | Practice sets sorted by title, then ID                                                                                                                                  |
| GET    | /practice-sets/:id           | One practice set with ordered questions                                                                                                                                 |
| POST   | /practice-sets               | `{ "title": "Road signs", "description": "Optional", "questionIds": [2, 1] }`                                                                                           |
| PUT    | /practice-sets/:id           | Required title; optional description and `questionIds` replacement                                                                                                      |
| PUT    | /practice-sets/:id/questions | `{ "questionIds": [2, 1] }` replaces the selected questions and their order                                                                                             |
| DELETE | /practice-sets/:id           | Deletes the set and its memberships                                                                                                                                     |

Creates return 201, reads/updates 200, and deletes 204. Errors return
`{ "error": "message" }`: invalid input 400, missing record 404, foreign-key
conflict 409, oversized JSON 413, unexpected failure 500. IDs must be positive
PostgreSQL integers. Titles are trimmed; content must contain non-whitespace
text and is stored unchanged. JSON requests are limited to 1 MB.

## Authentication

The browser uses a server-verifiable, revocable HTTP-only `genshu_session`
cookie. Sessions last 14 days. In local development the cookie is not `Secure`;
production sets `Secure` when `NODE_ENV=production`. Local development uses
Vite's same-origin `/api` proxy; production deployments should set
`VITE_API_URL` to the browser-accessible API URL, and browser requests use
credentials.

There is no public registration. Create the first Admin explicitly with values
kept outside version control:

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='a password of at least 12 characters' \
  pnpm --filter api run bootstrap:admin
```

`ADMIN_NAME` is optional. The command creates an Admin only when the email is
absent; it never changes an existing password. Copy the variables from
`.env.example` into a local environment file as needed.

Admins create inactive Participants, then generate invitation links. Invitation
tokens expire after 72 hours; reset tokens expire after one hour. Generating a
replacement revokes prior unused tokens. Tokens are one-time, and only their
SHA-256 hashes are stored. Admins manually send the generated URL/message.
Resetting a password revokes all existing sessions for that user.

| Method   | Route                            | Access                 |
| -------- | -------------------------------- | ---------------------- |
| POST     | /auth/login, /auth/logout        | Public / authenticated |
| GET      | /auth/session                    | Authenticated          |
| GET/POST | /auth/invitations/:token         | Public token flow      |
| GET/POST | /auth/password-resets/:token     | Public token flow      |
| GET/POST | /admin/users                     | Admin                  |
| POST     | /admin/users/:id/invitations     | Admin                  |
| POST     | /admin/users/:id/password-resets | Admin                  |

Topics, materials, questions, and Practice Set management require Admin.
Participant Practice routes require an authenticated session.

## Local demo data

Apply the existing Prisma migrations to the local `DATABASE_URL`, then bootstrap
an Admin and seed the synthetic demo content:

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='a password of at least 12 characters' \
  pnpm --filter api run bootstrap:admin
pnpm --filter api run seed:demo
pnpm dev
```

Sign in and open `http://localhost:5173/practice` (or the equivalent
`127.0.0.1` URL). The seed creates two `[DEMO]` topics, 12 questions, and the
`[DEMO] Gentsuki Basic Practice` set. It is idempotent and only updates its own
`[DEMO]` records; it does not delete user-created data. Demo content is
synthetic product-test data and is not intended for production or authoritative
driving instruction.

## Checks

- `pnpm --filter api typecheck`
- `pnpm --filter api test` (requires the running API and development database;
  creates temporary records and seeds/reuses the `[DEMO]` records)
- `pnpm --filter web typecheck`
- `pnpm --filter web build`

The Question and Practice Set migrations must be applied to the development
database before using the new endpoints.
