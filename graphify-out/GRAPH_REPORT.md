# Graph Report - genshu  (2026-09-17)

## Corpus Check
- 129 files · ~69,503 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 250 nodes · 182 edges · 93 communities (17 shown, 75 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- class-variance-authority
- components.json
- package.json
- tsconfig.json
- next.config.ts
- dependencies
- devDependencies
- Genshu Project Instructions
- Narrow Effect Dependencies
- Hoist Static JSX Elements
- scripts
- Version and Minimize localStorage Data
- CSS content-visibility for Long Lists
- Prevent Hydration Mismatch Without Flickering
- Deduplicate Global Event Listeners
- Early Return from Functions
- Use React DOM Resource Hints
- Avoid Layout Thrashing
- Combine Multiple Array Iterations
- Build Index Maps for Repeated
- Authenticate Server Actions Like API
- Cross-Request LRU Caching
- Hoist Static I/O to Module
- eslint.config.mjs
- postcss.config.mjs
- shadcn/ui Logo
- Icons
- Styling and Customization
- React Best Practices
- React Best Practices Repository
- Do Not Put Effect Events
- Store Event Handlers in Refs
- Initialize App Once, Not Per
- useEffectEvent for Stable Callback Refs
- Prevent Waterfall Chains in API
- Check Cheap Conditions Before Async
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
- Use toSorted() Instead of sort()
- Use Activity Component for Show/Hide
- Use Explicit Conditional Rendering
- Use useRef for Transient Values
- Performance Rule Sections
- Use after() for Non-Blocking Operations
- Avoid Duplicate Serialization in RSC
- Parallel Data Fetching with Component
- Parallel Nested Data Fetching
- Minimize Serialization at RSC Boundaries
- Rule Template
- Vercel React Best Practices Skill
- Web Interface Guidelines
- Genshu Feature Implementation
- Genshu Implementation Review
- Class String Rewrites
- Consumer-side Prop Changes
- Disclosure and Toggle Mapping
- Display and Miscellaneous Mapping
- Form Controls Mapping
- Menu Family Mapping
- Overlay Mapping
- Radix UI to Base UI
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
- File Icon
- Globe Icon
- Next.js Logo
- Vercel Logo
- Window Icon
- Genshu README

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `tailwind` - 6 edges
3. `aliases` - 6 edges
4. `Genshu Executive MVP PRD` - 6 edges
5. `scripts` - 5 edges
6. `Genshu Project Instructions` - 5 edges
7. `cn` - 4 edges
8. `react` - 4 edges
9. `Narrow Effect Dependencies` - 4 edges
10. `lucide-react` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Genshu Project Instructions` --references--> `Genshu Architecture`  [EXTRACTED]
  AGENTS.md → docs/ARCHITECTURE.md
- `Genshu Project Instructions` --references--> `Genshu Decisions`  [EXTRACTED]
  AGENTS.md → docs/DECISIONS.md
- `Genshu Project Instructions` --references--> `Genshu UI/UX Topics`  [EXTRACTED]
  AGENTS.md → docs/UI-UX.md
- `Claude Project Reference` --references--> `Genshu Project Instructions`  [EXTRACTED]
  CLAUDE.md → AGENTS.md
- `Deduplicate Global Event Listeners` --semantically_similar_to--> `Use Passive Event Listeners for Scrolling Performance`  [INFERRED] [semantically similar]
  .agents/skills/vercel-react-best-practices/rules/client-event-listeners.md → .agents/skills/vercel-react-best-practices/rules/client-passive-event-listeners.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Caching Performance Patterns** — _agents_skills_vercel_react_best_practices_rules_js_cache_function_results_cache_repeated_function_calls, _agents_skills_vercel_react_best_practices_rules_js_cache_property_access_cache_property_access_in_loops, _agents_skills_vercel_react_best_practices_rules_js_cache_storage_cache_storage_api_calls [INFERRED 0.85]
- **Array Iteration Optimization Patterns** — _agents_skills_vercel_react_best_practices_rules_js_combine_iterations_combine_multiple_array_iterations, _agents_skills_vercel_react_best_practices_rules_js_flatmap_filter_use_flatmap_to_map_and_filter_in_one_pass, _agents_skills_vercel_react_best_practices_rules_js_min_max_loop_use_loop_for_min_max_instead_of_sort [INFERRED 0.85]
- **React Concurrent Rendering Responsiveness** — agents_skills_vercel_react_best_practices_rules_rendering_usetransition_loading_use_transition_loading, agents_skills_vercel_react_best_practices_rules_rerender_transitions_transitions_for_non_urgent_updates, agents_skills_vercel_react_best_practices_rules_rerender_use_deferred_value_use_deferred_value [INFERRED 0.85]
- **Derived Dependency Minimization** — agents_skills_vercel_react_best_practices_rules_rerender_dependencies_narrow_effect_dependencies, agents_skills_vercel_react_best_practices_rules_rerender_derived_state_no_effect_calculate_derived_state, agents_skills_vercel_react_best_practices_rules_rerender_derived_state_subscribe_to_derived_state, agents_skills_vercel_react_best_practices_rules_rerender_split_combined_hooks_split_hook_computations [INFERRED 0.85]

## Communities (93 total, 75 thin omitted)

### Community 0 - "class-variance-authority"
Cohesion: 0.11
Nodes (9): class-variance-authority, cn, lucide-react, Button(), buttonVariants, DropdownMenu(), DropdownMenuContent(), DropdownMenuItem() (+1 more)

### Community 1 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 2 - "package.json"
Cohesion: 0.10
Nodes (19): ignoreScripts, name, packageManager, private, trustedDependencies, version, babel-plugin-react-compiler, @base-ui/react (+11 more)

### Community 3 - "tsconfig.json"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "next.config.ts"
Cohesion: 0.17
Nodes (9): nextConfig, next, next-themes, react, geistMono, geistSans, inter, metadata (+1 more)

### Community 5 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, @base-ui/react, class-variance-authority, cn, lucide-react, next, next-themes, react (+3 more)

### Community 6 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+2 more)

### Community 7 - "Genshu Project Instructions"
Cohesion: 0.36
Nodes (8): Genshu Project Instructions, Claude Project Reference, Genshu Architecture, Genshu Decisions, Optional Furigana, Genshu Executive MVP PRD, Server-Side Authorization, Genshu UI/UX Topics

### Community 8 - "Narrow Effect Dependencies"
Cohesion: 0.33
Nodes (6): Narrow Effect Dependencies, Calculate Derived State During Rendering, Subscribe to Derived State, Use Functional setState Updates, Put Interaction Logic in Event Handlers, Split Combined Hook Computations

### Community 9 - "Hoist Static JSX Elements"
Cohesion: 0.40
Nodes (5): Hoist Static JSX Elements, React Compiler, Extract to Memoized Components, Extract Default Non-primitive Parameter Value from Memoized Component to Constant, Do not wrap a simple expression with a primitive result type in useMemo

### Community 10 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 11 - "Version and Minimize localStorage Data"
Cohesion: 0.50
Nodes (4): Version and Minimize localStorage Data, Cache Repeated Function Calls, Cache Property Access in Loops, Cache Storage API Calls

### Community 12 - "CSS content-visibility for Long Lists"
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

## Knowledge Gaps
- **183 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+178 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 203 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **75 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `next` connect `next.config.ts` to `package.json`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _183 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `class-variance-authority` be split into smaller, more focused modules?**
  _Cohesion score 0.10666666666666667 - nodes in this community are weakly interconnected._
- **Should `components.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._