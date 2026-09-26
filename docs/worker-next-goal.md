# Next worker goal: complete illustration groups and verify the beta revision

Use this task with Codex or Agy. Documentation has been aligned by the reviewer;
implement and verify the remaining product requirements rather than rewriting
architecture or adding later LMS features.

## Goal and preparation

Finish illustration groups as one shared situation/image with three child
questions, preserve source content, enforce group integrity, and produce a
reviewable beta revision with evidence.

Read `AGENTS.md`, `.ai/PROJECT.md`, `.ai/README.md`,
`docs/release-readiness.md`, and `docs/gentsuki-bank-import.md`. Inspect the
current working tree and preserve existing corrections, datasets, migrations,
and documentation edits. Check the target migration ledger before applying
anything; do not edit applied migrations. Read relevant framework and Supabase
skill documentation before changing Next.js or SQL.

## Implementation

- Render one answering unit per standard question or illustration group.
  Display the shared situation/image once and all three children in order.
  Keep independent answers, back navigation, answer editing, keyboard access,
  furigana, and review behavior. Avoid unrelated UI redesign.
- Preserve source wording and answer keys. Metadata such as `focus_points`
  must not become hints, prompts, or explanations. Trace discrepancies to the
  pinned source data and legacy renderer before correcting them.
- Enforce exactly three same-set children at positions 0,1,2. Editor, server,
  and database must reject invalid group saves. Do not partially publish a
  group: all three children must be eligible before it becomes playable.
- Score one point per standard question and two per complete group only if
  every child is correct. Derive score maximum from valid playable units.
  Never award group points for a missing, unpublished, or unanswered child.
- Preserve content/provenance and Sensei edits. Keep runtime on Supabase Data
  API and existing role model. No seed, reset, RLS bypass, or service-role
  shortcut. Add a forward migration only if necessary.

## Verification

Extend grants/RLS checks and local/live fixtures for group tables and save/repair
RPCs. Cover anon, non-staff, Sensei, Tantōsha, and inactive staff. Test drafts,
forbidden writes, missing/duplicate/cross-set children, a partly unpublished
group, successful authoring, and rollback on invalid replacement.

Add meaningful scoring checks for all-correct, one-wrong, and unanswered cases.
Validate group image files as well as standalone question assets. Run import
`--check`, `--dry-run`, and `--verify-live`; use `--apply` only for validated
necessary corrections. Run `bun run verify` and document any justified
`--webpack` fallback. Test desktop and phone-sized browser flows, including
standard-question regressions. Do not call an HTTP 200 a browser test.

## Handoff and operations

Review the actual diff and produce focused commits with no secrets or private
browser output. Prepare a preview only when the existing project's access and
authorization permit it; identify its source commit and test that deployment.
Do not infer permission to publish production from this document alone.

Follow `docs/recovery.md` to rehearse export/restore on an isolated Supabase
target when resources are available. Never restore to production. Report the
precise missing resource if this step cannot run, while completing independent
implementation work. Update release evidence with actual checks, commits,
environments, and remaining limitations.

## Done

The player and review preserve grouped content; editor/server/database preserve
complete groups; scoring and role tests cover failure cases; source/data/assets
remain correct; mandatory checks pass; the handoff identifies verified revision
and deployment scope. Recovery or deployment steps without evidence remain
explicitly incomplete. Report changed behavior, migrations, test outcomes,
commit/preview URL, and blockers; do not equate a green build with a shipped beta.
