---
name: genshu-implement
description: Implement a scoped Genshu feature while preserving project architecture, UX rules, and dependency discipline.
---

# Genshu Feature Implementation

Use this workflow when implementing or modifying a Genshu feature.

## 1. Understand

Read:

- `AGENTS.md`
- `docs/PRD.md` for relevant product requirements
- `docs/ARCHITECTURE.md` for technical constraints
- `docs/UI-UX.md` when the task affects user interaction
- `docs/DECISIONS.md` for relevant prior decisions
- relevant existing source files

Do not begin editing before understanding the current implementation.

## 2. Define Scope

Identify:

- requested behavior
- files likely affected
- constraints
- smallest coherent implementation

Avoid unrelated refactoring.

## 3. Verify Framework Behavior

For Next.js-specific behavior, consult the version-matched documentation under:

node_modules/next/dist/docs/

Do not rely only on remembered Next.js behavior.

## 4. Implement

Prefer:

- existing project patterns
- platform APIs
- React/Next.js capabilities
- existing dependencies

Avoid introducing new dependencies unless clearly justified.

## 5. Validate

Run the smallest useful validation set available, such as:

- lint
- typecheck
- relevant tests
- build when appropriate

Fix regressions caused by the change.

## 6. Self Review

Inspect the final diff for:

- unintended changes
- duplicated logic
- unnecessary abstraction
- unnecessary client components
- poor UX states
- inaccessible interaction
- new dependencies

## 7. Report

Return:

### Summary
What was implemented.

### Files changed
Important files and why.

### Validation
Commands actually executed and their results.

### Decisions
Important implementation choices.

### Remaining concerns
Anything not verified or deliberately deferred.