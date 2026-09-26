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
| Local implementation and Data API | Verified at local HEAD `dc1e6b2f7e4cc8e5f7c835c95d3f4f327bb4633c`; the 2026-09-26 checks above remain the latest implementation evidence. Worktree contains only the pre-existing untracked `.agents/rules/` directory. |
| GitHub availability | GitHub read-only branch/commit/PR checks and remote ref lookup show `codex/gentsuki-bank-import-20260926` still at `317a63f1d60aa5cade2635c4bcbf3f2ccc49d702`; local branch is six commits ahead. The six local commits are `24670b1`, `3f4f017`, `a264264`, `7e9e3b9`, `02e57a2`, and `dc1e6b2`. No PR was found for that head, and GitHub returned 422 when asked for local commit `dc1e6b2f7e4cc8e5f7c835c95d3f4f327bb4633c`. The remote tip `317a63f1d60aa5cade2635c4bcbf3f2ccc49d702` was fetched read-only from GitHub. A terminal `git ls-remote` retry on 2026-09-27 could not resolve `github.com`; no remote state was inferred from that failed retry. No push was performed. |
| Vercel preview | **Deferred by owner; not completed.** Read-only deployment inventory contains the prior READY branch deployment `dpl_89t64zrZLKkFgTGKaPwGgqaKmKXK` (`https://genshu-2l1eqdpp1-amalrivels-projects.vercel.app`) at old commit `317a63f`; it does not contain the correction. No newer deployment was listed. The deployment detail reports `target: null` and the correction-free branch commit; it does not expose an explicit environment label. Its existing success check is for that old commit only. Browser/runtime checks were not run against it. The earlier automatic approval rejection was not bypassed; no deployment path was retried. |
| Recovery rehearsal | **Deferred by owner; not completed.** Current Supabase source is `invekuqrmwvrfxkcqfcp` in `ap-southeast-1`. The project is `ACTIVE_HEALTHY`. Read-only branch inventory shows only default `main`, `project_ref` and `parent_project_ref` both equal to the source project, and `with_data: false`; there is no isolated target. The available Supabase tools do not provide a database export/dump operation. `supabase`, Docker, and `POSTGRES_URL` are unavailable locally. No export or restore was attempted. |

Operational status is separate: local implementation/Data API is verified;
the owner deferred Preview verification and the isolated recovery rehearsal to
a later operational phase. Do not interpret the old deployment's READY state
as verification of this work. Local correction commits are not in the observed
GitHub branch, and there is no evidence that they are present in production;
production readiness is not claimed.

## Evidence updates

Record commands, date, source commit plus worktree state, environment/project,
covered behavior, results, and limitations. For deployment checks, include the
deployment ID/URL and served source commit. Mark an acceptance criterion
resolved only when the evidence covers it. Keep credentials, sessions, and
private QA artifacts out of this document.
