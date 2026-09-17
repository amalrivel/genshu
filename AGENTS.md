<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Genshu Project Instructions

Genshu is a small LMS for learning Japanese gentsuki license material.

## Core Engineering Philosophy

Prefer the simplest implementation that correctly solves the current problem.

Optimize for:

1. clarity
2. maintainability
3. user experience
4. correctness
5. performance when it materially matters

Do not optimize for architectural sophistication.

## Dependency Rules

Before adding a new dependency:

1. Check whether Next.js, React, the platform, or existing dependencies already solve the problem.
2. Explain what problem the dependency solves.
3. Prefer small, established dependencies.
4. Do not introduce infrastructure for hypothetical future requirements.

Do not add dependencies merely to avoid writing a small amount of straightforward code.

## Architecture Rules

- Use Next.js App Router.
- Prefer Server Components by default.
- Use Client Components only when browser state, effects, or interactions require them.
- Keep domain logic separate from presentation when doing so improves clarity.
- Do not introduce abstraction layers before they are needed.
- Do not create generic utilities for one-off behavior.
- Do not introduce global state management without a concrete requirement.
- Avoid premature optimization.

## Scope Discipline

Implement only the requested feature and directly necessary supporting changes.

Do not perform unrelated refactors.

If you discover unrelated problems, report them instead of silently expanding scope.

## UI/UX

Genshu must work comfortably on both desktop and mobile.

Prioritize:

- clear hierarchy
- readable Japanese text
- predictable navigation
- obvious actions
- useful empty/error/loading states
- accessible controls
- touch-friendly interactions

Do not generate generic dashboard UI simply because it is easy.

shadcn components may be modified when doing so creates a better product experience.

## Agent Workflow

Before implementation:

1. Read the relevant project documentation.
2. Inspect the existing implementation.
3. Identify the smallest coherent change.
4. Check relevant Next.js documentation from the installed package.

During implementation:

- keep changes focused
- reuse existing patterns
- avoid unnecessary dependencies
- avoid unrelated cleanup

After implementation:

1. run the relevant validation
2. review the diff
3. report what changed
4. report files changed
5. report validation performed
6. report remaining risks or unresolved issues

Never claim that something was tested if it was not actually tested.

## Project Sources of Truth

Before making significant changes, consult the relevant project documents:

- `docs/PRD.md` — product requirements, MVP scope, acceptance criteria, and out-of-scope features
- `docs/ARCHITECTURE.md` — approved technical architecture and boundaries
- `docs/UI-UX.md` — interface and interaction principles
- `docs/DECISIONS.md` — significant project decisions and their rationale

When documents conflict:

1. Do not silently choose one.
2. Identify the conflict.
3. Prefer the document responsible for that concern.
4. Ask for or record a decision when necessary.

Do not reinterpret the PRD to justify additional features.