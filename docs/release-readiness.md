# Release review and remaining work

## Evidence snapshot — 2026-09-26 JST

Implementation began from HEAD `317a63f1d60aa5cade2635c4bcbf3f2ccc49d702`.
The work is recorded in commits `24670b1` (import/data/schema), `3f4f017`
(player/editor), `a264264` (project/release documentation), and `7e9e3b9`
(Graphify output). Source behavior was checked at pinned repository commit
`f085af618ff11e594868eeed653a945d6daaa682`.

| Check | Result | Scope |
| --- | --- | --- |
| Legacy source renderer and scorer | Inspected at pinned commit | `quiz-loader.ts`, `quiz-card.tsx`, and `use-quiz.ts`; focus points are not read, the shared stem/image are shown on each flattened child card, and complete groups earn 2 points only if all 3 children are correct |
| Import `--check` | Passed | 12 sets, 614 questions, 602 published, 12 drafts, 84 assets; validates group image Git blob hashes |
| Connected import `--dry-run` | Passed, read-only | 0 insert, 0 update, 12 skip, 0 errors; reports 14 source groups, 42 children, and 15 focus-point labels omitted from corrected import |
| Supabase group integrity query | Passed | 14 groups, 42 children, zero incomplete groups; no missing group images, leaked draft children, or legacy child contexts |
| Data API source-to-live group comparison | Passed | Publishable client under RLS matched all 14 group rows and 42 child rows across shared context/image, order, Japanese prompt/ruby, answer, explanation, publication, IDs, and provenance; zero mismatches |
| Local Data API migration/RLS harness | Passed | Five roles, group visibility, prohibited writes, incomplete/publication/cross-set rejection, Sensei save/repair, rollback |
| Live Data API role/RPC checks | Passed | Anon, non-staff, active Sensei, active Tantōsha, inactive staff; group publish/repair guards; QA rows cleaned and follow-up count was zero |
| Browser samples for illustration banks | Passed | Book 1–3 and Genchare 1–4 each rendered 3 children with 1 shared image and no focus-points label |
| Book 3 interactive player/review | Passed | Independent answers, answer edit, back-navigation state, source scoring, per-child explanations, keyboard, furigana toggle; 390px and 1365px viewports had no horizontal overflow |
| `bun run typecheck`, `bun run lint`, score self-check | Passed | Current local worktree |
| `bun run verify --webpack` | Passed | Full verifier, locale validation, Graphify update, and Next production build |
| `bun run verify` | Interrupted | Reached Turbopack production build but made no further progress; it was stopped after waiting. The explicit `--webpack` full verifier passed |
| `bun run db:verify`, `bun run db:verify-permissions` | Blocked | `POSTGRES_URL` is not configured; live Data API and migration harness were run instead |
| Import `--verify-live` | Blocked | Local Sensei credentials were rejected by Supabase Auth; group role/RPC checks ran independently |
| Vercel | Read-only status checked | Preview `dpl_89t64zrZLKkFgTGKaPwGgqaKmKXK` is READY at commit `317a63f`; production `dpl_7Vraq7P3RP8gxZifswCkvubJoyNF` is READY at `4216e530406f50a2df3bae5694de3f0d5c77c8a1` |
| Preview for this worktree | Not created | Automatic approval review rejected the deploy tool call because it had no explicit preview-only target and could publish to a shared or production destination. No deployment was made. |
| Isolated export/restore rehearsal | Not run | No separate Supabase target/local stack is available (`supabase`, Docker, and `POSTGRES_URL` are absent); branch listing shows only the default branch on the current project, so production must not be used |

The source JSON contains `focus_points_plain` and `focus_points_ruby`; Git
blame traces these fields to the source repository's original import commit
`deda0be0`, not to the Genshu converter. The legacy renderer does not read
either field. The previous converter appended 15 focus-point items to contexts
in six Book groups; the corrected converter maps only the source stem to the
shared context. The old player flattened each group into child cards and
repeated the shared stem/image per card, while Genshu now renders the shared
content once beside all three ordered children. Explanations remain
child-specific and appear after answering. Group membership, source IDs, order,
answer keys, explanations, ruby, and image references are preserved.

## Outstanding acceptance criteria

- **Deferred by owner:** deploy and test a non-production preview using an
  action that explicitly enforces preview-only scope. Do not retry through a
  different path to evade the approval review.
- **Deferred by owner:** complete the isolated backup/restore rehearsal
  described in `recovery.md` when a separate Supabase target or local Supabase
  stack is available.
