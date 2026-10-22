# Genshu product requirements

Reviewed against the working tree on branch `fresh`, 23 October 2026 (JST).
**Implemented** means present in source. **Tested** identifies specific evidence,
not a guarantee that every browser, database, or production scenario works.
**Deferred** is outside current scope; **unresolved** requires a product decision.

## Purpose and users

Genshu is a managed Japanese-learning portal. Its core journey is material →
practice → saved feedback. Students use accounts provided by an administrator;
teachers manage learning content. The interface is Indonesian, while teacher
content retains its original language. The intended audience is teenagers and
adults, as described in [DESIGN.md](../DESIGN.md); age eligibility is not enforced.

Published content is shared across managed users. There is no class membership
or class-specific visibility model. See [ARCHITECTURE.md](ARCHITECTURE.md) for
source references and [demo-testing.md](demo-testing.md) for local evaluation.

## Roles and permissions

These describe the implemented Genshu flows, not every capability of Better Auth.

| Role | Learning and practice | Content management | Account management |
|---|---|---|---|
| Visitor | Login only; no public signup | None | None |
| Student | Published content; own attempts/results | None | Administrator-assisted recovery |
| Teacher | Same signed-in learning routes and own practice | Topics, subjects, materials, practice, announcements, recordings, events | No Genshu account management |
| Admin | Same signed-in learning routes and own practice | Same content operations as teacher | Create student/teacher accounts, edit managed profiles/roles, reset passwords, delete eligible accounts |

Account profile/role edits and deletion reject the current account, administrator
targets, and unsupported target roles. New/edited roles in these forms are limited
to student or teacher. Password reset is a separate admin action, including for
administrator accounts; it revokes target sessions. Email or role changes also
revoke sessions; name-only edits preserve them. Accounts with any practice attempt
cannot be deleted. There is no implemented first-admin bootstrap or operator
recovery procedure; the local demo seed is not a production substitute.

## Implemented journeys

| Journey | Current behavior |
|---|---|
| Sign in and return | Email/password login, logout, session redirect, real signed-in identity. Development login offers seeded demo credentials; this does not create accounts or bypass authentication. |
| Continue learning | Home shows published announcements, upcoming/ongoing events, the user's recent practice results, an available unfinished attempt, and learning links. |
| Read a lesson | `/learn` → topic → subject/material, with readable titles, breadcrumbs, sanitized lesson content, ruby/furigana, and heading navigation. Subjects without a published material are omitted from the student list. |
| Import and revise | Teacher/admin imports DOCX into a draft, previews warnings/content, acknowledges review in the UI, and publishes separately. Published material edits create revisions; the old version stays available until replacement publication. |
| Practice | Browse published true/false practice, start or resume an attempt, navigate questions, autosave, review choices before submission, then see saved score and question feedback. Retry creates a new attempt. |
| Manage content | `/admin` uses sections, title search, pagination, full-screen editors, draft/publication controls, and confirmed deletion. Account search matches name or email. |
| Follow class updates | Read published announcements and full details, open external recording links, and view a chronological agenda in Asia/Tokyo. |

The legacy category URL `/activities/type/practice` remains supported alongside
the direct `/activities` list. Other activity categories are not exposed.

## Business rules and acceptance criteria

The rules below are implemented in source. The evidence column distinguishes
automated coverage from behavior that still needs integration/browser verification.

| Area | Acceptance criterion | Evidence and limits |
|---|---|---|
| Access | Missing sessions redirect to login; students cannot use content management; only admins use account actions. Attempts are selected by signed-in owner. | Source guards; dated integration reports. The current automated suite does not exercise real auth/HTTP boundaries. |
| Visibility | A lesson requires published topic, subject, and material. Student announcements, recordings, and events require publication. | Query/action source; material UI render coverage. |
| Publication | Most content edits return that record to draft. Material revisions preserve the published version. Material publication requires published parents and replaces the subject's single material, retaining its ID when present. | Source transactions; historical material integration evidence. Review acknowledgement is a UI control, not a persisted approval. |
| Word import | Import failure leaves published material untouched. Conversion checks DOCX extension/archive, size and expansion limits, blocks external file access, sanitizes HTML, and returns warnings for review. | Generated DOCX test covers headings, ruby, table, image, formatting and link. It does not prove all Word structures or the full advertised upload size; see technical limits. |
| Practice readiness | New attempts require published practice with questions; publication rejects practice without questions. | Query/action source; historical integration evidence. |
| Answers | Both `true` and `false` count as answers. Unknown question IDs and non-boolean values are rejected. Missing answers are allowed and receive no credit. | Validation/grading source; fixture, review and draft-saver tests. |
| Scoring | Score is rounded `correct / total × 100`; incorrect and unanswered counts remain separate. Feedback/keys appear after persisted submission. | Pure grading source plus fixture/render tests. No correctness feedback during question entry. |
| Persistence | Attempts retain their initial question text/order/keys. Submission stores answers/result/state in one transaction; repeated submission returns the saved outcome. Retry uses a new ID. | Action source and historical integration reports; no repeatable database concurrency test in the current suite. |
| Deletion | Refuse topic deletion with subjects, subject deletion with material/drafts, and activity/account deletion with attempts. Removing a recording deletes its listing, not the provider video. | Action/contract source; UI render tests and dated integration reports. |
| Dates | Recording dates and event inputs are interpreted in Asia/Tokyo; event end must follow start. Agenda includes events not yet ended and labels ongoing events. | Validation/query source and Tokyo date-range tests. |
| Failure states | Distinguish loading, empty collections, unavailable records, and operational errors. Failed form/save/submit operations retain client input and offer recovery feedback. | Implemented components/boundaries and focused tests; full failure/navigation coverage remains incomplete. |

Interaction requirements remain in [DESIGN.md](../DESIGN.md): accessible focus,
keyboard controls, narrow-screen navigation, readable lessons, reduced motion,
and clear pending/error/success states. These are intended quality requirements;
the existence of components or token tests is not a complete accessibility audit.

## Deferred or unsupported

- Formal exams, mock exams and assignments, including deadlines, attempt limits,
  delayed disclosure and grading policies. Existing type names are placeholders
  for future behavior, not implemented product capabilities.
- Class membership, attendance, class-specific content and billing.
- Public registration, Google login and self-service email password recovery.
- Recurring events, calendar synchronization, hosted video uploads and playback
  access enforcement at an external provider.
- Importing question sets from Word or reproducing exact Word pagination.

## Unresolved product decisions

1. **Unpublished practice:** its page and result links become unavailable, but
   existing save/submit actions do not recheck publication. Decide whether ongoing
   attempts may continue and whether saved history must always remain readable.
2. **Review approval:** decide whether UI acknowledgement is sufficient or whether
   publishing must record/enforce review of a specific revision on the server.
3. **Operational access:** choose and implement first-admin provisioning and
   recovery when no administrator can sign in. No procedure is implied here.
4. **Upload promise:** choose an end-to-end supported size and align request,
   converter, deployment and UI limits. Current 10 MiB converter/UI wording is
   constrained by the unconfigured 1 MB Server Action request limit.
5. **History retention:** deletion currently refuses accounts/activities with
   attempts. No retention period, archival or anonymization policy is defined.

## Verification status

The preceding repository audit ran 23 tests / 254 assertions, TypeScript and ESLint
successfully. Tests cover pure helpers, fixtures, conversion and rendered UI;
they do not constitute an end-to-end acceptance suite. The audit's read-only local
database check returned `ECONNREFUSED`; database state and production behavior
were not verified. Browser/build claims in older reports retain their original
dates and scope; see the [evidence index](developer-guide.md#historical-verification).
