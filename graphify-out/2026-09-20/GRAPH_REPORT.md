# Graph Report - genshu  (2026-09-20)

## Corpus Check
- 146 files · ~102,875 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 376 nodes · 732 edges · 94 communities (18 shown, 75 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b9d78a5d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- assignments/[id]/page.tsx
- package.json
- components.json
- compilerOptions
- app-header.tsx
- data-context.tsx
- dependencies
- Narrow Effect Dependencies
- Extract to Memoized Components
- Cache Repeated Function Calls
- Genshu Agent Instructions
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
- Class String Rewrites
- Consumer-side Prop Changes
- Disclosure and Toggle Mapping
- Display and Miscellaneous Mapping
- Form Controls Mapping
- Menu Family Mapping
- Overlay Mapping
- Radix UI to Base UI Migration
- Universal Migration Patterns
- Target Wrapper Shapes
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
- request.ts
- useData

## God Nodes (most connected - your core abstractions)
1. `useData()` - 29 edges
2. `react` - 28 edges
3. `lucide-react` - 22 edges
4. `Button()` - 20 edges
5. `next-intl` - 19 edges
6. `Badge()` - 16 edges
7. `compilerOptions` - 16 edges
8. `DataContextType` - 13 edges
9. `Dialog()` - 11 edges
10. `DialogContent()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `SessionRollCallPage()` --calls--> `useData()`  [EXTRACTED]
  src/app/attendance/[id]/page.tsx → src/lib/data-context.tsx
- `PracticePlayerPage()` --calls--> `useData()`  [EXTRACTED]
  src/app/practice/[id]/page.tsx → src/lib/data-context.tsx
- `Version and Minimize localStorage Data` --semantically_similar_to--> `Cache Storage API Calls`  [INFERRED] [semantically similar]
  .agents/skills/vercel-react-best-practices/rules/client-localstorage-schema.md → .agents/skills/vercel-react-best-practices/rules/js-cache-storage.md
- `Cache Repeated Function Calls` --semantically_similar_to--> `Cache Property Access in Loops`  [INFERRED] [semantically similar]
  .agents/skills/vercel-react-best-practices/rules/js-cache-function-results.md → .agents/skills/vercel-react-best-practices/rules/js-cache-property-access.md
- `Cache Repeated Function Calls` --semantically_similar_to--> `Cache Storage API Calls`  [INFERRED] [semantically similar]
  .agents/skills/vercel-react-best-practices/rules/js-cache-function-results.md → .agents/skills/vercel-react-best-practices/rules/js-cache-storage.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Array Iteration Optimization Patterns** — _agents_skills_vercel_react_best_practices_rules_js_combine_iterations_combine_multiple_array_iterations, _agents_skills_vercel_react_best_practices_rules_js_flatmap_filter_use_flatmap_to_map_and_filter_in_one_pass, _agents_skills_vercel_react_best_practices_rules_js_min_max_loop_use_loop_for_min_max_instead_of_sort [INFERRED 0.85]
- **Caching Performance Patterns** — _agents_skills_vercel_react_best_practices_rules_js_cache_function_results_cache_repeated_function_calls, _agents_skills_vercel_react_best_practices_rules_js_cache_property_access_cache_property_access_in_loops, _agents_skills_vercel_react_best_practices_rules_js_cache_storage_cache_storage_api_calls [INFERRED 0.85]
- **Derived Dependency Minimization** — agents_skills_vercel_react_best_practices_rules_rerender_dependencies_narrow_effect_dependencies, agents_skills_vercel_react_best_practices_rules_rerender_derived_state_no_effect_calculate_derived_state, agents_skills_vercel_react_best_practices_rules_rerender_derived_state_subscribe_to_derived_state, agents_skills_vercel_react_best_practices_rules_rerender_split_combined_hooks_split_hook_computations [INFERRED 0.85]
- **React Concurrent Rendering Responsiveness** — agents_skills_vercel_react_best_practices_rules_rendering_usetransition_loading_use_transition_loading, agents_skills_vercel_react_best_practices_rules_rerender_transitions_transitions_for_non_urgent_updates, agents_skills_vercel_react_best_practices_rules_rerender_use_deferred_value_use_deferred_value [INFERRED 0.85]

## Communities (94 total, 75 thin omitted)

### Community 0 - "assignments/[id]/page.tsx"
Cohesion: 0.19
Nodes (31): next-intl, react, SessionRollCallPage(), PracticePlayerPage(), BreadcrumbItem, Breadcrumbs(), BreadcrumbsProps, StudentProfileDrawer() (+23 more)

### Community 1 - "package.json"
Cohesion: 0.05
Nodes (39): nextConfig, withNextIntl, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss (+31 more)

### Community 2 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "app-header.tsx"
Cohesion: 0.09
Nodes (18): lucide-react, next-themes, metadata, LanguageToggle(), AppHeader(), managementItems, NavItem, primaryItems (+10 more)

### Community 5 - "data-context.tsx"
Cohesion: 0.10
Nodes (36): StudentProfileDrawerProps, DataContext, DataContextType, DataProvider(), getRoleServerSnapshot(), getRoleSnapshot(), notifyRoleListeners(), roleListeners (+28 more)

### Community 6 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, @base-ui/react, class-variance-authority, cn, lucide-react, next, next-intl, next-themes (+4 more)

### Community 8 - "Narrow Effect Dependencies"
Cohesion: 0.33
Nodes (6): Narrow Effect Dependencies, Calculate Derived State During Rendering, Subscribe to Derived State, Use Functional setState Updates, Put Interaction Logic in Event Handlers, Split Combined Hook Computations

### Community 9 - "Extract to Memoized Components"
Cohesion: 0.40
Nodes (5): Hoist Static JSX Elements, React Compiler, Extract to Memoized Components, Extract Default Non-primitive Parameter Value from Memoized Component to Constant, Do not wrap a simple expression with a primitive result type in useMemo

### Community 10 - "Cache Repeated Function Calls"
Cohesion: 0.50
Nodes (4): Version and Minimize localStorage Data, Cache Repeated Function Calls, Cache Property Access in Loops, Cache Storage API Calls

### Community 11 - "Genshu Agent Instructions"
Cohesion: 0.50
Nodes (4): Architectural Change Rules, Genshu Agent Instructions, Source of Truth Hierarchy, Worker and Reviewer Protocol

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

### Community 93 - "request.ts"
Cohesion: 0.50
Nodes (3): defaultLocale, Locale, locales

### Community 94 - "useData"
Cohesion: 0.10
Nodes (19): AssignmentDetailPage(), AssignmentsPage(), AttendancePage(), CohortDetailPage(), CohortsPage(), ExamDetailPage(), ExamsPage(), Home() (+11 more)

## Knowledge Gaps
- **206 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+201 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 230 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **75 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `assignments/[id]/page.tsx` to `package.json`, `app-header.tsx`, `data-context.tsx`, `table.tsx`, `useData`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `app-header.tsx` to `assignments/[id]/page.tsx`, `package.json`, `useData`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _206 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.04878048780487805 - nodes in this community are weakly interconnected._
- **Should `components.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._