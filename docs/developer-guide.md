# Genshu developer guide — branch `fresh`

This guide is the v1 product specification and implementation record for branch
`fresh`. **Scaffold before implementation** describes the starting templates;
**Required for v1** remains the agreed implementation scope; **Deferred** stays
outside v1. The status section at the end records implementation and verification.

## Product and implementation boundaries

**Required for v1:** Genshu serves managed students. Administrators provision
accounts; there is no public registration. Published content is shared across all
managed students. Teachers/administrators manage content; students cannot perform
management operations. Prioritize material → practice → saved feedback.

Keep the existing page/component/hook/query/action/grading separation. Use existing
UI components. Do not introduce generic repositories or base services merely to
implement this guide. Read the installed Next.js guides under
`node_modules/next/dist/docs/` and the version-matched Prisma 8 skill before
implementing their integrations.

**Deferred:** class membership and class-specific visibility, attendance,
public registration, Google login, billing, recurring events, calendar sync,
video uploads, and question-set import from Word. Formal exams, mock exams,
and assignments are also deferred until their policies are specified.

## Route requirements

### Home `/`

**Scaffold before implementation:** a static account-update success alert, empty buttons, and
empty cards. The alert is not evidence that an account update occurred.

**Required for v1:** show published announcement previews, upcoming events,
the signed-in student's recent saved practice results, and links to Learn and
Activities. Remove the unconditional success alert. Give each collection a useful
empty state; do not invent attendance or other statistics without real data.

### Learn `/learn`, `/learn/[topic]`, `/learn/[topic]/[subject]`

**Scaffold before implementation:** topics, subjects, and materials come from static arrays.
Topic and subject links incorrectly use `/learns`. Missing records invoke 404;
the material page checks the material but displays skeletons instead of its content.

**Required for v1:** preserve topic → subject → material navigation, correct links
to `/learn`, use readable titles rather than raw IDs, show descriptions and
breadcrumbs, and render the published material. Generate chapter links from its
headings with stable anchors. Use a semantic aside for chapter navigation; make
content and navigation usable on narrow screens. Permanent skeletons must become
content, genuine loading feedback, or an appropriate empty state.

Teachers must be able to import **`.docx` lesson materials** into a draft. Preserve
headings, ordinary text formatting, lists, links, images, simple tables, and
Japanese furigana, rendered with semantic ruby markup. The target is responsive
web content, not identical Word pagination. Provide a preview and explicit
warnings for unsupported content; require review before publishing. Do not
silently discard furigana or unsupported structures. Validate file type and size
at the server boundary, limit decompression/resource use, sanitize converted
content and URLs, and never execute imported content as code. Select and document
upload limits and conversion tooling during implementation, using representative
Word fixtures to verify preservation. Failed conversion must leave published
content untouched. Markdown is not a mandated intermediate format.

### Activities `/activities`, `/activities/type/[type]`, `/activities/[activityId]`

**Scaffold before implementation:** these routes originally selected categories and opened a local-only runner. The current implementation persists authenticated attempts and question snapshots.

**Required for v1:** keep these URLs and module responsibilities. Expose only
ready practice content in student navigation; do not advertise the other three
categories as implemented. Retain their existing type definitions for future work.
Save drafts and results owned by the student, resume unfinished attempts, and
allow repeat practice through new attempts. Show immediate per-question feedback
and the score after successful submission. Provide a route back to the activity
list; do not require retry to leave the result screen.

Extend the existing interfaces only as needed for stable attempt identity,
saved answers, lifecycle state, and question snapshots/versions. The server must
validate attempt ownership, question membership, and submission state; calculate
the score; and save answers/results atomically. Retries of the same submission
must return the saved outcome rather than create duplicate results. An attempt
must use the question version it started with, even if a teacher later edits
the activity. Preserve input on failed save/submit and show whether drafts are
saved so students are not misled about recoverability.

**Deferred:** formal exam/assignment deadlines, attempt limits, delayed answer
disclosure, and mock-exam policies. Their future server rules must be defined
before those categories are exposed; practice behavior is not an exam policy.

### Class recordings `/recording`

**Scaffold before implementation:** a placeholder; no recording collection or playback exists.

