# Graph Report - genshu  (2026-10-06)

## Corpus Check
- Corpus is ~9,473 words - fits in a single context window. You may not need a graph.

## Summary
- 361 nodes · 560 edges · 31 communities (17 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Activity Experience
- Learning Routes
- Shared Layout
- Data and Authentication
- Project Configuration
- Component Structure
- Fonts and Utilities
- TypeScript Settings
- Runtime Dependencies
- Alert Dialog
- Route Type Definitions
- Development Tooling
- Database Scripts
- Prisma Documentation
- Generated Route Checks
- Home and Alert UI
- Next.js Starter Guide
- PostCSS Configuration
- File Icon
- Globe Icon
- Next.js Logo
- Vercel Logo
- Window Icon
- Cache Lifetime Type
- Cache Tag Type

## God Nodes (most connected - your core abstractions)
1. `Button()` - 17 edges
2. `compilerOptions` - 17 edges
3. `next` - 15 edges
4. `Card()` - 15 edges
5. `HomeHeader()` - 14 edges
6. `scripts` - 11 edges
7. `CardTitle()` - 11 edges
8. `cn` - 10 edges
9. `ActivityRunner()` - 10 edges
10. `react` - 9 edges

## Surprising Connections (you probably didn't know these)
- `AlertDialogAction()` --calls--> `Button()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/components/ui/button.tsx
- `AlertDialogCancel()` --calls--> `Button()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/components/ui/button.tsx
- `MariaDB and Prisma 7` --semantically_similar_to--> `PostgreSQL Configuration`  [INFERRED] [semantically similar]
  CLAUDE.md → prisma-8.md
- `ActivitiesByTypePage()` --calls--> `getActivityCategory()`  [EXTRACTED]
  src/app/(home)/activities/type/[type]/page.tsx → src/lib/activities/queries.ts
- `Home()` --calls--> `Button()`  [EXTRACTED]
  src/app/(home)/page.tsx → src/components/ui/button.tsx

## Import Cycles
- None detected.

## Communities (31 total, 14 thin omitted)

### Community 0 - "Activity Experience"
Cohesion: 0.08
Nodes (25): react, ActivityPage(), ActivityResultView(), ActivityRunner(), handleRetry(), handleSubmit(), Button(), useActivity() (+17 more)

### Community 1 - "Learning Routes"
Cohesion: 0.11
Nodes (26): nextConfig, next, ActivitiesPage(), ActivitiesByTypePage(), Learn(), metadata, Subjects(), Material() (+18 more)

### Community 2 - "Shared Layout"
Cohesion: 0.10
Nodes (16): @base-ui/react, metadata, RootLayout(), HomeFooter(), HomeHeader(), Avatar(), AvatarFallback(), AvatarImage() (+8 more)

### Community 3 - "Data and Authentication"
Cohesion: 0.09
Nodes (12): better-auth, @prisma/adapter-mariadb, server-only, activityTypes, activities, InternalActivity, InternalQuestion, ActivityType (+4 more)

### Community 4 - "Project Configuration"
Cohesion: 0.08
Nodes (23): eslintConfig, ignoreScripts, name, packageManager, private, trustedDependencies, type, version (+15 more)

### Community 5 - "Component Structure"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 6 - "Fonts and Utilities"
Cohesion: 0.11
Nodes (10): cn, lucide-react, geistMono, geistSans, inter, metadata, PaginationLink(), PaginationLinkProps (+2 more)

### Community 7 - "TypeScript Settings"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "Runtime Dependencies"
Cohesion: 0.13
Nodes (15): dependencies, @base-ui/react, better-auth, class-variance-authority, cn, dotenv, lucide-react, next (+7 more)

### Community 9 - "Alert Dialog"
Cohesion: 0.18
Nodes (5): AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogOverlay(), AlertDialogPortal()

### Community 10 - "Route Type Definitions"
Cohesion: 0.17
Nodes (11): AppRoutes, LayoutProps, LayoutRoutes, LayoutSlotMap, PageProps, PageRoutes, ParamMap, ParamsOf (+3 more)

### Community 11 - "Development Tooling"
Cohesion: 0.18
Nodes (11): devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, @types/node (+3 more)

### Community 12 - "Database Scripts"
Cohesion: 0.18
Nodes (11): scripts, build, db:deploy, db:generate, db:migrate, db:seed, db:studio, dev (+3 more)

### Community 13 - "Prisma Documentation"
Cohesion: 0.22
Nodes (9): Active Prisma Schema, Authentication TODOs, Better Auth Prisma Adapter, Local Database Setup, MariaDB and Prisma 7, Inactive Prisma 8 Reference, Prisma Data Contract, PostgreSQL Configuration (+1 more)

### Community 14 - "Generated Route Checks"
Cohesion: 0.22
Nodes (7): ../../src/app/layout.js, ../../src/app/page.js, AppPageConfig, __Check, __IsExpected, LayoutConfig, __Unused

### Community 15 - "Home and Alert UI"
Cohesion: 0.42
Nodes (6): class-variance-authority, Home(), Alert(), AlertDescription(), AlertTitle(), alertVariants

### Community 16 - "Next.js Starter Guide"
Cohesion: 0.50
Nodes (4): create-next-app, Geist Font, next/font, Next.js Starter Project

## Knowledge Gaps
- **136 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+131 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 211 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Learning Routes` to `Activity Experience`, `Shared Layout`, `Project Configuration`, `Fonts and Utilities`, `Generated Route Checks`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _136 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Activity Experience` be split into smaller, more focused modules?**
  _Cohesion score 0.07755102040816327 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Activity Experience` to `Learning Routes`, `Shared Layout`, `Project Configuration`, `Fonts and Utilities`, `Alert Dialog`, `Home and Alert UI`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Should `Learning Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.10505050505050505 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `Runtime Dependencies` to `Project Configuration`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `Shared Layout` be split into smaller, more focused modules?**
  _Cohesion score 0.10338680926916222 - nodes in this community are weakly interconnected._