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

## Reviewer follow-up — 2026-09-27 UTC+09

Current HEAD is `52402ad9439b25c4d35c00134257664c82c54f98`, following local
implementation commit `329c278`. Focused diff inspection confirms the four
previous findings have corresponding corrections. The reviewer reran
`bun test db/scripts/practice-actions.test.js`: five tests passed with 28
assertions; `bun src/lib/practice-units.check.ts` also passed. No browser or
live SQL checks were rerun, and remote PR state was not refreshed in this
follow-up. Local commits alone do not prove PR availability.

Unlike the earlier untracked state, `.agents/rules/antigravity-rtk-rules.md`
is now staged; it was preserved and was not included in these documentation
changes. The Graphify query modifies its tracked query stamp. No core code,
migration, dataset or script was edited by the reviewer. The next worker goal
now targets local browser verification; Preview and recovery stay deferred.

## Local browser follow-up — 2026-09-27 UTC+09

Browser verification used Playwright CLI 0.1.19 against the local Genshu app at
`http://localhost:3000`, with checkout HEAD
`52402ad9439b25c4d35c00134257664c82c54f98`. The Next.js dev server was already
running for this workspace; I used it without stopping or restarting it. The
app's configured Supabase URL is the shared project `invekuqrmwvrfxkcqfcp`.
Browser navigation and practice answers are client-side session state; no
authoring action, database write, or migration was issued. Browser console
errors, page errors, and failed requests were all empty. The local Next dev log
had no matching error, exception, unhandled, or failed lines for this run.

| Browser scenario | Result |
| --- | --- |
| Book 3 catalog and student practice | The anonymous catalog listed 13 published sets and included Book 3. Book 3 rendered 46 practice units containing 50 published questions, matching the local import dataset's 50 published questions out of 52 records. The two unpublished records were not included in the student session. |
| Shared illustration content | Groups `gentsuki-book-3-group-47` and `gentsuki-book-3-group-48` each rendered three child sections and one loaded shared image. For group 48, the context matched the source text exactly once with furigana off; all three child prompts matched their source plain text. `駐車車両の先の状況` was absent before answering. |
| Independent answers, editing, and navigation | Confirming a child left the other two selections empty. Editing the first child from correct to incorrect and back updated only that child. Returning from group 48 to group 47 retained all three answers and their explanations. |
| Furigana, keyboard, reload, and layout | Furigana on/off changed ruby rendering; reloading returned the local session to question 1. Keyboard `1`/`2` and Enter selected, confirmed, and advanced a standard question. No horizontal overflow at 1365×900 or 390×844. |
| Scoring and review | All standard questions and group 47 were answered correctly; one child in group 48 was answered incorrectly. The review displayed 49/50 correct and 46/48 points, confirming the group with one wrong child received zero points. Full review showed 50 child explanations and two shared group images; incorrect-only review retained the incorrect child's group image and explanation. Group child explanations matched the source dataset. |
| Anonymous access | Direct navigation to `/staff/practice/gentsuki-book-3` redirected to `/login`; no editor fields were visible. This verifies the anonymous route gate, not staff login or the other staff-role permissions. |

The browser run did **not** test saving an imported set. There is no local
Supabase CLI/stack, Docker/Podman runtime, or isolated Supabase branch available;
the local `.env` points only to the shared project, and the connected Supabase
inventory lists only that project. I did not log in to Sensei, save 50/52
questions, or apply migration 013. The prior action test and isolated local
PostgreSQL migration/RLS harness remain supporting evidence, but they are not a
browser save against a local Supabase Data API/Auth backend. The imported-bank
browser save, saved-text reload, Sensei login, and browser permission paths for
non-staff/Tantōsha/inactive staff therefore remain unverified until an isolated
runtime backend and QA accounts are available. The current Supabase branch
inventory contains only the default `main` branch on the shared project.

Supporting checks rerun during this follow-up: `bun test db/scripts/practice-actions.test.js`
passed 5 tests/28 assertions;
`bun src/lib/practice-units.check.ts` passed; importer `--check` passed for 12
sets, 614 records, 602 published questions, 12 drafts, 84 assets, and 21 known
warnings; and `bun db/scripts/check-data-api-migration.js` passed on its
temporary local PostgreSQL cluster, including five-role RLS and RPC rollback.
These checks cover helper/action and SQL behavior, not a browser save through a
local Supabase Data API/Auth runtime. The full verifier was not rerun because
this follow-up made no application-code changes; documentation checks are
`git diff --check` and local-link validation.

No imported bank in the available dataset is group-only: illustration banks
also contain standalone questions. Group-only catalog counts are covered by
the existing focused regression test, but there was no browser-visible
group-only fixture to exercise. Preview verification and recovery rehearsal
remain deferred by the owner, not passed. No push, merge, deployment, or shared
database mutation occurred during this follow-up.

## Core-use follow-up — 2026-09-27 UTC+09

Scope was narrowed by the owner to current learner and Sensei core use. I
inspected the published-material list/reader, practice catalog/player and
review, Sensei material/practice editors and actions, login, `requireStaff` /
`requireSensei`, cookie-backed Supabase server client, and existing
`save_practice_set` contract. The learner paths read only published rows;
staff pages and every staff mutation retain server-side role checks. No
Tantōsha permissions or shared database state were changed.

One authoring blocker was corrected: illustration children could not be
removed from a practice set because the editor hid child deletion for groups
and offered no whole-group action. The editor now removes all three children
as one operation. On save it submits only the retained group IDs; the server
reloads their context/image/source metadata for the set and sends those rows
through the existing atomic `save_practice_set` group replacement. A submitted
group ID not present on that set is rejected. This retains the existing
three-child/publish-together validation. No migration or database operation
was made.

| Check | Result |
| --- | --- |
| `bun run typecheck` | Passed. |
| `bun run lint` | Passed. |
| `bun test db/scripts/practice-actions.test.js` | Passed: 6 tests, including whole-group deletion, retained server-authoritative metadata, forged group-ID rejection, and existing Sensei/size/source handling. |
| `bun run verify` | Started but made no progress during Turbopack build; manually interrupted. Not counted as a pass or build failure. |
| `bun run verify --webpack` | Passed all six repository stages, including production build. Graphify reported the code graph current. |
| Local browser inventory | `playwright-cli list` returned “no browsers.” Per the revised scope, I did not set up a local Supabase QA stack or browser authoring environment. |

The earlier Book 3 browser evidence above covers student practice, answer
state, scoring, review, furigana, keyboard and desktop/phone layout. This
follow-up did not re-run browser checks. Material reading was reviewed in its
source route and renderer but was not browser exercised in this run. Sensei
login, material save/publish, practice save/publish/group deletion, and
Tantōsha permission paths remain unverified through an authenticated runtime.
Local Supabase QA and browser authoring verification are **deferred**, not
passed. Preview and restore rehearsal remain **deferred by the owner**, not
passed. This follow-up changed local application code, messages, one focused
test, Graphify output, and this evidence note; it made no shared database
change and no push, merge, deployment, or commit. Existing owner edits and
staged files in the worktree were preserved.
