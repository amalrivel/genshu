# Genshu product requirements

Implementation reviewed on branch `fresh`, 23 October 2026 (JST). **Implemented**
means present in source, not fully tested. Historical test evidence is summarized
in [demo-testing.md](demo-testing.md#ringkasan-verifikasi-historis).

## Purpose and users

Genshu is a managed Japanese-learning portal: material → practice → saved feedback.
Students use administrator-provided accounts; teachers manage content. The interface
supports Indonesian (default) and Japanese; teacher content retains its original language. The intended audience
is teenagers and adults ([DESIGN.md](../DESIGN.md)); age eligibility is not enforced.
Published content is shared across managed users, without class-specific visibility.

## Roles and permissions

These describe Genshu flows, not every Better Auth plugin capability.

| Role    | Learning                                        | Management                                                                                                   |
| ------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Visitor | Login; no public signup                         | None                                                                                                         |
| Student | Published content and own attempts/results      | Administrator-assisted account recovery                                                                      |
| Teacher | Same signed-in learning routes and own practice | Topics, subjects, materials, practice, announcements, recordings and events                                  |
| Admin   | Same learning access as teacher                 | Content plus student/teacher provisioning, profile/role edits, password resets and eligible account deletion |

Profile/role edits and deletion reject the current account, administrator targets
and unsupported roles. Forms only assign student/teacher. Password reset is a
separate admin action and can target administrators. Password resets and email/role
changes revoke target sessions; name-only edits preserve them. Accounts with any
practice attempt cannot be deleted. First-admin bootstrap and operator recovery
remain missing; the local demo seed is not a production substitute.

## Interface localization

next-intl translates application UI in Indonesian and Japanese. The login page and
account menu expose the language switch. A browser cookie stores the choice;
invalid/missing values fall back to Indonesian. URLs, access checks and database
content are unchanged. User-facing dates use the selected locale and Asia/Tokyo.
Names, titles, lessons, questions, descriptions and imported content are not
translated. Third-party document-conversion warnings remain as received.

## Implemented journeys

| Journey        | Current behavior                                                                                                                                                                                                                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sign in        | Email/password login, logout, session redirects and real user identity. Development demo buttons only fill credentials; they do not create accounts or bypass auth.                                                                                                                                                                      |
| Continue       | Home shows published announcements, personal recent results, an available unfinished attempt and a practice entry point. Learn and calendar entry points are temporarily hidden from navigation and Home; direct routes and management remain available.                                                                                 |
| Learn          | `/learn` → topic → subject/material, with titles, breadcrumbs, sanitized lessons, ruby/furigana and heading navigation. Subjects without published material are omitted.                                                                                                                                                                 |
| Import/revise  | DOCX creates a draft with preview/warnings. UI review precedes separate publication; material revisions leave the old version available until replacement.                                                                                                                                                                               |
| Practice       | Published true/false practice supports start/resume, question navigation, autosave, pre-submit review, saved scoring/feedback and new repeat attempts. `/activities/type/practice` remains supported.                                                                                                                                    |
| Manage         | `/admin` defaults to practice; navigation temporarily shows practice, announcements, recordings and admin-only accounts. Material/topic/subject/event management remains accessible by direct URL. It has sections, title search (name/email for accounts), 20-item pagination, full-screen editors, publication and confirmed deletion. |
| Follow updates | Published announcements have detail pages; recordings open external links; the chronological agenda uses Asia/Tokyo.                                                                                                                                                                                                                     |

## Business rules and acceptance criteria

These rules are implemented; coverage varies. Source references are in
[ARCHITECTURE.md](ARCHITECTURE.md), rather than duplicated here.

| Area            | Acceptance criterion                                                                                                                                                                                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Access          | Missing sessions redirect to login. Students cannot manage content; account actions require admin. Attempts are selected by signed-in owner.                                                                                                                                      |
| Visibility      | Lessons require published topic, subject and material. Student announcements, recordings and events require publication.                                                                                                                                                          |
| Publication     | Most content edits return the record to draft. Material revisions preserve the published version; publication requires published parents, replaces the subject's single material and retains its existing ID. UI acknowledgement is not a stored approval.                        |
| DOCX            | Failed conversion leaves published material untouched. Validate archive/type/resource limits, sanitize HTML and show conversion warnings for review. Preserve supported text, headings, formatting, lists, links, images, tables and ruby; exact Word pagination is not required. |
| Readiness       | Starting requires published practice with questions; publication rejects practice without questions.                                                                                                                                                                              |
| Answers/scoring | `true` and `false` both count. Reject unknown question IDs/non-booleans. Missing answers receive no credit. Score is rounded `correct / total × 100`; incorrect and unanswered counts stay separate. Feedback/keys follow persisted submission.                                   |
| Persistence     | Retain initial question text/order/keys in snapshots. Submit answers/result/state transactionally; repeated submission returns the saved outcome. Retry creates a new attempt.                                                                                                    |
| Deletion        | Refuse topics with subjects, subjects with material/drafts, and activities/accounts with attempts. Deleting a recording removes its listing, not the provider video.                                                                                                              |
| Dates           | Interpret recording/event inputs in Asia/Tokyo. Event end must follow start; the agenda includes events not yet ended and marks ongoing ones.                                                                                                                                     |
| Failures        | Distinguish loading, empty collections, 404 and operational errors. Failed form/save/submit operations retain client input and offer recovery.                                                                                                                                    |

[DESIGN.md](../DESIGN.md) owns interaction requirements, including accessible focus,
keyboard/mobile navigation, readable lessons and reduced motion. Components/token
checks do not establish complete accessibility or production readiness.

## Deferred or unsupported

- Exams, mock exams and assignments: existing type names do not implement deadlines,
  attempt limits, delayed answer disclosure or grading policies.
- Class membership, attendance, class-specific content and billing.
- Public signup, Google login and self-service email password recovery.
- Recurring events, calendar sync, video uploads and provider playback enforcement.
- Word question-set import and exact Word pagination.

## Unresolved product decisions

1. **Unpublished practice:** its page/results become unavailable, but existing
   save/submit actions do not recheck publication. Decide continuation and history access.
2. **Review approval:** decide whether acknowledgement needs server enforcement and
   a record tied to a specific revision.
3. **Operational access:** define and implement first-admin provisioning and recovery
   when no administrator can sign in.
4. **Upload promise:** align converter, request, deployment and UI limits. The current
   10 MiB converter/UI wording exceeds the unconfigured 1 MB Server Action limit.
5. **Retention:** define archival/anonymization or retention periods; current deletion
   simply refuses accounts/activities with attempts.