- Configure `POSTGRES_URL` and valid active Sensei importer credentials if the
  standalone SQL verifier and importer `--verify-live` command are required in
  addition to the successful direct source-to-live Data API/RLS checks.

Do not open later LMS features or redesign unrelated UI while these release
criteria remain open.

## Historical incident context

Earlier worker documentation reports recovery of the 2026-09-26 18:05 JST
`/materials` HTTP 500, with exception "Your project's URL and Key are required"
and digest `2431554270`. Recovery deployment
`dpl_7Vraq7P3RP8gxZifswCkvubJoyNF` was built from `4216e53` after fixing
Production Supabase variable configuration. It is READY at that commit, but
historical checks do not assert current beta readiness.

## Operational status — 2026-09-27 JST

| Gate | Evidence and status |
| --- | --- |
| Local implementation and Data API | The 2026-09-26 reported checks remain historical evidence. Reviewer checks on 2026-09-27 at HEAD `8449056c9218764f9609d533f56ae0e48e89d92d` reproduce authoring defects below. |
| GitHub availability | GitHub MCP confirms [draft PR #1](https://github.com/amalrivel/genshu/pull/1), open and unmerged, branch `codex/gentsuki-bank-import-20260926`, head `8449056c9218764f9609d533f56ae0e48e89d92d`, base `main` at `39a83c6183712918247fe82ad0688432537c3854`. PR scope is 11 commits and 142 files. Local tracking ref matches HEAD. The earlier six-ahead/no-PR observation is superseded. |
| Vercel preview | **Deferred by owner; not completed.** Read-only deployment inventory contains the prior READY branch deployment `dpl_89t64zrZLKkFgTGKaPwGgqaKmKXK` (`https://genshu-2l1eqdpp1-amalrivels-projects.vercel.app`) at old commit `317a63f`; it does not contain the correction. No newer deployment was listed. The deployment detail reports `target: null` and the correction-free branch commit; it does not expose an explicit environment label. Its existing success check is for that old commit only. Browser/runtime checks were not run against it. The earlier automatic approval rejection was not bypassed; no deployment path was retried. |
| Recovery rehearsal | **Deferred by owner; not completed.** Current Supabase source is `invekuqrmwvrfxkcqfcp` in `ap-southeast-1`. The project is `ACTIVE_HEALTHY`. Read-only branch inventory shows only default `main`, `project_ref` and `parent_project_ref` both equal to the source project, and `with_data: false`; there is no isolated target. The available Supabase tools do not provide a database export/dump operation. `supabase`, Docker, and `POSTGRES_URL` are unavailable locally. No export or restore was attempted. |

The draft PR head recorded above predates worker commit `329c278`; that commit
has not been pushed and is not part of the observed PR head. No evidence here
establishes that production serves these changes. Preview verification and
isolated recovery rehearsal remain deferred by the owner, not completed.
Deployment inventory above is the previous observation and was not refreshed
during this code review.

## Reviewer findings — 2026-09-27 UTC+09

Core code, migrations, data and scripts remained read-only. Review covered the
practice editor, server action, repository, player, grouping/scoring helpers and
migration 012. This is a focused correctness review, not an exhaustive audit.

| Priority | Finding | Required correction |
| --- | --- | --- |
| P1 | `src/app/staff/practice/actions.ts:40` reads level with a two-character limit; `NON_JLPT` is eight characters and is offered/defaulted by the imported-bank editor. A valid imported form returns `saveError` before any RPC call. | Accept the supported enum and verify no-change imported-bank saves through the real form/action. |
| P1 | The action permits 60 imported questions using stored provenance, but its `p_set` payload omits `source_repository`. Migration 012 computes the limit from that payload, defaults to 30, and rejects 50/52-question banks. | Derive update limits from stored authoritative provenance in the RPC, preserve provenance, and use a forward migration if necessary. Do not trust browser-supplied provenance to raise limits. |
| P2 | Hidden `promptPlain` and `explanationMarkup` retain old values when visible prompt/explanation fields change. The action prefers those hidden values, so furigana on/off can show different content after saving. | Preserve unchanged source variants; regenerate coherent plain/markup representations when the corresponding content is edited. |
| P2 | Catalog question rows have no explicit ordering, while `hasCompletePublishedGroup` requires array order 0,1,2. Complete published rows in order 2,0,1 are rejected; counts can omit groups or hide a group-only bank. | Validate completeness independently of incoming row order, including duplicate/missing/unpublished cases. |

Actual reviewer checks: `bun run typecheck`, `bun run lint`,
`bun src/lib/practice-units.check.ts`, and import `--check` passed (12 sets,
614 questions, 602 published, 12 drafts, 84 assets, 21 warnings).
A temporary Bun reproduction imported the real server action with mocked staff,
Supabase and framework boundaries: it confirmed NON_JLPT rejection before RPC,
missing provenance in the 52-question RPC payload, and stale hidden text values.
The pure grouping helper rejected complete shuffled children. These are local
reproductions, not live database writes or browser verification. The RPC cap is
also evidenced by static inspection of migration 012.

No full verifier/build or live mutations were run in this review. The tracked
Graphify query stamp was already dirty at entry; `.agents/rules/` remains
untracked. Documentation changes are uncommitted. Resolve these four defects
with targeted regression evidence before proposing merge. See
[`worker-next-goal.md`](worker-next-goal.md) for the bounded implementation goal.

## Worker implementation update — 2026-09-27 UTC+09

The four reproduced defects are corrected in the current local worktree:

- The Sensei action accepts `NON_JLPT`, loads persisted prompt variants, and
  derives plain prompt text and explanation markup from edited visible text.
  Unchanged imported prompt/plain and explanation/markup variants are retained.
- Migration `013_practice_save_limits.sql` derives update limits from the
  stored repository provenance, no longer updates provenance from replacement
  payloads, and permits the 60-question insert only for the pinned Gentsuki
  commit, one of its 12 source refs, and the corresponding reserved bank ID.
  Ordinary sets remain limited to 30 questions. This is a forward migration;
  migration 012 was not edited.
- Group completeness is checked by positions rather than Data API row order.
  Catalog counts also require three published children from the group’s own
  set, so group-only sets remain listed and incomplete/cross-set groups do not
  inflate counts.

The current Supabase migration ledger was inspected read-only. It records
`practice_group_integrity` (migration 012) as applied; migration 013 has not
been applied. No shared database was changed.

Checks on the local worktree:

| Check | Result and coverage |
| --- | --- |
| `bun test db/scripts/practice-actions.test.js` | Passed, 5 tests. Calls the actual `savePracticeSet` action with mocked auth/Data API boundaries; covers no-change NON_JLPT imports at 50/52 questions, source variant preservation, edited text/plain/markup consistency, ordinary 30-question limit and Sensei action gate. |
| `bun db/scripts/check-data-api-migration.js` | Passed against its temporary local PostgreSQL cluster. Applies all local migrations including 013; covers a 52-question pinned import/update, rejected client-provenance escalation with atomic preservation, group constraints, save/repair, rollback, grants and RLS for anon, non-staff, Sensei, Tantōsha and inactive staff. It is not a live Data API or target migration test. |
| `bun src/lib/practice-units.check.ts` | Passed grouping/order/scoring checks and shuffled, incomplete, unpublished, cross-set, standard and group-only catalog-count cases. |
| `bun db/scripts/import-gentsuki-ready-web.ts --check` | Passed: 12 sets, 614 questions, 602 published, 12 drafts, 84 assets, 21 known warnings. |
| `bun run verify` | Reached Turbopack production build but produced no progress; manually interrupted. This was not recorded as a build failure. |
| `bun run verify --webpack` | Passed all six verifier stages: typecheck, ESLint, locale validation, Graphify update, diff check and production build. |
| Browser checks | Not run. `playwright-cli` is not installed; `npx --no-install playwright --version` returned no output and was stopped. No browser editor/learner or responsive-flow claim is made. |

The implementation, regression tests, migration, Graphify output, and related
project/import documentation are committed locally as
`329c278` (`fix: preserve imported practice authoring invariants`) on
`codex/gentsuki-bank-import-20260926`. This commit is local only; it has not
been pushed, merged, or deployed. No shared Supabase data was changed, and
migration 013 remains unapplied. Preview verification and restore rehearsal
remain deferred by the owner; neither is marked passed. `.agents/rules/` remains
untracked and was not staged. This release-readiness evidence update is being
committed separately after the implementation commit.

## Evidence updates

Record commands, date, source commit plus worktree state, environment/project,
covered behavior, results, and limitations. For deployment checks, include the
deployment ID/URL and served source commit. Mark an acceptance criterion
resolved only when the evidence covers it. Keep credentials, sessions, and
private QA artifacts out of this document.
