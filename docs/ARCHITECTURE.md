# Genshu architecture

Source reviewed on branch `fresh`, 23 October 2026 (JST); this is not a deployed-system
claim. Product policy lives in [PRD.md](PRD.md); test evidence and limits in
[demo-testing.md](demo-testing.md#ringkasan-verifikasi-historis).

## Stack and structure

One Next.js App Router application serves server-rendered pages and interactive
client components. Domain mutations use Server Actions; the only route handler
is authentication. There is no separate application API service.

| Concern     | Reviewed choice / authority                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Tooling     | Bun 1.4.2, strict TypeScript, ESLint; [package.json](../package.json), [tsconfig.json](../tsconfig.json)                       |
| Framework   | Next.js 16.3.7, React 19.2.8, React Compiler; [next.config.ts](../next.config.ts)                                              |
| UI          | Tailwind 4, shadcn `base-nova`, Base UI, Lucide, next-themes; [components.json](../components.json), [DESIGN.md](../DESIGN.md) |
| Domain data | Prisma 8 PostgreSQL runtime rc.16 / CLI rc.21; [prisma.config.ts](../prisma.config.ts)                                         |
| Auth        | Better Auth 1.7.7 with a separate `pg` Pool                                                                                    |
| Lessons     | Mammoth, JSZip, yauzl, sanitize-html; [material-import.ts](../src/lib/learn/material-import.ts)                                |

Package declarations and bun.lock own versions; the table is a review snapshot.
Imports use `@/*` for `src/*`. Keep the existing feature boundaries:

| Location                       | Responsibility                                                      |
| ------------------------------ | ------------------------------------------------------------------- |
| `src/app`                      | Routes, metadata and loading/error/not-found boundaries             |
| `src/components`, `src/hooks`  | Feature UI, shared primitives/layouts and client state              |
| `src/lib/<feature>/queries.ts` | Server-only reads and projections                                   |
| `src/lib/<feature>/actions.ts` | Authorization, validation, mutations, transactions and invalidation |
| `src/prisma`                   | Contract, emitted JSON/types and domain runtime                     |
| `scripts`, `tests`             | Local seeds/fixtures and Bun helper/render tests                    |

## Interface localization

[next.config.ts](../next.config.ts) applies the next-intl plugin.
[request.ts](../src/i18n/request.ts) reads the validated `genshu-locale` cookie,
loads the Indonesian/Japanese message catalog and fixes the timezone to Asia/Tokyo.
The root layout sets `html.lang` and provides messages through
`NextIntlClientProvider`. URLs are unchanged; no locale routing or proxy is added.
[setLocale](../src/i18n/actions.ts) accepts only `id`/`ja` and writes a one-year,
HTTP-only, SameSite=Lax cookie (Secure in production); switching refreshes the
rendered UI without changing the route.

UI components use `useTranslations`, while async pages and metadata use
`getTranslations`. [feedback.ts](../src/i18n/feedback.ts) translates known action
feedback at the UI boundary, retaining the current server response contracts.
Database content, grading, snapshots, permissions and form date serialization
remain unchanged. Unknown feedback and provider conversion warnings pass through.

## Routes and authorization

The `(home)` [layout](<../src/app/(home)/layout.tsx>) checks the session and supplies
identity/navigation. Route groups do not appear in URLs.

| URL                                                    | Boundary / behavior                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| `/login`                                               | Redirect existing sessions home; email/password form otherwise      |
| `/api/auth/[...all]`                                   | Better Auth GET/POST, endpoint-specific permissions                 |
| `/`                                                    | Signed-in dashboard; personal queries receive the session user ID   |
| `/learn`, `/learn/[topic]`, `/learn/[topic]/[subject]` | Signed-in shell; published hierarchy; unavailable records use 404   |
| `/activities`, `/activities/type/[type]`               | Published practice; unsupported category is 404                     |
| `/activities/[activityId]?attempt=<id>`                | Repeats session check; published activity and owner/activity match  |
| `/announcements`, `/announcements/[announcementId]`    | Published list/detail; unavailable detail uses 404                  |
| `/recording`, `/calendar`                              | Published links and upcoming/ongoing agenda                         |
| `/admin?section=...&q=...&page=...&status=...`         | Teacher/admin page/query guard; accounts additionally require admin |

[auth-session.ts](../src/lib/auth-session.ts) owns role helpers. Actions repeat
permission checks; management queries guard themselves. Published-content helpers
rely on route callers for sessions, and practice helpers receive owner IDs from
server callers. Neither navigation visibility, `server-only`, nor TypeScript types
establish authorization or database row-level security.

## Authentication and database integration

[auth.ts](../src/lib/auth.ts) passes a `pg` Pool to Better Auth's SQL/Kysely integration;
domain queries use Prisma [db.ts](../src/prisma/db.ts). Both use `DATABASE_URL`, with
separate runtime/pool lifecycles. Public signup is disabled; extra loopback auth
origins apply only in development. [route.ts](../src/app/api/auth/[...all]/route.ts)
delegates GET/POST to Better Auth.

The admin plugin defaults to student. Its update-user, set-role and remove-user HTTP
paths are disabled in favor of Genshu actions; other plugin endpoints remain.
Account updates/deletes lock targets, and email/role updates revoke sessions in the
transaction. Password reset delegates to Better Auth, then deletes sessions separately.

[contract.prisma](../src/prisma/contract.prisma) owns 17 models and their constraints:
retained starter `User`/`Post`; four managed `Genshu*` auth models mapped to `genshu_*`;
`Topic` → `Subject` → one `Material` plus `MaterialDraft`; activity category/activity/
ordered questions and owner-bound attempts; announcements, recordings and events.
Roles are strings. Attempt snapshot/answers/result are JSON.

[contract.json](../src/prisma/contract.json) and [contract.d.ts](../src/prisma/contract.d.ts)
are generated. `db:generate` emits them; `build` emits before compilation; `dev` has
no auto-emission plugin. Start/build do not migrate. No migration directory is present;
available commands do not establish deployed history. Commands and data safeguards
are in [README](../README.md#database-and-authentication).

## Content reads, publication and revision

[Learn queries](../src/lib/learn/queries.ts) enforce published parents/materials and
omit subjects without published material. Announcements render plain text. Lesson
HTML is sanitized during conversion and again by [render.ts](../src/lib/learn/render.ts),
which creates unique heading anchors. Recordings open HTTPS provider links; Genshu
cannot revoke copied links or provider playback. Calendar uses explicit Asia/Tokyo
inputs/display, orders by start and selects published events not yet ended.

[Management queries](../src/lib/admin/queries.ts) load one section, escape wildcard
search characters and fetch 21 rows to display 20 plus next-page detection. Published
material/draft lists are separate; HTML loads on preview.
[Management actions](../src/lib/admin/actions.ts) implement these flows:

1. Authorize and validate. Most saves immediately return existing content to draft;
   account edits apply directly. Publication is separate.
2. Import creates `MaterialDraft`; editing published material creates a revision
   while the published version stays available. Repeated editor saves update that draft.
3. UI preview requires acknowledgement. Publication checks published parents,
   replaces/creates the subject's material and deletes the draft transactionally,
   retaining an existing material ID. No approval record/token is stored.
4. Parent deletion locks and checks dependencies; activity/account deletion refuses
   attempts. Material/draft deletion targets one ID. Actions refresh affected routes
   with `revalidatePath`, without a background publication/notification service.

DOCX conversion checks extension/archive, a 10 MiB input cap, 50 MiB actual expanded
ZIP cap and 2,000 entries. It preserves recognized ruby, disables Mammoth external
file access, sanitizes output and returns warnings. Images may be embedded in HTML;
there is no object storage or guarantee of complete Word layout/structure preservation.

## Practice flow

Sources: [queries](../src/lib/activities/queries.ts), [actions](../src/lib/activities/actions.ts),
[grading](../src/lib/activities/grading.ts), [runner](../src/components/activities/activity-runner.tsx),
[draft saver](../src/lib/activities/draft-saver.ts).

1. Start requires published practice with questions. Create an owner-bound
   `in_progress` attempt containing question text/order/keys; client projections omit keys.
2. An attempt URL restores saved answers/result. Without its ID, offer the latest
   open attempt for the activity. Multiple open attempts are possible.
3. Edits debounce 500 ms and serialize writes within one runner. Save checks owner,
   state, membership and booleans; failures retain input for retry. No offline store
   or cross-tab conflict resolution exists.
4. Review shows choices without correctness. Submit flushes pending saves, sends
   full answers and grades the snapshot server-side. Missing answers score zero;
   score is rounded `correct / total × 100`.
5. A conditional state update saves answers/result/timestamps transactionally.
   Repeated submission returns the stored result, with a race fallback reading the
   winner. Retry creates a new attempt; source-question edits do not change snapshots.

Unpublishing blocks the page while save/submit does not recheck publication. The
continuation/history policy is [unresolved](PRD.md#unresolved-product-decisions).

## Limits and verification

- Next.js defaults to a 1 MB Server Action request limit; next.config.ts has no
  override. The 10 MiB converter/UI limit is not an end-to-end upload guarantee;
  deployment/proxy limits are unverified.
- First-admin bootstrap, operator recovery, production backup/restore, hosting
  topology and monitoring have no verified operational procedure. No CI workflow
  is present. Do not infer a hosting provider.
- Compose defines PostgreSQL 18 on loopback port 5433. The ignored/untracked local
  `.env.example` is not a fresh-clone prerequisite; use README's variable names.
- Helper/render tests do not prove real auth, concurrency, browser uploads or complete
  accessibility. Historical results and remaining coverage gaps are centralized in
  [demo-testing.md](demo-testing.md#ringkasan-verifikasi-historis).