**Required for v1:** keep `/recording`, label navigation “Class recordings”, and
let teachers publish title, description, lesson date, and an externally hosted
video link. Students browse published recordings and open the provider link.
Validate links and show a clear empty state. Genshu protects its listing;
the provider controls video access. An unlisted link does not guarantee
student-only playback, and hiding it in Genshu cannot revoke a copied link.

### Announcements `/announcements`

**Scaffold before implementation:** a placeholder with a copied Activities comment.

**Required for v1:** teachers create drafts and explicitly publish them. Students
see published announcements newest first and can open full content. Use a detail
route `/announcements/[announcementId]` and dashboard previews linking to it.
Distinguish an empty collection from an unavailable item or a server failure.

### Calendar `/calendar`

**Scaffold before implementation:** a placeholder with a copied Activities comment.

**Required for v1:** a chronological agenda of published teacher-created lessons
and events, including title, details, and start/end times. Validate the time range.
Store unambiguous instants and display Asia/Tokyo time, including for viewers whose
browser uses another timezone. Identify the timezone in the interface. Include
an empty state and dashboard links to upcoming events.

### Login `/login` and account access

**Scaffold before implementation:** the form is not connected to authentication. It offers
inactive Google login and placeholder signup/reset links. Better Auth enables
email/password in configuration but imports a missing client and still specifies
a MySQL adapter; session enforcement and auth routes are absent.

**Required for v1:** administrator-provisioned accounts, email/password login,
working logout, expired-session handling, and server-side authorization. Disable
public registration on the server, not just in the interface. Remove inactive
Google/signup/reset controls until supported. Specify an administrator-assisted
credential recovery procedure rather than promising an email reset flow.
Protect learning routes and each data operation; draft content requires management
permission. Students can read only their own attempts/results. Direct action
requests must enforce the same permissions as pages. Do not log or expose passwords.

### Management `/admin` (new)

**Scaffold before implementation:** no management route exists.

**Required for v1:** an area restricted to authorized teachers/administrators for
managing topics, subjects, imported materials, practice questions, recording
links, announcements, and events. Support draft review and explicit publication.
Only administrators provision/manage student accounts. Publishing a practice
requires usable questions. Teacher edits must not invalidate saved attempts.
Define role assignment and first-admin provisioning in the implementation setup;
never let public requests assign privileged roles.

### Shared layout and account navigation

**Scaffold before implementation:** desktop-oriented navigation, a sample avatar, inactive
account actions, and scaffold page metadata. Footer information is static.

**Required for v1:** mobile navigation, meaningful page titles, accessible controls
and keyboard focus, real signed-in identity, and working logout. Remove Billing,
Settings, and other inactive account actions until supported. Keep student
navigation separate from authorized management navigation. Footer version/identity
text must reflect the application rather than imply unsupported functionality.

## Implemented modules and route connections

The prepared components now render data from server-only query modules and are
connected to their routes:

| Area | Route and responsibility |
|---|---|
| Home | `/` loads published announcement previews, upcoming events, recent student results, and Learn/Activities links. |
| Learn | `/learn` → `/learn/[topic]` → `/learn/[topic]/[subject]` reads published records; material HTML is sanitized and headings create the chapter navigation. |
| Practice | Existing Activities URLs expose practice only; server actions own draft save, submission, grading, and retry behavior. |
| Recordings | `/recording` lists published provider links and labels dates. |
| Announcements | `/announcements` lists published items and `/announcements/[announcementId]` renders detail. |
| Calendar | `/calendar` lists published events in chronological Asia/Tokyo time. |
| Management | `/admin` gates content editing to teachers/admins and account management to admins. Word import creates reviewed drafts. |

Query modules remain server-only. Server actions repeat authorization checks at
mutation boundaries; pages are not the only permission layer. Imported content is
sanitized both before it is stored and when rendered. Empty collections have
purpose-built states; operational failures use route error boundaries where
provided.

**Deferred:** formal exam, mock exam, assignment, attendance, class membership,
calendar sync, and video upload behavior remain outside v1.

## Data integration and page-state rules

**Scaffold before implementation:** Prisma configuration/runtime target Prisma 8/PostgreSQL;
the contract has only User/Post starter models. Activities still import missing
`@/lib/db` and generated enums. Auth still configures MySQL. Package scripts and
README describe an older generation/migration setup and MariaDB/Prisma 7.

