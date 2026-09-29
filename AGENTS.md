<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Genshu agent entry point

Read [.ai/PROJECT.md](.ai/PROJECT.md) for scope/architecture and [.ai/README.md](.ai/README.md) for annotation handling, priorities, and verification.
Inspect only task-relevant source and skills. Preserve unrelated changes.

For codebase questions, use `graphify query "<question>"` when the graph and CLI are available, then verify findings in source. If unavailable, use targeted source search and report the limitation. Do not read the full graph report for routine questions.
After code changes, run `graphify update .`; the implementation verifier also updates it.

Explain trade-offs before major architecture/dependency changes. Enforce permissions server-side.
For review/support tasks, keep application code, migrations, data, and scripts read-only unless the user also authorizes implementation.
Run `bun run verify` for meaningful implementation. For documentation-only edits, check links, consistency, and `git diff --check`.
Report actual evidence and unresolved blockers; distinguish local checks from deployed checks.
