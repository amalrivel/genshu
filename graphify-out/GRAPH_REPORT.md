# Graph Report - genshu  (2026-09-26)

## Corpus Check
- 255 files · ~297,614 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1316 nodes · 1877 edges · 241 communities (141 shown, 99 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `de3e4eef`
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
- Test generation (plan → generate → heal)
- Browser Session Management
- Running Custom Playwright Code
- Tracing
- playwright-cli/SKILL.md
- Video Recording
- Advanced Mocking with run-code
- check-data-api-migration.js
- import-gentsuki-ready-web.ts
- sourceFiles
- assetMeta
- 3. Heal
- RTK - Rust Token Killer (Google Antigravity)
- 1. Planning
- 2. Generate
- 1-10
- 1-1
- The Fixes
- 1-2
- 1-3
- 1-4
- 1-5
- 1-6
- 1-7
- 1-8
- 1-9
- 2-10
- 2-1
- 2-3
- 2-4
- 2-5
- 2-6
- 2-7
- 2-8
- 2-9
- 3031
- 3091
- 3131
- 3211
- 3271
- 3311
- 3381
- 3461
- 3471
- 3481
- 3-10
- 3-11
- 3-1
- 3-2
- 3-3
- 3-4
- 3-5
- 3-6
- 3-7
- 3-8
- 3-9
- 4051
- 4121
- 4161
- 4191
- 4241
- 4271
- 4401
- 4421
- 4451
- 4471
- 4481
- 5011
- 5101
- 5141
- 5191
- 5241
- 5281
- 5331
- 5401
- 5451
- 5471
- 5481
- 6051
- 6101
- 6161
- 6201
- 6251
- 6301
- 6361
- 6401
- 6451
- 6471
- 6481
- その他の危険 標識
- 二輪の自動車以外通行止め 標識
- 合流注意 警戒標識
- 専用通行帯 原付 通行
- 左折可 標識 日本
- 登坂車線 交通標識
- 自転車専用 標識 日本
- 車両横断禁止 標識
- 車線減少 警戒標識
- 転回禁止 標示
- Gentsuki bank import
- next.config.ts
- verify.ts
- layout.tsx

## God Nodes (most connected - your core abstractions)
1. `assetMeta` - 85 edges
2. `react` - 36 edges
3. `Genshu — Project Source of Truth` - 29 edges
4. `lucide-react` - 26 edges
5. `createClient()` - 24 edges
6. `next-intl` - 22 edges
7. `Button()` - 21 edges
8. `useData()` - 21 edges
9. `Badge()` - 17 edges
10. `compilerOptions` - 16 edges

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

## Communities (241 total, 99 thin omitted)

### Community 0 - "cohorts/[id]/page.tsx"
Cohesion: 0.07
Nodes (81): lucide-react, next-intl, react, AssignmentDetailPage(), AssignmentsPage(), SessionRollCallPage(), STATUS_OPTIONS, AttendancePage() (+73 more)

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
Cohesion: 0.11
Nodes (34): CohortRosterPanelsProps, DataContext, DataContextType, DataProvider(), getRoleServerSnapshot(), getRoleSnapshot(), notifyRoleListeners(), roleListeners (+26 more)

### Community 6 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, @base-ui/react, class-variance-authority, cn, lucide-react, next, next-intl, next-themes (+6 more)

### Community 7 - "createClient"
Cohesion: 0.06
Nodes (56): names, original, signIn(), signOut(), dynamic, LoginPage(), MaterialsPage(), dynamic (+48 more)

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

### Community 137 - "Test generation (plan → generate → heal)"
Cohesion: 0.29
Nodes (7): 0. How generation works, Add assertions manually, Building a test file, Cross-references, Explore before recording, Test generation (plan → generate → heal), Use semantic locators

### Community 138 - "Browser Session Management"
Cohesion: 0.10
Nodes (20): 1. Name Browser Sessions Semantically, 2. Always Clean Up, 3. Delete Stale Browser Data, A/B Testing Sessions, Attach by channel name, Attach via browser extension, Attach via CDP endpoint, Attaching to a Running Browser (+12 more)

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

### Community 145 - "import-gentsuki-ready-web.ts"
Cohesion: 0.07
Nodes (30): material, missing, question, readers, sections, sensei, set, Bank (+22 more)

### Community 146 - "sourceFiles"
Cohesion: 0.15
Nodes (13): sourceFiles, book_1.json, book_2.json, book_3.json, genchare_1.json, genchare_2.json, genchare_3.json, genchare_4.json (+5 more)

### Community 147 - "assetMeta"
Cohesion: 0.25
Nodes (7): height, sha, width, assetMeta, 2-2, commit, repository

### Community 148 - "3. Heal"
Cohesion: 0.33
Nodes (6): 3.1 Find failing tests, 3.2 Debug one failure, 3.3 Apply the fix, 3.4 Reconcile with the spec, 3.5 Iteration and giving up, 3. Heal

### Community 149 - "RTK - Rust Token Killer (Google Antigravity)"
Cohesion: 0.40
Nodes (4): Meta Commands, RTK - Rust Token Killer (Google Antigravity), Rule, Why

### Community 150 - "1. Planning"
Cohesion: 0.40
Nodes (5): 1.1 Prerequisite: workspace, 1.2 Prerequisite: seed test, 1.3 Explore the app, 1.4 Write the spec file, 1. Planning

### Community 151 - "2. Generate"
Cohesion: 0.40
Nodes (5): 2.1 Inputs, 2.2 Generate one scenario, 2.3 Generate multiple scenarios, 2.4 Run generated tests, 2. Generate

### Community 153 - "1-10"
Cohesion: 0.50
Nodes (4): height, sha, width, 1-10

### Community 154 - "1-1"
Cohesion: 0.50
Nodes (4): height, sha, width, 1-1

### Community 155 - "The Fixes"
Cohesion: 0.09
Nodes (21): 10. Status bar color doesn't match, 11. Right in Chrome, wrong on phone, 1. Hover state stuck after tap, 2. Gray/blue flash on tap, 3. Layout has the wrong height, 4. Page zooms into the input, 5. Tap feels laggy, 6. Pull-to-refresh hijacks scroll (+13 more)

### Community 156 - "1-2"
Cohesion: 0.50
Nodes (4): height, sha, width, 1-2

### Community 157 - "1-3"
Cohesion: 0.50
Nodes (4): height, sha, width, 1-3

### Community 158 - "1-4"
Cohesion: 0.50
Nodes (4): height, sha, width, 1-4

### Community 159 - "1-5"
Cohesion: 0.50
Nodes (4): height, sha, width, 1-5

### Community 160 - "1-6"
Cohesion: 0.50
Nodes (4): height, sha, width, 1-6

### Community 161 - "1-7"
Cohesion: 0.50
Nodes (4): height, sha, width, 1-7

### Community 162 - "1-8"
Cohesion: 0.50
Nodes (4): height, sha, width, 1-8

### Community 163 - "1-9"
Cohesion: 0.50
Nodes (4): height, sha, width, 1-9

### Community 164 - "2-10"
Cohesion: 0.50
Nodes (4): height, sha, width, 2-10

### Community 165 - "2-1"
Cohesion: 0.50
Nodes (4): height, sha, width, 2-1

### Community 166 - "2-3"
Cohesion: 0.50
Nodes (4): height, sha, width, 2-3

### Community 167 - "2-4"
Cohesion: 0.50
Nodes (4): height, sha, width, 2-4

### Community 168 - "2-5"
Cohesion: 0.50
Nodes (4): height, sha, width, 2-5

### Community 169 - "2-6"
Cohesion: 0.50
Nodes (4): height, sha, width, 2-6

### Community 170 - "2-7"
Cohesion: 0.50
Nodes (4): height, sha, width, 2-7

### Community 171 - "2-8"
Cohesion: 0.50
Nodes (4): height, sha, width, 2-8

### Community 172 - "2-9"
Cohesion: 0.50
Nodes (4): height, sha, width, 2-9

### Community 173 - "3031"
Cohesion: 0.50
Nodes (4): height, sha, width, 3031

### Community 174 - "3091"
Cohesion: 0.50
Nodes (4): height, sha, width, 3091

### Community 175 - "3131"
Cohesion: 0.50
Nodes (4): height, sha, width, 3131

### Community 176 - "3211"
Cohesion: 0.50
Nodes (4): height, sha, width, 3211

### Community 177 - "3271"
Cohesion: 0.50
Nodes (4): height, sha, width, 3271

### Community 178 - "3311"
Cohesion: 0.50
Nodes (4): height, sha, width, 3311

### Community 179 - "3381"
Cohesion: 0.50
Nodes (4): height, sha, width, 3381

### Community 180 - "3461"
Cohesion: 0.50
Nodes (4): height, sha, width, 3461

### Community 181 - "3471"
Cohesion: 0.50
Nodes (4): height, sha, width, 3471

### Community 182 - "3481"
Cohesion: 0.50
Nodes (4): height, sha, width, 3481

### Community 183 - "3-10"
Cohesion: 0.50
Nodes (4): height, sha, width, 3-10

### Community 184 - "3-11"
Cohesion: 0.50
Nodes (4): height, sha, width, 3-11

### Community 185 - "3-1"
Cohesion: 0.50
Nodes (4): height, sha, width, 3-1

### Community 186 - "3-2"
Cohesion: 0.50
Nodes (4): height, sha, width, 3-2

### Community 187 - "3-3"
Cohesion: 0.50
Nodes (4): height, sha, width, 3-3

### Community 188 - "3-4"
Cohesion: 0.50
Nodes (4): height, sha, width, 3-4

### Community 189 - "3-5"
Cohesion: 0.50
Nodes (4): height, sha, width, 3-5

### Community 190 - "3-6"
Cohesion: 0.50
Nodes (4): height, sha, width, 3-6

### Community 191 - "3-7"
Cohesion: 0.50
Nodes (4): height, sha, width, 3-7

### Community 192 - "3-8"
Cohesion: 0.50
Nodes (4): height, sha, width, 3-8

### Community 193 - "3-9"
Cohesion: 0.50
Nodes (4): height, sha, width, 3-9

### Community 194 - "4051"
Cohesion: 0.50
Nodes (4): height, sha, width, 4051

### Community 195 - "4121"
Cohesion: 0.50
Nodes (4): height, sha, width, 4121

### Community 196 - "4161"
Cohesion: 0.50
Nodes (4): height, sha, width, 4161

### Community 197 - "4191"
Cohesion: 0.50
Nodes (4): height, sha, width, 4191

### Community 198 - "4241"
Cohesion: 0.50
Nodes (4): height, sha, width, 4241

### Community 199 - "4271"
Cohesion: 0.50
Nodes (4): height, sha, width, 4271

### Community 200 - "4401"
Cohesion: 0.50
Nodes (4): height, sha, width, 4401

### Community 201 - "4421"
Cohesion: 0.50
Nodes (4): height, sha, width, 4421

### Community 202 - "4451"
Cohesion: 0.50
Nodes (4): height, sha, width, 4451

### Community 203 - "4471"
Cohesion: 0.50
Nodes (4): height, sha, width, 4471

### Community 204 - "4481"
Cohesion: 0.50
Nodes (4): height, sha, width, 4481

### Community 205 - "5011"
Cohesion: 0.50
Nodes (4): height, sha, width, 5011

### Community 206 - "5101"
Cohesion: 0.50
Nodes (4): height, sha, width, 5101

### Community 207 - "5141"
Cohesion: 0.50
Nodes (4): height, sha, width, 5141

### Community 208 - "5191"
Cohesion: 0.50
Nodes (4): height, sha, width, 5191

### Community 209 - "5241"
Cohesion: 0.50
Nodes (4): height, sha, width, 5241

### Community 210 - "5281"
Cohesion: 0.50
Nodes (4): height, sha, width, 5281

### Community 211 - "5331"
Cohesion: 0.50
Nodes (4): height, sha, width, 5331

### Community 212 - "5401"
Cohesion: 0.50
Nodes (4): height, sha, width, 5401

### Community 213 - "5451"
Cohesion: 0.50
Nodes (4): height, sha, width, 5451

### Community 214 - "5471"
Cohesion: 0.50
Nodes (4): height, sha, width, 5471

### Community 215 - "5481"
Cohesion: 0.50
Nodes (4): height, sha, width, 5481

### Community 216 - "6051"
Cohesion: 0.50
Nodes (4): height, sha, width, 6051

### Community 217 - "6101"
Cohesion: 0.50
Nodes (4): height, sha, width, 6101

### Community 218 - "6161"
Cohesion: 0.50
Nodes (4): height, sha, width, 6161

### Community 219 - "6201"
Cohesion: 0.50
Nodes (4): height, sha, width, 6201

### Community 220 - "6251"
Cohesion: 0.50
Nodes (4): height, sha, width, 6251

### Community 221 - "6301"
Cohesion: 0.50
Nodes (4): height, sha, width, 6301

### Community 222 - "6361"
Cohesion: 0.50
Nodes (4): height, sha, width, 6361

### Community 223 - "6401"
Cohesion: 0.50
Nodes (4): height, sha, width, 6401

### Community 224 - "6451"
Cohesion: 0.50
Nodes (4): height, sha, width, 6451

### Community 225 - "6471"
Cohesion: 0.50
Nodes (4): height, sha, width, 6471

### Community 226 - "6481"
Cohesion: 0.50
Nodes (4): height, sha, width, 6481

### Community 227 - "その他の危険 標識"
Cohesion: 0.50
Nodes (4): その他の危険 標識, height, sha, width

### Community 228 - "二輪の自動車以外通行止め 標識"
Cohesion: 0.50
Nodes (4): 二輪の自動車以外通行止め 標識, height, sha, width

### Community 229 - "合流注意 警戒標識"
Cohesion: 0.50
Nodes (4): 合流注意 警戒標識 , height, sha, width

### Community 230 - "専用通行帯 原付 通行"
Cohesion: 0.50
Nodes (4): 専用通行帯 原付 通行 , height, sha, width

### Community 231 - "左折可 標識 日本"
Cohesion: 0.50
Nodes (4): 左折可 標識 日本, height, sha, width

### Community 232 - "登坂車線 交通標識"
Cohesion: 0.50
Nodes (4): 登坂車線 交通標識 , height, sha, width

### Community 233 - "自転車専用 標識 日本"
Cohesion: 0.50
Nodes (4): 自転車専用 標識 日本, height, sha, width

### Community 234 - "車両横断禁止 標識"
Cohesion: 0.50
Nodes (4): 車両横断禁止 標識, height, sha, width

### Community 235 - "車線減少 警戒標識"
Cohesion: 0.50
Nodes (4): 車線減少 警戒標識 , height, sha, width

### Community 236 - "転回禁止 標示"
Cohesion: 0.50
Nodes (4): 転回禁止 標示 , height, sha, width

### Community 237 - "Gentsuki bank import"
Cohesion: 0.50
Nodes (3): Gentsuki bank import, Mapping, Run

### Community 238 - "next.config.ts"
Cohesion: 0.50
Nodes (3): nextConfig, withNextIntl, next

### Community 263 - "verify.ts"
Cohesion: 0.36
Nodes (9): isObject(), JsonObject, keyTypes(), locales, output(), readLocale(), run(), validateLocales() (+1 more)

### Community 385 - "layout.tsx"
Cohesion: 0.28
Nodes (5): next-themes, metadata, AppHeader(), LegacyDataProvider(), ThemeProvider()

## Knowledge Gaps
- **821 isolated node(s):** `names`, `original`, `JsonObject`, `locales`, `$schema` (+816 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 900 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **99 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `assetMeta` connect `assetMeta` to `1-10`, `1-1`, `1-2`, `1-3`, `1-4`, `1-5`, `1-6`, `1-7`, `1-8`, `1-9`, `2-10`, `2-1`, `2-3`, `2-4`, `2-5`, `2-6`, `2-7`, `2-8`, `2-9`, `3031`, `3091`, `3131`, `3211`, `3271`, `3311`, `3381`, `3461`, `3471`, `3481`, `3-10`, `3-11`, `3-1`, `3-2`, `3-3`, `3-4`, `3-5`, `3-6`, `3-7`, `3-8`, `3-9`, `4051`, `4121`, `4161`, `4191`, `4241`, `4271`, `4401`, `4421`, `4451`, `4471`, `4481`, `5011`, `5101`, `5141`, `5191`, `5241`, `5281`, `5331`, `5401`, `5451`, `5471`, `5481`, `6051`, `6101`, `6161`, `6201`, `6251`, `6301`, `6361`, `6401`, `6451`, `6471`, `6481`, `その他の危険 標識`, `二輪の自動車以外通行止め 標識`, `合流注意 警戒標識`, `専用通行帯 原付 通行`, `左折可 標識 日本`, `登坂車線 交通標識`, `自転車専用 標識 日本`, `車両横断禁止 標識`, `車線減少 警戒標識`, `転回禁止 標示`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `react` connect `cohorts/[id]/page.tsx` to `package.json`, `layout.tsx`, `dropdown-menu.tsx`, `data-context.tsx`, `createClient`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `@supabase/supabase-js` connect `import-gentsuki-ready-web.ts` to `package.json`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `names`, `original`, `JsonObject` to the rest of the system?**
  _821 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cohorts/[id]/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07311586051743532 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `components.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._