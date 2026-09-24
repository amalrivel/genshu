<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Genshu agent entry point

Read [`.ai/PROJECT.md`](.ai/PROJECT.md) for product scope and current release
decisions. Read [`.ai/README.md`](.ai/README.md) for the development workflow.
Inspect only the source, tests, and skills relevant to the current task. The
current live-release target is published materials and anonymous practice for
students, with Sensei login for content authoring and Tantōsha login for
permitted coordination. Attendance, assignments,
and exams are later releases.

For codebase questions, first use `graphify query "<question>"` when
`graphify-out/graph.json` exists. Use `graphify path` or `graphify explain`
for focused relationships; inspect source after narrowing the scope. Do not
read the full graph report for routine questions. After code changes, run
`graphify update .`.

Before writing Next.js code, read the relevant guide in
`node_modules/next/dist/docs/` as required by the generated block above.

Use existing architecture and dependencies where they solve the task. Treat
database access, authentication, role permissions, and infrastructure changes
as explicit decisions; explain their tradeoffs and update project truth when
a decision changes. Never infer authorization from hidden UI controls.

For meaningful implementation work, run `bun run verify` before claiming
completion. Report changed files, behavior, checks actually run, and remaining
limitations. Do not claim a prototype flow is ready for official use based
on rendering or a passing build alone.