**Required for v1:** use one consistent runtime, generated contract, and supported
authentication integration. Model the actual account/content/practice domains,
reconcile query callers and category types, and update scripts and README to the
verified workflow. Changing an adapter provider alone does not establish
compatibility. Review migration effects and existing data before applying changes;
this documentation pass does not authorize resetting a database.

For every data-backed route, distinguish loading, a valid empty collection,
an unavailable record (404), and an operational failure (retry/error state).
Use the project's installed Next.js boundary APIs. Do not disguise database errors
as empty collections or 404s, expose raw driver errors, or clear student input on
failed mutations. Keep server modules server-only and select response fields
explicitly; a TypeScript type is not runtime validation or authorization.

## Acceptance scenarios and implementation order

1. Reconcile database/auth integration and setup instructions. Then complete
   managed login and publication permissions, Learn/Word import, and saved
   practice. Follow with recordings, announcements/events, and dashboard summaries.
   Build only the management operations needed by each completed flow.
2. A provisioned student signs in/out; an expired session requires login.
   Public registration and student management requests are denied, including
   direct actions. Draft content and another student's attempts are inaccessible.
3. Topic → subject → material links stay under `/learn`, show readable titles,
   work on mobile, and handle unknown IDs. Word fixtures preserve ruby, images,
   headings, and tables; unsupported content produces warnings. Invalid/oversized
   files fail safely and nothing becomes public without review.
4. Practice accepts both true and false answers, distinguishes unanswered items,
   saves/resumes drafts, preserves input on failure, and shows saved feedback.
   Repeated submission creates one result; retry creates a new attempt. Editing
   questions mid-attempt does not change that attempt's grading key.
5. Students see published announcements/recordings/events, never drafts. Full
   announcements open correctly. Empty collections give useful feedback, and
   database failures offer retry instead of looking empty. Recording links open
   the intended provider without implying stronger privacy than it offers.
6. Calendar start/end times display correctly in Asia/Tokyo even from a browser
   set to another timezone. Dashboard summaries use real data. Keyboard and
   narrow-screen navigation work across student and management routes.

## Implementation status — 2026-10-10

The v1 student routes, protected management area, account provisioning, content
draft/publication flows, practice attempts, and dashboard data reads are connected
to the Prisma 8 PostgreSQL contract. Better Auth uses its Kysely adapter and a
PostgreSQL Pool because the installed Better Auth Prisma adapter is incompatible
with Prisma 8. Auth tables are mapped to separate `genshu_*` tables; the existing
starter `User` and `Post` models are retained. Public sign-up is disabled and
roles can be assigned only through the authorized server-side provisioning flow.

The local setup, first-administrator, and recovery procedures are in the README.
The DOCX converter accepts `.docx` files up to 10 MiB, limits expanded ZIP content
to 50 MiB and 2,000 entries, blocks external file access, preserves Word ruby as
semantic `<ruby>` markup, sanitizes converted content, and stores an unpublished
draft for preview. Material publication is a separate reviewed transaction.
Practice categories expose only `practice`; saved attempts retain question
snapshots and server-computed results. Calendar instants are interpreted and
displayed in Asia/Tokyo.

Unit tests cover true/false/unanswered scoring and a generated Word document with
furigana and invalid-file rejection. TypeScript, lint, and production build pass.
An isolated PostgreSQL database (`genshu_v1_test_20261010`) was initialized after
reviewing a dry run of 49 additive operations. The configured development
database was also found empty, then initialized with those additive operations
and the idempotent `practice` category seed. No reset or destructive migration
was run. Browser checks on the isolated app covered sign-in/out,
student management denial, draft announcement hiding, topic/subject/material
navigation, rendered ruby and table content, draft resume, saved result reload,
repeat attempt, mobile navigation, dashboard data, and Asia/Tokyo event display
with the server running in America/Los_Angeles. The repeat-attempt check exposed
and verified a fix for stale result state when switching attempts.

The DOCX upload control could not be exercised in the browser because this
browser profile blocks local file chooser access; conversion itself was checked
with a generated `.docx` fixture. Idempotent submission is enforced in the
transactional server action, but simultaneous duplicate HTTP submissions were
not stress-tested. Other Word structures, operational database failure recovery,
and every direct authorization path still need broader production-like coverage.
The isolated test database is separate from the configured application database.
Before applying schema changes to any data-bearing database, review the dry-run
operations, confirm the target, and take a backup.
