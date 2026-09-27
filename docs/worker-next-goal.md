# Next worker goal: fix imported-bank authoring and catalog correctness

## Goal

Resolve the four reproduced defects in `docs/release-readiness.md`, preserving
illustration groups, source wording, answer keys, provenance and existing role
permissions. Produce a reviewable revision of draft PR #1. Do not add LMS
features or redesign the application.

## Preparation

Read `AGENTS.md`, `.ai/PROJECT.md`, `.ai/README.md`,
`docs/release-readiness.md` and `docs/gentsuki-bank-import.md`. Inspect branch,
worktree and PR scope before editing; preserve reviewer documentation changes
and untracked `.agents/rules/`. Read applicable Next.js guides and Supabase
skills. Runtime stays on Supabase Data API; no ORM or direct database runtime.

## Fixes

1. Accept `NON_JLPT` through the real practice server action. The existing
   two-character field limit makes every imported-bank save fail before RPC.
2. Make RPC question limits agree with the action: existing imported banks may
   contain up to 60 questions, ordinary banks up to 30. Determine imported
   status from stored authoritative provenance on updates. Do not grant the
   larger limit from client-controlled metadata. Preserve provenance and
   atomic replacement. Inspect the target migration ledger; never edit an
   applied migration. Add a forward migration if needed.
3. Correct prompt/explanation editing so furigana on/off reflects the same
   newly saved content. Hidden old plain/markup values must not override edits.
   Preserve original variants on no-change saves; do not normalize unrelated
   source data, invent readings, or change answer keys.
4. Make catalog completeness independent of Data API row order. A published
   group with positions 2,0,1 is complete. Duplicate, missing, unpublished or
   cross-set children must remain invalid. Keep catalog/detail counts aligned.

## Verification

Add targeted regression tests that exercise the actual server action and RPC
contract, not only the helper or a handcrafted alternate payload. Cover a
no-change imported save at NON_JLPT with 50/52 questions, edited prompt and
explanation with furigana on/off, unchanged source preservation, shuffled group
rows and group-only catalogs. Verify ordinary-bank limits and rejection of
client-supplied provenance escalation. Retain atomic rollback and role gates:
Sensei can author; anon, non-staff, Tantōsha and inactive staff cannot.

Use a local or explicitly isolated database fixture for destructive tests.
Do not mutate shared source/production data to prove saving works. If an
isolated SQL target is unavailable, complete code and local tests and report
that specific verification limit without reopening deferred operational work.

Run import --check, existing grouping/scoring checks, required Graphify update,
and bun run verify. Report the default bundler result honestly; if a justified
Webpack fallback is needed, record it separately. Test the editor and learner
flow in a browser at desktop and phone sizes when tooling is available.

## Scope and handoff

Preview deployment and export/restore rehearsal remain deferred by the owner;
they are not acceptance criteria for this bounded implementation goal. Do not
merge, deploy, promote, reconnect Vercel Git integration, export or restore a
shared database. Do not retry a denied deployment through another path.

Update release evidence with changed behavior, migration status, actual checks,
revision and limitations. Prepare focused commits without secrets or private QA
artifacts. Push or update the PR only when the active session authorizes that
action. Completion means these four code defects are fixed with regression
evidence; it does not mean production is updated or the beta is release-ready.
