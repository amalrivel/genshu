# Graph Report - genshu  (2026-09-26)

## Corpus Check
- 237 files · ~113,040 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 929 nodes · 1484 edges · 152 communities (52 shown, 99 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `39a83c61`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cohorts/[id]/page.tsx
- package.json
- components.json
- compilerOptions
- dropdown-menu.tsx
- data-context.tsx
- dependencies
- createClient
- Narrow Effect Dependencies
- Extract to Memoized Components
- Cache Repeated Function Calls
- Genshu AI development workflow
- Use useTransition Over Manual Loading States
- Prevent Hydration Mismatch Without Flickering
- Deduplicate Global Event Listeners
- Early Return from Functions
- Use React DOM Resource Hints
- Avoid Layout Thrashing
- Combine Multiple Array Iterations
- Build Index Maps for Repeated Lookups
- Authenticate Server Actions Like API Routes
- Cross-Request LRU Caching
- Hoist Static I/O to Module Level
- eslint.config.mjs
- postcss.config.mjs
- shadcn Logo Asset
- shadcn/ui Logo
- Icons
- Styling and Customization
- React Best Practices
- React Best Practices Repository
- Do Not Put Effect Events in Dependency Arrays
- Store Event Handlers in Refs
- Initialize App Once, Not Per Mount
- useEffectEvent for Stable Callback Refs
- Prevent Waterfall Chains in API Routes
- Check Cheap Conditions Before Async Flags
- Defer Await Until Needed
- Dependency-Based Parallelization
- Promise.all for Independent Operations
- Strategic Suspense Boundaries
- Prefer Statically Analyzable Paths
- Avoid Barrel File Imports
- Conditional Module Loading
- Defer Non-Critical Third-Party Libraries
- Dynamic Imports for Heavy Components
- Preload Based on User Intent
- Hoist RegExp Creation
- Defer Non-Critical Work with requestIdleCallback
- Use toSorted() Instead of sort() for Immutability
- Use Activity Component for Show/Hide
- Use Explicit Conditional Rendering
- Use useRef for Transient Values
- Performance Rule Sections
- Use after() for Non-Blocking Operations
- Avoid Duplicate Serialization in RSC Props
- Parallel Data Fetching with Component Composition
- Parallel Nested Data Fetching
- Minimize Serialization at RSC Boundaries
- Rule Template
- Vercel React Best Practices Skill
- Web Interface Guidelines
- migrate.js
- seed.js
- verify.js
- smoke-learning.sh
- scripts
- devDependencies
- Supabase
- Changelog
- Changelog
- Writing Guidelines for Postgres References
- shadcn Agent Configuration
- shadcn/ui Logo
- shadcn CLI Reference
- Customization and Theming
- shadcn MCP Server
- Registry Authoring and Addresses
- Base versus Radix
- Chat and Messaging
- Component Composition
- Forms and Inputs
- shadcn UI
- Optimize SVG Precision
- Don't Define Components Inside Components
- Claude Project Reference
- File Icon
- Globe Icon
- Next.js Logo
- Vercel Logo
- Window Icon
- Genshu README
- Section Definitions
- request.ts
- 5. Release Scope
- database.types.ts
- Genshu Agent Instructions
- Supabase Postgres Best Practices
- 6. Language Rules
- 3. Primary Users
- 9. Technical Direction
- 10. Data Platform
- advanced-full-text-search.md
- Genshu — Project Source of Truth
- advanced-jsonb-indexing.md
- conn-idle-timeout.md
- conn-limits.md
- conn-pooling.md
- conn-prepared-statements.md
- data-batch-inserts.md
- data-n-plus-one.md
- data-pagination.md
- data-upsert.md
- lock-advisory.md
- lock-deadlock-prevention.md
- lock-short-transactions.md
- lock-skip-locked.md
- monitor-explain-analyze.md
- monitor-pg-stat-statements.md
- monitor-vacuum-analyze.md
- query-composite-indexes.md
- query-covering-indexes.md
- query-index-types.md
- query-missing-indexes.md
- query-partial-indexes.md
- schema-constraints.md
- schema-data-types.md
- schema-foreign-key-indexes.md
- schema-lowercase-identifiers.md
- schema-partitioning.md
- schema-primary-keys.md
- security-privileges.md
- security-rls-basics.md
- security-rls-performance.md
- _template.md
- Cookies
- Browser Automation with playwright-cli
- 3. Heal
- Browser Session Management
- Running Custom Playwright Code
- Tracing
- playwright-cli/SKILL.md
- Video Recording
- Advanced Mocking with run-code
- check-data-api-migration.js
- check-data-api.js
- Attaching to a Running Browser
- Best Practices
- The Fixes
- verify.ts
- app-header.tsx

## God Nodes (most connected - your core abstractions)
1. `react` - 36 edges
2. `Genshu — Project Source of Truth` - 29 edges
3. `lucide-react` - 26 edges
4. `createClient()` - 24 edges
5. `next-intl` - 22 edges
6. `Button()` - 21 edges
7. `useData()` - 21 edges
8. `Badge()` - 17 edges
9. `compilerOptions` - 16 edges
10. `scripts` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Version and Minimize localStorage Data` --semantically_similar_to--> `Cache Storage API Calls`  [INFERRED] [semantically similar]
  .agents/skills/vercel-react-best-practices/rules/client-localstorage-schema.md → .agents/skills/vercel-react-best-practices/rules/js-cache-storage.md
- `Cache Repeated Function Calls` --semantically_similar_to--> `Cache Property Access in Loops`  [INFERRED] [semantically similar]
  .agents/skills/vercel-react-best-practices/rules/js-cache-function-results.md → .agents/skills/vercel-react-best-practices/rules/js-cache-property-access.md
- `Cache Repeated Function Calls` --semantically_similar_to--> `Cache Storage API Calls`  [INFERRED] [semantically similar]
  .agents/skills/vercel-react-best-practices/rules/js-cache-function-results.md → .agents/skills/vercel-react-best-practices/rules/js-cache-storage.md
- `CSS content-visibility for Long Lists` --semantically_similar_to--> `Use useDeferredValue for Expensive Derived Renders`  [INFERRED] [semantically similar]
  .agents/skills/vercel-react-best-practices/rules/rendering-content-visibility.md → .agents/skills/vercel-react-best-practices/rules/rerender-use-deferred-value.md
- `Use useTransition Over Manual Loading States` --semantically_similar_to--> `Use Transitions for Non-Urgent Updates`  [INFERRED] [semantically similar]
  .agents/skills/vercel-react-best-practices/rules/rendering-usetransition-loading.md → .agents/skills/vercel-react-best-practices/rules/rerender-transitions.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Array Iteration Optimization Patterns** — _agents_skills_vercel_react_best_practices_rules_js_combine_iterations_combine_multiple_array_iterations, _agents_skills_vercel_react_best_practices_rules_js_flatmap_filter_use_flatmap_to_map_and_filter_in_one_pass, _agents_skills_vercel_react_best_practices_rules_js_min_max_loop_use_loop_for_min_max_instead_of_sort [INFERRED 0.85]
- **Caching Performance Patterns** — _agents_skills_vercel_react_best_practices_rules_js_cache_function_results_cache_repeated_function_calls, _agents_skills_vercel_react_best_practices_rules_js_cache_property_access_cache_property_access_in_loops, _agents_skills_vercel_react_best_practices_rules_js_cache_storage_cache_storage_api_calls [INFERRED 0.85]
- **Derived Dependency Minimization** — agents_skills_vercel_react_best_practices_rules_rerender_dependencies_narrow_effect_dependencies, agents_skills_vercel_react_best_practices_rules_rerender_derived_state_no_effect_calculate_derived_state, agents_skills_vercel_react_best_practices_rules_rerender_derived_state_subscribe_to_derived_state, agents_skills_vercel_react_best_practices_rules_rerender_split_combined_hooks_split_hook_computations [INFERRED 0.85]
- **React Concurrent Rendering Responsiveness** — agents_skills_vercel_react_best_practices_rules_rendering_usetransition_loading_use_transition_loading, agents_skills_vercel_react_best_practices_rules_rerender_transitions_transitions_for_non_urgent_updates, agents_skills_vercel_react_best_practices_rules_rerender_use_deferred_value_use_deferred_value [INFERRED 0.85]

## Communities (152 total, 99 thin omitted)

### Community 0 - "cohorts/[id]/page.tsx"
Cohesion: 0.08
Nodes (75): lucide-react, next-intl, react, AssignmentDetailPage(), AssignmentsPage(), SessionRollCallPage(), STATUS_OPTIONS, AttendancePage() (+67 more)

### Community 1 - "package.json"
Cohesion: 0.10
Nodes (20): ignoreScripts, name, packageManager, private, trustedDependencies, version, babel-plugin-react-compiler, @base-ui/react (+12 more)

### Community 2 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 5 - "data-context.tsx"
Cohesion: 0.10
Nodes (37): CohortMembers, CohortRosterPanelsProps, StudentProfileDrawerProps, DataContext, DataContextType, DataProvider(), getRoleServerSnapshot(), getRoleSnapshot() (+29 more)

### Community 6 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, @base-ui/react, class-variance-authority, cn, lucide-react, next, next-intl, next-themes (+6 more)

### Community 7 - "createClient"
Cohesion: 0.06
Nodes (54): names, original, signIn(), signOut(), dynamic, LoginPage(), MaterialsPage(), dynamic (+46 more)

### Community 8 - "Narrow Effect Dependencies"
Cohesion: 0.33
Nodes (6): Narrow Effect Dependencies, Calculate Derived State During Rendering, Subscribe to Derived State, Use Functional setState Updates, Put Interaction Logic in Event Handlers, Split Combined Hook Computations

### Community 9 - "Extract to Memoized Components"
Cohesion: 0.40
Nodes (5): Hoist Static JSX Elements, React Compiler, Extract to Memoized Components, Extract Default Non-primitive Parameter Value from Memoized Component to Constant, Do not wrap a simple expression with a primitive result type in useMemo

### Community 10 - "Cache Repeated Function Calls"
Cohesion: 0.50
Nodes (4): Version and Minimize localStorage Data, Cache Repeated Function Calls, Cache Property Access in Loops, Cache Storage API Calls

### Community 11 - "Genshu AI development workflow"
Cohesion: 0.25
Nodes (8): Decision boundaries, Development loop, Genshu AI development workflow, Local learning-content database, Repository knowledge, Sources and scope, Staff access setup, Verification

### Community 12 - "Use useTransition Over Manual Loading States"
Cohesion: 0.50
Nodes (4): CSS content-visibility for Long Lists, Use useTransition Over Manual Loading States, Use Transitions for Non-Urgent Updates, Use useDeferredValue for Expensive Derived Renders

### Community 13 - "Prevent Hydration Mismatch Without Flickering"
Cohesion: 0.50
Nodes (4): Prevent Hydration Mismatch Without Flickering, Suppress Expected Hydration Mismatches, Defer State Reads to Usage Point, Use Lazy State Initialization

### Community 14 - "Deduplicate Global Event Listeners"
Cohesion: 0.67
Nodes (3): Deduplicate Global Event Listeners, Use Passive Event Listeners for Scrolling Performance, Use SWR for Automatic Deduplication

### Community 15 - "Early Return from Functions"
Cohesion: 0.67
Nodes (3): Early Return from Functions, Early Length Check for Array Comparisons, Use Loop for Min/Max Instead of Sort

### Community 16 - "Use React DOM Resource Hints"
Cohesion: 0.67
Nodes (3): Use React DOM Resource Hints, React DOM Resource Preloading APIs, Use defer or async on Script Tags

### Community 62 - "migrate.js"
Cohesion: 0.33
Nodes (4): connectionString, folder, migrations, parsedUrl

### Community 63 - "seed.js"
Cohesion: 0.50
Nodes (3): child, connectionString, parsedUrl

### Community 64 - "verify.js"
Cohesion: 0.50
Nodes (3): connectionString, parsedUrl, permissionsOnly

### Community 66 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, db:check-data-api, db:check-data-api-live, db:migrate, db:seed, db:verify (+7 more)

### Community 67 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+2 more)

### Community 68 - "Supabase"
Cohesion: 0.11
Nodes (15): Fix suggestion, Source, What happened, Skill Feedback, Steps, Core Principles, Debugging, Making and Committing Schema Changes (+7 more)

### Community 69 - "Changelog"
Cohesion: 0.12
Nodes (16): [1.2.0](https://github.com/supabase/agent-skills/compare/v1.1.1...v1.2.0) (2026-06-02), [1.3.0](https://github.com/supabase/agent-skills/compare/v1.2.0...v1.3.0) (2026-06-05), [1.4.0](https://github.com/supabase/agent-skills/compare/v1.3.0...v1.4.0) (2026-07-10), [1.5.0](https://github.com/supabase/agent-skills/compare/supabase-postgres-best-practices-v1.4.0...supabase-postgres-best-practices-v1.5.0) (2026-07-30), [1.6.0](https://github.com/supabase/agent-skills/compare/supabase-postgres-best-practices-v1.5.0...supabase-postgres-best-practices-v1.6.0) (2026-07-30), Bug Fixes, Bug Fixes, Bug Fixes (+8 more)

### Community 70 - "Changelog"
Cohesion: 0.12
Nodes (15): [0.1.3](https://github.com/supabase/agent-skills/compare/v0.1.2...v0.1.3) (2026-06-02), [0.1.4](https://github.com/supabase/agent-skills/compare/v0.1.3...v0.1.4) (2026-06-05), [0.1.5](https://github.com/supabase/agent-skills/compare/v0.1.4...v0.1.5) (2026-07-10), [0.1.6](https://github.com/supabase/agent-skills/compare/v0.1.5...supabase-v0.1.6) (2026-07-30), [0.1.7](https://github.com/supabase/agent-skills/compare/v0.1.6...supabase-v0.1.7) (2026-08-12), Bug Fixes, Bug Fixes, Bug Fixes (+7 more)

### Community 71 - "Writing Guidelines for Postgres References"
Cohesion: 0.12
Nodes (15): 1. Concrete Transformation Patterns, 2. Error-First Structure, 3. Quantified Impact, 4. Self-Contained Examples, 5. Semantic Naming, Code Example Standards, Comments, Impact Level Guidelines (+7 more)

### Community 92 - "Section Definitions"
Cohesion: 0.20
Nodes (9): 1. Query Performance (query), 2. Connection Management (conn), 3. Security & RLS (security), 4. Schema Design (schema), 5. Concurrency & Locking (lock), 6. Data Access Patterns (data), 7. Monitoring & Diagnostics (monitor), 8. Advanced Features (advanced) (+1 more)

### Community 93 - "request.ts"
Cohesion: 0.50
Nodes (3): defaultLocale, Locale, locales

### Community 94 - "5. Release Scope"
Cohesion: 0.29
Nodes (7): 5. Release Scope, First live release, First live release: Practice, Later release: Assignments, Later release: Attendance, Later release: Exams, Learning materials

### Community 95 - "database.types.ts"
Cohesion: 0.19
Nodes (8): @supabase/ssr, Database, Json, Table, updateSession(), config, prototypePaths, proxy()

### Community 96 - "Genshu Agent Instructions"
Cohesion: 0.33
Nodes (4): Architectural Change Rules, Genshu Agent Instructions, Source of Truth Hierarchy, Worker and Reviewer Protocol

### Community 97 - "Supabase Postgres Best Practices"
Cohesion: 0.33
Nodes (5): How to Use, References, Rule Categories by Priority, Supabase Postgres Best Practices, When to Apply

### Community 98 - "6. Language Rules"
Cohesion: 0.40
Nodes (5): 6. Language Rules, Application Interface, Assignments and Exams, Furigana, Learning Content

### Community 99 - "3. Primary Users"
Cohesion: 0.50
Nodes (4): 3.1 Gakusei — 学生, 3.2 Sensei — 先生, 3.3 Tantōsha — 担当者, 3. Primary Users

### Community 100 - "9. Technical Direction"
Cohesion: 0.50
Nodes (4): 9. Technical Direction, Application Framework, Runtime and Package Manager, UI

### Community 101 - "10. Data Platform"
Cohesion: 0.67
Nodes (3): 10. Data Platform, Database Access Layer, Local Development

### Community 103 - "Genshu — Project Source of Truth"
Cohesion: 0.08
Nodes (24): 11. Authentication, 12. File Storage, 13. Deployment Direction, 14. Architecture Principle, 15. Anti-Overengineering Rules, 16. UX Principles, 17. Mobile and Desktop, 18. Data Ownership (+16 more)

### Community 135 - "Cookies"
Cohesion: 0.06
Nodes (35): Advanced: Multiple Cookies or Custom Options, Advanced: Multiple Operations, Authentication State Reuse, Clear All Cookies, Clear All localStorage, Clear sessionStorage, Common Patterns, Cookies (+27 more)

### Community 136 - "Browser Automation with playwright-cli"
Cohesion: 0.08
Nodes (24): Browser Automation with playwright-cli, Browser Sessions, Commands, Core, DevTools, Example: Debugging with DevTools, Example: Form submission, Example: Interactive session (+16 more)

### Community 137 - "3. Heal"
Cohesion: 0.09
Nodes (23): 0. How generation works, 1.1 Prerequisite: workspace, 1.2 Prerequisite: seed test, 1.3 Explore the app, 1.4 Write the spec file, 1. Planning, 2.1 Inputs, 2.2 Generate one scenario (+15 more)

### Community 138 - "Browser Session Management"
Cohesion: 0.18
Nodes (11): A/B Testing Sessions, Browser Session Commands, Browser Session Configuration, Browser Session Isolation Properties, Browser Session Management, Common Patterns, Concurrent Scraping, Default Browser Session (+3 more)

### Community 139 - "Running Custom Playwright Code"
Cohesion: 0.15
Nodes (13): Clipboard, Complex Workflows, Error Handling, File Downloads, Frames and Iframes, Geolocation, JavaScript Execution, Media Emulation (+5 more)

### Community 140 - "Tracing"
Cohesion: 0.12
Nodes (16): 1. Start Tracing Before the Problem, 2. Clean Up Old Traces, Analyzing Performance, Basic Usage, Best Practices, Capturing Evidence, Debugging Failed Actions, Limitations (+8 more)

### Community 141 - "playwright-cli/SKILL.md"
Cohesion: 0.24
Nodes (4): Examples, Inspecting Element Attributes, Debugging Playwright Tests, Running Playwright Tests

### Community 142 - "Video Recording"
Cohesion: 0.22
Nodes (8): 1. Use Descriptive Filenames, 2. Record entire hero scripts., Basic Recording, Best Practices, Limitations, Overlay API Summary, Tracing vs Video, Video Recording

### Community 143 - "Advanced Mocking with run-code"
Cohesion: 0.25
Nodes (8): Advanced Mocking with run-code, CLI Route Commands, Conditional Response Based on Request, Delayed Response, Modify Real Response, Request Mocking, Simulate Network Failures, URL Patterns

### Community 144 - "check-data-api-migration.js"
Cohesion: 0.38
Nodes (5): denied(), migrations, practice(), publicChecks(), questions

### Community 145 - "check-data-api.js"
Cohesion: 0.17
Nodes (8): material, missing, question, readers, sections, sensei, set, @supabase/supabase-js

### Community 146 - "Attaching to a Running Browser"
Cohesion: 0.40
Nodes (5): Attach by channel name, Attach via browser extension, Attach via CDP endpoint, Attaching to a Running Browser, Detach

### Community 147 - "Best Practices"
Cohesion: 0.50
Nodes (4): 1. Name Browser Sessions Semantically, 2. Always Clean Up, 3. Delete Stale Browser Data, Best Practices

### Community 155 - "The Fixes"
Cohesion: 0.09
Nodes (21): 10. Status bar color doesn't match, 11. Right in Chrome, wrong on phone, 1. Hover state stuck after tap, 2. Gray/blue flash on tap, 3. Layout has the wrong height, 4. Page zooms into the input, 5. Tap feels laggy, 6. Pull-to-refresh hijacks scroll (+13 more)

### Community 263 - "verify.ts"
Cohesion: 0.36
Nodes (9): isObject(), JsonObject, keyTypes(), locales, output(), readLocale(), run(), validateLocales() (+1 more)

### Community 385 - "app-header.tsx"
Cohesion: 0.14
Nodes (11): nextConfig, withNextIntl, next, next-themes, metadata, LanguageToggle(), AppHeader(), links (+3 more)

## Knowledge Gaps
- **535 isolated node(s):** `names`, `original`, `JsonObject`, `locales`, `$schema` (+530 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 612 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **99 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `cohorts/[id]/page.tsx` to `package.json`, `app-header.tsx`, `dropdown-menu.tsx`, `data-context.tsx`, `createClient`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `cohorts/[id]/page.tsx` to `package.json`, `app-header.tsx`, `dropdown-menu.tsx`, `createClient`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `@supabase/ssr` connect `database.types.ts` to `package.json`, `createClient`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `names`, `original`, `JsonObject` to the rest of the system?**
  _535 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cohorts/[id]/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07933342828656886 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `components.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._