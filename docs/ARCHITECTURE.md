# Genshu architecture

Source review: branch `fresh`, 23 October 2026 (JST). This describes the current
working tree, including existing uncommitted implementation. It is not evidence
of a deployed system. Product scope and unresolved policies are in [PRD.md](PRD.md).

## Stack and structure

Genshu is one Next.js App Router application with server-rendered pages and client
components for interaction. There is no separate application API service.

| Concern | Current choice and authority |
|---|---|
| Runtime/tooling | Bun 1.4.2, TypeScript strict mode, ESLint; [package.json](../package.json), [tsconfig.json](../tsconfig.json) |
| Framework | Next.js 16.3.7, React 19.2.8, React Compiler enabled; [next.config.ts](../next.config.ts) |
| UI | Tailwind 4, shadcn `base-nova`, Base UI, Lucide, next-themes; [components.json](../components.json), [DESIGN.md](../DESIGN.md) |
| Domain persistence | Prisma 8 contract/runtime (`@prisma/orm-postgres` rc.16; CLI rc.21), PostgreSQL; [prisma.config.ts](../prisma.config.ts) |
| Authentication | Better Auth 1.7.7 with its own `pg` Pool, using the same database URL |
| Lesson conversion | Mammoth, JSZip, yauzl and sanitize-html; [material-import.ts](../src/lib/learn/material-import.ts) |

Version details are a reviewed snapshot; package.json and bun.lock own dependency
declarations/resolution. Read installed Next.js guides and the matching Prisma 8
skill before changing integrations rather than assuming older APIs.

| Location | Responsibility |
|---|---|
| `src/app` | Route composition, metadata and loading/error/not-found boundaries |
| `src/components/<feature>` | Feature UI; `ui` holds reusable primitives and `layouts` the shell |
| `src/hooks` | Client interaction state and unsaved-change handling |
| `src/lib/<feature>/queries.ts` | Server-only reads, projections and publication/ownership filters |
| `src/lib/<feature>/actions.ts` | Server Actions, boundary validation, authorization, transactions and cache invalidation |
| `src/prisma` | Contract source, emitted JSON/types, shared domain runtime |
| `scripts`, `tests` | Local seeds/fixture generation and Bun helper/fixture/render tests |

Reuse these feature boundaries; there is no generic repository/service layer.
Imports use the `@/*` alias for `src/*`. Client components call Server Actions for
domain mutations; the only route handler delegates authentication to Better Auth.

## Routes and authorization

The `(home)` group does not appear in URLs. Its [layout](../src/app/(home)/layout.tsx)
calls `requireUser` and supplies identity/management navigation to the shared UI.

| URL | Boundary and behavior |
|---|---|
| `/login` | Redirects existing sessions home; normal email/password form otherwise |
| `/api/auth/[...all]` | Better Auth GET/POST handler; endpoint-specific auth behavior |
| `/` | Signed-in dashboard; personal attempt/result queries receive the session user ID |
| `/learn`, `/learn/[topic]`, `/learn/[topic]/[subject]` | Signed-in shell; published topic/subject/material queries; unavailable records use 404 |
| `/activities`, `/activities/type/[type]` | Published practice only; unsupported category is 404 |
| `/activities/[activityId]?attempt=<id>` | Repeats session check; published activity plus owner/activity match for an attempt |
| `/announcements`, `/announcements/[announcementId]` | Published list/detail; unavailable detail is 404 |
| `/recording`, `/calendar` | Published external recordings and upcoming/ongoing agenda |
| `/admin?section=...&q=...&page=...&status=...` | Teacher/admin page and query guard; accounts section additionally requires admin |

[auth-session.ts](../src/lib/auth-session.ts) defines the role helpers. Mutation
actions repeat authorization; hiding navigation is not the mutation boundary.
Management queries guard themselves; published-content query helpers generally
rely on route callers for sessions and are not individually authenticated APIs.
Practice helpers accept owner IDs supplied by server callers. `server-only`
prevents client imports; it is not authorization or database row-level security.

## Authentication and database integration

[auth.ts](../src/lib/auth.ts) passes a `pg` Pool directly to Better Auth rather than
using a Prisma adapter. Better Auth uses its built-in SQL/Kysely integration;
domain reads/writes use [db.ts](../src/prisma/db.ts). Both use `DATABASE_URL` but
have separate runtime/pool lifecycles. Email/password is enabled, public signup
disabled, and extra localhost/127.0.0.1 auth origins apply only in development.
The auth handler is [route.ts](../src/app/api/auth/[...all]/route.ts).

The admin plugin defaults to student. Genshu account actions create student/teacher
accounts and manage eligible targets; Better Auth's HTTP update-user, set-role and
remove-user paths are disabled in favor of those transactional actions. This does
not disable all admin-plugin endpoints. Account updates/deletes lock the target;
email/role changes revoke sessions transactionally. Password reset delegates to
Better Auth then deletes sessions as a separate operation.

[contract.prisma](../src/prisma/contract.prisma) is authoritative for models,
relations, uniqueness and deletion rules. Its 17 models comprise:

- Preserved starter `User`/`Post`, separate from managed authentication.
- `GenshuUser`, `GenshuSession`, `GenshuAccount`, `GenshuVerification`, mapped to
  `genshu_*` tables. Roles are strings, not database enums.
- `Topic` → `Subject` → one `Material`, with separate `MaterialDraft` records.
- `ActivityCategory` → `Activity` → ordered `ActivityQuestion`; `ActivityAttempt`
  belongs to a user/activity and stores snapshot, answers and result as JSON.
