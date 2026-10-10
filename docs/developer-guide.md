# Genshu developer guide — branch `fresh`

This is a requirements handoff, not a statement that the features below already work.
**Current behavior** describes the checked-in code; **Required for v1** describes
the agreed target; **Deferred** identifies work outside the first version.
Source comments point here and identify local responsibilities or missing behavior.

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

**Current behavior:** a static account-update success alert, empty buttons, and
empty cards. The alert is not evidence that an account update occurred.

**Required for v1:** show published announcement previews, upcoming events,
the signed-in student's recent saved practice results, and links to Learn and
Activities. Remove the unconditional success alert. Give each collection a useful
empty state; do not invent attendance or other statistics without real data.

### Learn `/learn`, `/learn/[topic]`, `/learn/[topic]/[subject]`

**Current behavior:** topics, subjects, and materials come from static arrays.
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

**Current behavior:** these routes select a category, list its activities, and
open a runner. The hook manages local answers/navigation; the runner handles
submit/results. Queries exclude answer keys from initial questions. The server
validates submissions and calculates scores with a pure grading function, but
does not authenticate or save attempts. Refresh loses answers/results. Results
include correct answers, even though the UI currently shows only aggregate scores.
The database imports are broken; this is not yet a working end-to-end flow.

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

**Current behavior:** a placeholder; no recording collection or playback exists.

**Required for v1:** keep `/recording`, label navigation “Class recordings”, and
let teachers publish title, description, lesson date, and an externally hosted
video link. Students browse published recordings and open the provider link.
Validate links and show a clear empty state. Genshu protects its listing;
the provider controls video access. An unlisted link does not guarantee
student-only playback, and hiding it in Genshu cannot revoke a copied link.

### Announcements `/announcements`

**Current behavior:** a placeholder with a copied Activities comment.

**Required for v1:** teachers create drafts and explicitly publish them. Students
see published announcements newest first and can open full content. Use a detail
route `/announcements/[announcementId]` and dashboard previews linking to it.
Distinguish an empty collection from an unavailable item or a server failure.

### Calendar `/calendar`

**Current behavior:** a placeholder with a copied Activities comment.

**Required for v1:** a chronological agenda of published teacher-created lessons
and events, including title, details, and start/end times. Validate the time range.
Store unambiguous instants and display Asia/Tokyo time, including for viewers whose
browser uses another timezone. Identify the timezone in the interface. Include
an empty state and dashboard links to upcoming events.

### Login `/login` and account access

**Current behavior:** the form is not connected to authentication. It offers
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

**Current behavior:** no management route exists.

**Required for v1:** an area restricted to authorized teachers/administrators for
managing topics, subjects, imported materials, practice questions, recording
links, announcements, and events. Support draft review and explicit publication.
Only administrators provision/manage student accounts. Publishing a practice
requires usable questions. Teacher edits must not invalidate saved attempts.
Define role assignment and first-admin provisioning in the implementation setup;
never let public requests assign privileged roles.

### Shared layout and account navigation

**Current behavior:** desktop-oriented navigation, a sample avatar, inactive
account actions, and scaffold page metadata. Footer information is static.

**Required for v1:** mobile navigation, meaningful page titles, accessible controls
and keyboard focus, real signed-in identity, and working logout. Remove Billing,
Settings, and other inactive account actions until supported. Keep student
navigation separate from authorized management navigation. Footer version/identity
text must reflect the application rather than imply unsupported functionality.

## Unwired developer templates

**Current behavior:** the following files are organizational starting points.
Components export named functions and render labeled template cards; they have
no data props, working controls, or route imports. Supporting modules contain
guidance and `export {}` only, not functioning queries/actions. Their presence
does not mean the corresponding feature is implemented.

Paths below are relative to `src/`:

| Area | Component files | Connection during implementation |
|---|---|---|
| Home | `components/home/home-dashboard.tsx` | Compose published announcement/event summaries and the student's saved practice summaries in `/`. |
| Learn | `components/learn/topic-card.tsx`, `subject-card.tsx` | Connect established topic/subject props to the existing Learn lists; correct links to `/learn`. |
| Materials | `components/learn/material-content.tsx`, `chapter-navigation.tsx` | Replace permanent material skeletons with sanitized published content and heading-derived chapter links. |
| Recordings | `components/recordings/recording-card.tsx` | Use published summaries in `/recording`; add validated external provider links. |
| Announcements | `components/announcements/announcement-card.tsx`, `announcement-content.tsx` | Use previews in the list/Home; connect full content after creating the authorized detail route. |
| Calendar | `components/calendar/event-card.tsx` | Populate the chronological `/calendar` agenda and display Asia/Tokyo times. |
| Management | `components/admin/student-account-form.tsx`, `content-publish-controls.tsx`, `material-import-form.tsx` | Connect only inside authorized management routes once the matching server operations exist. |

**Required for v1:** implement publication-filtered, authorized reads in
`lib/recordings/queries.ts`, `lib/announcements/queries.ts`, and
`lib/calendar/queries.ts`. Implement validated management mutations in
`lib/admin/actions.ts` and reviewed Word-to-draft conversion in
`lib/learn/material-import.ts`. Introduce server-only boundaries and server action
directives when those modules gain executable server responsibilities. Do not
import database clients into display components.

Define props from established domain contracts when data integration is ready;
replace the template label/message with actual rendering and appropriate page
states. Add client boundaries only for working interactive controls. Keep account
creation administrator-only, require Word preview/review before publication,
and preserve saved practice snapshots during content edits. No new hooks or
generic services are needed merely to connect these templates.

**Deferred in this scaffold pass:** wiring templates into routes, creating
`/admin` or announcement detail routes, changing Activities/Login interfaces,
and adding database models, dependencies, uploads, or fake data.

## Data integration and page-state rules

**Current behavior:** Prisma configuration/runtime target Prisma 8/PostgreSQL;
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

### Documentation verification baseline

On this branch before documentation changes, TypeScript reported five errors:
missing database/enum imports and resulting implicit-any errors in Activities
queries and auth. ESLint on `src` reported four `no-empty-object-type` errors in
generated `src/prisma/contract.d.ts`. Resolve generated-file lint policy rather
than hand-editing generated types. Rerun checks after implementation; do not treat
this baseline as permission to introduce additional failures.

This pass deliberately skips feature implementation, migrations, dependencies,
and browser testing. Main risks remain database/auth compatibility, Word import
fidelity, and external recording permissions.
