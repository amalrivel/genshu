# Next worker goal: verify the corrected authoring and learner flows locally

## Starting evidence

Implementation commit `329c278` and evidence commit `52402ad` are local.
The reviewer reran the five actual-server-action regression tests and grouping/
scoring checks successfully. See `release-readiness.md` for earlier build and
local PostgreSQL evidence. Migration 013 is not applied to shared Supabase.
The current staged `.agents/rules/antigravity-rtk-rules.md` is unrelated to this
verification goal; preserve it and exclude it from any task commit.

## Goal

Verify the corrected editor and learner flows through a real browser, using
local or explicitly isolated test data for saves. Resolve any reproducible
failure within this scope and report precise evidence. No later LMS features.

Read AGENTS.md, .ai/PROJECT.md, .ai/README.md and release-readiness.md. Inspect
current worktree and installed browser tools. Use applicable browser skills and
existing tooling; absence of playwright-cli alone does not establish that all
browser automation is unavailable. Read Next.js guides before code changes.

## Required scenarios

- Sensei opens and saves a NON_JLPT imported bank containing 50/52 questions.
  A no-change save preserves source prompt/plain and explanation/markup variants.
- Edit a prompt and explanation, save, reload and view the learner flow with
  furigana on and off. Both modes must reflect the new content. Do not invent
  readings or alter unrelated source content and answer keys.
- A shared image/context appears once with three illustration children; answers
  remain independent. Verify navigation, answer editing, review and two-point
  all-correct scoring; one incorrect or unanswered child earns no group points.
- Check standard questions and a group-only catalog. Existing regression tests
  must retain shuffled-row, invalid-group and ordinary-bank-limit coverage.
- Exercise desktop and phone-size layouts, keyboard interaction and reload.
  Check browser console and failed requests. Use isolated QA roles for denied
  authoring paths where available; do not create or modify real users for tests.

## Environment and limits

Use a local or explicitly isolated backend for writes and migration 013.
Never save fixture edits into the shared source/production database. If only
shared Supabase is configured, public browser checks can proceed read-only;
report isolated authoring verification as incomplete with the exact missing
resource. Do not reset, seed or migrate shared Supabase under this goal.

Preview deployment and export/restore rehearsal remain deferred by the owner.
Do not merge, push, deploy, promote, reconnect Git integration or restore shared
infrastructure. Do not bypass an automatic approval rejection with another path.

## Evidence and handoff

Record tested revision, environment, viewport, scenarios, actual results and
limitations in release-readiness.md. Keep credentials, sessions and private
browser artifacts out of Git. Fixes require targeted regressions, Graphify
update and bun run verify; document a Webpack fallback separately. For
verification/documentation only, check links and git diff --check instead of
rerunning the full verifier.

Completion requires browser evidence for the scenarios actually available and
an honest list of unverified scenarios. An unavailable isolated backend is a
verification limitation, not proof that authoring works. Do not claim deployment
or production readiness. Prepare a handoff for owner review before any separate
push/merge/release authorization.
