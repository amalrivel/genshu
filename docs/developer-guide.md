# Genshu developer guide

This compatibility entry replaces the former combined specification, scaffold
history and implementation guide. Current responsibilities are split as follows:

- [PRD](PRD.md): product purpose, permissions, implemented journeys, acceptance
  criteria, deferred scope and unresolved decisions.
- [Architecture](ARCHITECTURE.md): actual modules/routes, auth/database boundaries,
  publication/revisions, practice snapshots and known technical limits.
- [README](../README.md): local setup, environment names and database commands.
- [AGENTS](../AGENTS.md): development instructions and relevant checks.
- [DESIGN](../DESIGN.md): interaction and visual requirements.
- [Demo/testing](demo-testing.md): local fixtures, accounts and browser scenarios.

## Activities

Existing source comments referring to this guide's Activities section should use
[practice requirements](PRD.md#business-rules-and-acceptance-criteria) and
[practice data flow](ARCHITECTURE.md#practice-flow). Only practice is implemented;
exam, mock-exam and assignment policies remain deferred.

## Historical verification

These records describe earlier checks, not current acceptance or deployment
status. The original guide's claim that README supplied first-administrator and
operator recovery procedures was incorrect: those procedures remain missing.
The converter's 10 MiB cap also does not establish the browser request limit;
see [current technical limits](ARCHITECTURE.md#limits-and-verification).

Keep the following reports as dated evidence with their own limits:

- [UI/UX verification, 15 October 2026 and follow-ups](ui-ux-verification.md)
- [Practice polish, 21 October 2026](polish-2026-10-21.md)
- [Content deletion verification, 21 October 2026](admin-delete-verification.md)
- [Account/search verification, 21–22 October 2026](accounts-search-verification.md)

### Original implementation checks — 10 October 2026

The original record reported passing TypeScript, lint and a production build,
plus scoring and generated DOCX checks. This is historical evidence, not a claim
that all boundary cases have automated tests in the current suite. The original
database/browser record and its limitations are retained below:

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


### Earlier UX verification note

The former guide also recorded passing TypeScript, ESLint, `git diff --check`,
and focused same-day/cross-day Asia/Tokyo event-range tests in a UX pass.
Browser behavior, a full responsive visual review and the broader application
test suite were not checked in that pass. Later reports above describe their
own additional coverage; they do not erase these historical limits.
