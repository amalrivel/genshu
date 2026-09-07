# Graph Report - genshu  (2026-09-07)

## Corpus Check
- Corpus is ~9,296 words - fits in a single context window. You may not need a graph.

## Summary
- 190 nodes · 188 edges · 19 communities (13 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: session semantic extraction usage unavailable; reported zeros are placeholders, not measured usage. No external LLM API was called.

## Community Hubs (Navigation)
- API Setup and Dependencies
- Web Build and Dependencies
- Workspace Scripts and Tooling
- Prisma Contract Types
- Web TypeScript Configuration
- React Router Documentation
- API TypeScript Configuration
- Web Development Dependencies
- API Development Dependencies
- Prisma and Workspace Setup
- Web Runtime Dependencies
- Application Root and Errors
- Home and Welcome Pages
- API Runtime Dependencies
- Graphify Project Guidance
- Dark Theme Branding
- Light Theme Branding

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 15 edges
2. `compilerOptions` - 12 edges
3. `React Router Framework Mode` - 8 edges
4. `React Router` - 6 edges
5. `scripts` - 5 edges
6. `React Router application template` - 5 edges
7. `scripts` - 4 edges
8. `packageManager` - 4 edges
9. `React Router Data Mode` - 4 edges
10. `Unstable React Server Components` - 4 edges

## Surprising Connections (you probably didn't know these)
- `pnpm catalogs and overrides` --conceptually_related_to--> `pnpm apps workspace`  [INFERRED]
  apps/api/prisma-next.md → pnpm-workspace.yaml
- `Generated contract JSON and TypeScript declarations` --semantically_similar_to--> `Route modules and generated types`  [INFERRED] [semantically similar]
  apps/api/prisma-next.md → apps/web/.agents/skills/react-router/references/framework-mode.md
- `Server-only data access` --semantically_similar_to--> `Client/server module boundaries`  [INFERRED] [semantically similar]
  apps/web/.agents/skills/react-router/references/framework-mode.md → apps/web/.agents/skills/react-router/references/rsc.md
- `React Router` --references--> `React Router Declarative Mode`  [EXTRACTED]
  apps/web/.agents/skills/react-router/SKILL.md → apps/web/.agents/skills/react-router/references/declarative-mode.md
- `React Router Framework Mode` --references--> `Route loaders and actions`  [EXTRACTED]
  apps/web/.agents/skills/react-router/references/framework-mode.md → apps/web/.agents/skills/react-router/references/data-mode.md

## Import Cycles
- None detected.

## Communities (19 total, 4 thin omitted)

### Community 0 - "API Setup and Dependencies"
Cohesion: 0.08
Nodes (23): author, description, @types/node, typescript, keywords, license, main, name (+15 more)

### Community 1 - "Web Build and Dependencies"
Cohesion: 0.09
Nodes (21): @types/node, typescript, name, private, scripts, build, dev, start (+13 more)

### Community 2 - "Workspace Scripts and Tooling"
Cohesion: 0.10
Nodes (20): author, description, devDependencies, concurrently, devEngines, packageManager, keywords, license (+12 more)

### Community 3 - "Prisma Contract Types"
Cohesion: 0.11
Nodes (17): AggregateTypes, CodecTypes, Contract, ContractBase, DefaultLiteralValue, ExecutionHash, FieldInputTypes, FieldOutputTypes (+9 more)

### Community 4 - "Web TypeScript Configuration"
Cohesion: 0.12
Nodes (16): compilerOptions, esModuleInterop, jsx, lib, module, moduleResolution, noEmit, paths (+8 more)

### Community 5 - "React Router Documentation"
Cohesion: 0.20
Nodes (15): React Router Data Mode, Forms and fetchers, Route loaders and actions, React Router Declarative Mode, URL values and navigation, React Router Framework Mode, SSR, SPA, and pre-rendering, Server-only data access (+7 more)

### Community 6 - "API TypeScript Configuration"
Cohesion: 0.15
Nodes (12): compilerOptions, erasableSyntaxOnly, module, moduleResolution, noEmit, resolveJsonModule, rewriteRelativeImportExtensions, skipLibCheck (+4 more)

### Community 7 - "Web Development Dependencies"
Cohesion: 0.22
Nodes (9): devDependencies, @react-router/dev, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom, typescript (+1 more)

### Community 8 - "API Development Dependencies"
Cohesion: 0.29
Nodes (7): devDependencies, prisma, @prisma/cli-engine, @types/cors, @types/express, @types/node, typescript

### Community 9 - "Prisma and Workspace Setup"
Cohesion: 0.29
Nodes (7): Prisma data contract, Generated contract JSON and TypeScript declarations, pnpm catalogs and overrides, PostgreSQL 15 or newer, Prisma Next, Route modules and generated types, pnpm apps workspace

### Community 10 - "Web Runtime Dependencies"
Cohesion: 0.29
Nodes (7): dependencies, isbot, react, react-dom, react-router, @react-router/node, @react-router/serve

### Community 13 - "API Runtime Dependencies"
Cohesion: 0.40
Nodes (5): dependencies, cors, dotenv, express, @prisma/orm-postgres

### Community 14 - "Graphify Project Guidance"
Cohesion: 0.67
Nodes (3): Graphify knowledge graph, AST-only graph update, Scoped graph queries

## Knowledge Gaps
- **129 isolated node(s):** `name`, `version`, `description`, `main`, `start` (+124 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 142 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Web Development Dependencies` to `Web Build and Dependencies`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Web Runtime Dependencies` to `Web Build and Dependencies`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `API Development Dependencies` to `API Setup and Dependencies`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _129 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Setup and Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Web Build and Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `Workspace Scripts and Tooling` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
## Graph Health
- 17 extracted relationships have dangling endpoints and were excluded from the built graph. Graph coverage is incomplete.
