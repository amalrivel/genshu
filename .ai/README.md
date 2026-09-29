# Genshu development workflow

Read [project decisions](PROJECT.md) and the source relevant to the task.
[Root README](../README.md) owns setup; [AGENTS.md](../AGENTS.md) owns agent entry instructions.
Keep stable decisions in PROJECT.md and dated verification evidence in task/PR reports.

## Owner annotations
- `QUESTION:`: explain the code and its rationale; distinguish evidence from inferred intent.
- `REVIEW:`: evaluate the concern, alternatives, and trade-offs before proposing changes.
- `TODO:`: requested behavior to implement when included in the active task.
Search annotations in source comments, including multiline comments. A review request does not authorize implementing every TODO.
Keep unresolved notes. Remove a note only when answered/accepted or implemented and verified; preserve useful rationale as a normal comment.
Inside JSX, use `{/* ... */}` for comments.

## Current review queue
Based on owner annotations at commit `3144f2f` (2026-09-29). These are pending, not completed fixes.

| Priority | Source | Finding / next action |
| --- | --- | --- |
| 1 | `src/components/practice-player.tsx` | A TODO is plain JSX text and can appear in the UI. Convert it to a JSX comment when implementing this task. |
| 1 | `src/proxy.ts`; attendance/cohorts/exams/users pages | Prototype redirects apply only in production. Owner expects direct local URLs hidden too. Preserve code; cover parent and detail routes, including assignments for consistency. |
| 2 | `src/components/practice-player.tsx` | Enforce forward-only answering and confirmed-answer locking; check keyboard handlers as well as buttons. Replace breadcrumbs with catalog-back navigation and improve Maru/Batsu controls. Preserve group scoring. |
| 3 | `src/app/staff/page.tsx` | Review the complete find/create/edit/publish workflow, then propose a focused UX change using existing components. |
| 4 | `src/app/layout.tsx`; `src/components/legacy-data-provider.tsx`; `src/lib/data-context.tsx` | Explain prototype naming and provider scope. Consider route-group layouts to isolate prototype state. Importing a module does not execute every function, but the mounted provider initializes multiple domains and synchronizes their storage. |
| 4 | `src/app/assignments/page.tsx` | Keep transient form/filter state near its UI. Share domain validation and business rules where needed; moving hooks to an API or backend does not make them reusable mobile state. `.ai/` is documentation/tooling, not runtime backend code. |
| 4 | `src/app/layout.tsx` | The native `a href="#main-content"` is an in-page accessibility skip link; it does not require Next.js Link. |

Review/answer architectural questions before treating suggestions as approved changes.
After the owner-feedback fixes, verify the affected release workflows on the intended deployment.
Native mobile work is not part of this queue.

## Work and verification
1. Identify the requested outcome and relevant annotations; preserve unrelated work.
2. Inspect source and applicable framework guidance. Resolve conflicting requirements explicitly.
3. Implement only the authorized scope, then review the diff.
4. For implementation, run `bun run verify` plus focused behavior/permission checks. Test affected UI on phone and desktop.
5. For documentation-only work, check links, commands, consistency, and `git diff --check`; no app build is needed.
6. Report changes, checks actually run, source revision, environment, and remaining gaps.

The full verifier writes Graphify output. If Turbopack worker-port restrictions block the build, report that and use `bun run verify --webpack`.
For read-only review, use non-mutating checks. Keep code, migrations, datasets, and scripts unchanged unless implementation is authorized.
Do not infer deployment readiness from dev rendering, HTTP 200, or a passing build.
Use only task-relevant skills; do not add policies or agent orchestration without a recurring need.