- `Announcement`, `Recording` and `CalendarEvent`.

The emitted [contract.json](../src/prisma/contract.json) and
[contract.d.ts](../src/prisma/contract.d.ts) are generated artifacts. `db:generate`
emits them; `build` emits them before Next.js compilation. `dev` does not include
an emission step, and no framework auto-emission plugin is configured. Neither
start nor build applies database migrations. No migration directory is currently
present; command availability does not establish deployed migration history.
See [README](../README.md#database-and-authentication) for commands and safeguards.

## Content reads, publication and revision

Pages call feature queries, which select the fields needed by UI. Learn queries
check publication at each parent level; subject lists also require published
material. [learn/queries.ts](../src/lib/learn/queries.ts) owns those rules.
Announcements render plain text; lesson HTML is sanitized when converted and
again by [render.ts](../src/lib/learn/render.ts), which also creates unique heading
anchors. Recordings open HTTPS provider links; Genshu does not proxy or revoke
provider playback. Calendar queries select published events whose end has not
passed, order by start, and identify ongoing events. Inputs and displayed dates
use explicit Asia/Tokyo handling.

[admin/queries.ts](../src/lib/admin/queries.ts) loads the active management section,
escapes search wildcard characters and fetches 21 rows to display 20 with next-page
detection. Material published/draft lists are separate; draft HTML loads on preview.
[admin/actions.ts](../src/lib/admin/actions.ts) owns content mutations:

1. Validate input and role. Most saves set the existing record to draft immediately;
   publication is a separate action. Account changes take effect directly.
2. Material import creates `MaterialDraft`. Editing a published material creates a
   draft revision; subsequent editor saves update that draft. Conversion failure
   leaves the published material unchanged.
3. The UI previews content/warnings and requires acknowledgement. Publishing checks
   published parents, updates/creates the subject's single material and deletes
   that draft in a transaction. Existing material identity is retained. There is
   no persisted review acknowledgement or revision approval token.
4. Topic/subject deletion locks and checks children; activity/account deletion
   checks attempts and preserves history. Material/draft deletion targets one ID.
5. Actions use `revalidatePath` to refresh affected pages. This is framework cache
   invalidation, not a background publication or notification service.

DOCX conversion accepts up to 10 MiB, preflights ZIP entries and actual expansion
(50 MiB / 2,000 entries), rejects unsafe archives, preserves recognized Word ruby,
disables Mammoth external file access, sanitizes output and returns warnings.
Images may be embedded in stored HTML. There is no object-storage upload service
or guarantee of identical Word layout or complete unsupported-structure detection.

## Practice flow

Authorities: [queries](../src/lib/activities/queries.ts),
[actions](../src/lib/activities/actions.ts), [grading](../src/lib/activities/grading.ts),
[runner](../src/components/activities/activity-runner.tsx),
[draft saver](../src/lib/activities/draft-saver.ts).

1. Starting checks for published practice with questions and creates an owner-bound
   `in_progress` attempt. Its question snapshot contains text, order and answer keys;
   client question projections omit keys until result feedback.
2. An explicit attempt URL restores its stored answers/result. Without an attempt
   ID, the page offers the latest open attempt for that activity. Starting again
   may create another attempt; there is no single-open-attempt uniqueness rule.
3. Client edits debounce for 500 ms and serialize writes within that runner.
   The server checks owner, state, question membership and boolean answer values.
   Failed saves retain client input and allow retry; there is no offline store.
4. Review displays choices without correctness. Submission flushes pending saves,
   then sends the full answers for transactional server grading against the snapshot.
   Missing answers receive no credit; score is rounded `correct / total × 100`.
5. Conditional state update stores answers/result/timestamps together. Already
   submitted attempts return saved results; the race fallback reads the winner.
   Retry creates a new attempt, leaving previous results intact.

Teacher question edits replace source questions but not existing snapshots. Client
write serialization is per runner, not cross-tab conflict resolution. Unpublishing
blocks the activity page while existing save/submit actions do not recheck activity
publication; the desired continuation/history policy remains unresolved in PRD.

## Limits and verification

- **Upload mismatch:** installed Next.js documents a default 1 MB Server Action
  request limit; next.config.ts has no override. The converter/UI 10 MiB limit is
  not an end-to-end upload guarantee. Deployment/proxy limits are unverified.
- **Operations:** first-admin bootstrap, operator recovery, production backup/restore
  procedure, deployment topology and monitoring are not implemented/documented as
  working procedures. No CI workflow is present. Do not infer a hosting provider.
- **Setup:** Compose defines PostgreSQL 18 on loopback port 5433. The local
  `.env.example` is ignored/untracked; README lists required variables without
  depending on it. No environment values should be committed.
- **Runtime assurance:** the preceding audit passed 23 tests / 254 assertions,
  TypeScript and ESLint, but the local database metadata check was refused
  (`ECONNREFUSED`). Actual schema state, production build and deployment were not
  verified in that audit. No database verification is implied by this document.
- **Coverage:** Bun tests exercise helpers, fixtures, DOCX conversion and static
  component rendering, often mocking actions/dialogs. Database auth, concurrency,
  provider behavior, browser file upload and complete accessibility need separate
  checks. Prior browser/integration/build results are dated evidence, indexed in
  [developer-guide.md](developer-guide.md#historical-verification).

Use [demo-testing.md](demo-testing.md) for reproducible local scenarios and
[DESIGN.md](../DESIGN.md) for interaction requirements. Keep new verification claims
scoped to the actual source, environment and commands tested.
