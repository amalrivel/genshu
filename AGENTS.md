<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Project context: read only what the task needs

- [README](README.md): local setup, environment names, database commands and access/recovery limits.
- [PRD](docs/PRD.md): read before changing product behavior, roles, publication or practice policies; unresolved decisions are not requirements to implement silently.
- [Architecture](docs/ARCHITECTURE.md): read before changing routes, auth, persistence, imports or cross-module data flows; follow its source links for details.
- [Design](DESIGN.md): read for UI changes; reuse the existing shadcn Base UI components and semantic tokens.
- [Demo/testing](docs/demo-testing.md): read for seed behavior, demo accounts and browser scenarios. Historical evidence and its limits are summarized there; read it only for testing tasks.

## Development boundaries

- Keep route → component/hook → query/action boundaries; grading stays pure. Reuse feature modules rather than adding generic repositories or services.
- Server Actions must validate inputs and enforce their own role/ownership checks. Navigation visibility, `server-only` and TypeScript types do not establish authorization.
- Preserve attempt snapshots/history, publication checks, sanitization and failure recovery. Keep loading, empty, 404 and operational-error states distinct.
- Prisma 8 uses `src/prisma/contract.prisma` and emitted `contract.json`/`contract.d.ts`; read the version-matched Prisma 8 skill for data-layer changes. Do not edit generated artifacts manually or assume Prisma 7 APIs.
- Preserve existing uncommitted work. Schema/data mutations require the task to authorize them; review the target, backup and operations before applying. Never reset an existing database as routine setup or testing.
- Do not commit environment secrets or use demo accounts/data as production provisioning. First-admin bootstrap and operator recovery remain missing.
- Keep documentation claims separate: implemented in source, tested with stated evidence, deferred, or unresolved. Update the relevant document when behavior changes; do not rewrite historical reports as current results.

## Commands

Run from the repository root with Bun. Package scripts are authoritative.

| Purpose                                         | Command                                                         |
| ----------------------------------------------- | --------------------------------------------------------------- |
| Development                                     | `bun run dev`                                                   |
| Automated tests                                 | `bun run test` (includes the required `react-server` condition) |
| Type check without writing incremental state    | `bunx tsc --noEmit --incremental false`                         |
| Lint                                            | `bun run lint`                                                  |
| Production build                                | `bun run build` (emits contract artifacts; does not migrate)    |
| Whitespace check                                | `git diff --check`                                              |
| Emit contract artifacts after contract changes  | `bun run db:generate`                                           |
| Inspect schema initialization / migration state | `bun run db:init:preview` / `bun run db:status`                 |

Database apply/seed commands are in README; do not run them merely to check docs.
Choose checks for the change and report what actually ran. Helper/render tests do
not establish browser, database concurrency or production readiness. Documentation
edits need link/content/diff checks; code-only graph update rules above still apply.
