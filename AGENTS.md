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


# Genshu Agent Instructions

This repository uses a shared AI Development Playbook.

Do not rely on previous chat history or model memory to understand the project.

Important project knowledge and operating rules live in the repository.

---

## Before Making Changes

For any meaningful development task:

1. Read `.ai/PROJECT.md`.
2. Read `.ai/README.md`.
3. If `.ai/policies/` exists, identify and read only policies relevant to the task.
4. Identify and load any relevant Agent Skill under `.agents/skills/`.
5. Read only the feature documentation, source files, and tests relevant to the task.
6. Inspect the existing implementation before proposing structural changes.

Use progressive context loading.

Do not load the entire repository unless the task genuinely requires it.

---

## Source of Truth

Project-level truth lives in:

```text
.ai/PROJECT.md
```

AI development conventions and playbook structure live in:

```text
.ai/README.md
```

Persistent AI operating rules, when present, live in:

```text
.ai/policies/
```

Reusable task procedures live in:

```text
.agents/skills/
```

Detailed product and technical documentation, when present, lives in:

```text
docs/
```

Do not duplicate these sources inside this file.

---

## Default Behavior

Work conservatively by default.

Prefer:

```text
existing architecture
over replacement architecture

existing dependencies
over new dependencies

small coherent changes
over broad refactors

explicit solutions
over speculative abstractions

current requirements
over hypothetical future scale
```

Do not introduce architectural changes as incidental parts of unrelated tasks.

---

## Do Not Invent Requirements

If a requirement is unclear:

1. check `.ai/PROJECT.md`,
2. check relevant documentation,
3. inspect the existing implementation,
4. inspect related tests.

If the answer is still undefined, do not silently invent a complex product or architectural decision.

Prefer the smallest reversible implementation consistent with known requirements.

Surface meaningful ambiguity when it affects project behavior or architecture.

---

## Architectural Changes

Treat changes such as the following as architectural decisions:

- changing the database platform,
- introducing or replacing an ORM,
- changing authentication architecture,
- adding another backend application,
- introducing major infrastructure,
- restructuring the repository,
- changing the fundamental domain model,
- changing the role or permission model,
- replacing major framework conventions,
- or adding a major dependency that changes how the application is built.

Do not perform these silently.

Follow the relevant project policy and explain the justification when such a change is actually required.

---

## Dependencies

Do not add a dependency merely because it makes an implementation familiar or convenient.

Before adding one, determine whether the existing stack can reasonably solve the problem.

New dependencies should reduce total project complexity.

Follow the relevant dependency policy when present.

---

## Verification

Do not treat AI confidence as verification.

Use deterministic checks where appropriate, such as:

```text
typecheck
lint
tests
build
migration validation
browser verification
```

Verification should be proportional to the change.

Do not claim a check passed unless it was actually executed successfully.

---

## Documentation

Update documentation when a change makes existing documentation incorrect.

Do not create duplicate sources of truth.

Permanent knowledge should be placed according to its purpose:

```text
project-level truth
    → .ai/PROJECT.md

persistent AI rule
    → .ai/policies/

reusable procedure
    → .agents/skills/

detailed feature or technical information
    → docs/

deterministic automation
    → .ai/scripts/ or skill-local scripts

temporary execution output
    → .ai/runs/
```

---

## Worker Behavior

When acting as an implementation Worker:

- understand the requested outcome,
- inspect relevant context,
- make the smallest coherent change,
- preserve established architecture,
- verify the result,
- and report what actually changed.

If `.ai/policies/worker.md` exists, follow it.

---

## Reviewer Behavior

When acting as a Reviewer:

- prefer read-only inspection,
- evaluate the actual implementation,
- inspect available verification evidence,
- look for regressions and requirement mismatches,
- and do not approve work solely because the Worker says it succeeded.

If `.ai/policies/reviewer.md` exists, follow it.

---

## Completion Report

After meaningful implementation work, report at minimum:

```text
Summary
Files changed
Behavior changed
Verification performed
Known limitations
```

Include when relevant:

```text
Database changes
New dependencies
Architecture impact
Documentation changes
Follow-up work
```

Keep the report factual and compact.

---

## Core Rule

> Do not rely on AI memory.

If knowledge is important for future development, put it in the repository.

The model may change.

The project rules should remain.
