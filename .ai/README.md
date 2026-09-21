# Genshu AI Development Playbook

The `.ai/` directory contains the shared operating system for AI-assisted development in Genshu.

Its purpose is to make AI-assisted work:

- repeatable,
- project-aware,
- verifiable,
- conservative by default,
- less dependent on long prompts,
- and less dependent on model memory.

The playbook is not tied to one AI provider.

It should remain usable across Codex, Claude, Gemini, and future coding agents.

> The model may change.  
> The project rules should not.

---

## 1. Core Principle

Do not rely on an AI agent remembering previous conversations.

If something is important to Genshu, put it in the repository.

Chat history may provide temporary context, but it must not become the only place where important project knowledge exists.

Important knowledge should eventually live in the appropriate repository location:

```text
.ai/PROJECT.md
.ai/policies/
.agents/skills/
docs/
source code
tests
```

The repository is the persistent memory of the project.

---

## 2. Responsibility Boundaries

Genshu separates:

- project truth,
- operating policy,
- reusable agent procedures,
- deterministic automation,
- detailed documentation,
- and temporary execution records.

Each has a different purpose.

### `.ai/PROJECT.md`

Answers:

> What is Genshu, and what are the current project truths?

It contains stable project-level information such as:

- product identity,
- users and roles,
- current MVP scope,
- technical direction,
- architectural boundaries,
- product principles,
- explicit non-goals,
- and open decisions.

AI agents should treat `.ai/PROJECT.md` as the primary project-level source of truth.

It should not become a detailed specification for every individual feature.

---

### `.ai/policies/`

Answers:

> What persistent rules govern AI-assisted development?

Policies may define:

- Worker boundaries,
- Reviewer behavior,
- dependency discipline,
- architectural-change rules,
- verification requirements,
- security expectations,
- or other persistent operating constraints.

Policies should apply across multiple tasks.

They should not describe one specific feature implementation.

---

### `.agents/skills/`

Answers:

> How should this kind of task normally be performed?

This is the repository location for reusable Agent Skills.

A skill may contain:

```text
skill-name/
├── SKILL.md
├── scripts/
├── references/
└── assets/
```

Skills should be task-oriented and loaded only when relevant.

Examples may include:

- implementing a feature,
- fixing a bug,
- database changes,
- UI/UX review,
- browser testing,
- accessibility review,
- security review,
- or other reusable workflows.

Project-specific skills may live here alongside selected external skills.

Do not duplicate Agent Skills under `.ai/skills/`.

---

### `.ai/scripts/`

Contains deterministic automation used by AI-assisted development.

Examples may include:

- linting,
- type checking,
- tests,
- build verification,
- migration checks,
- repository-state checks,
- diff inspection,
- environment validation,
- and orchestration helpers.

Prefer deterministic verification whenever code can answer a question more reliably than an LLM.

> Use AI for reasoning.  
> Use deterministic tools for verification.

---

### `.ai/runs/`

May contain temporary records produced by future orchestration workflows.

Examples:

- task metadata,
- Worker reports,
- Reviewer reports,
- verification results,
- iteration records,
- and final execution summaries.

`runs/` exists for traceability.

It is not a source of permanent project truth.

Future agents should not need to inspect historical run records to understand how Genshu currently works.

If something discovered during a run becomes important permanently, move that knowledge into the appropriate persistent location.

---

### `/docs/`

Contains detailed product and technical documentation.

Examples:

- PRDs,
- feature specifications,
- architecture notes,
- data-model documentation,
- UX specifications,
- research,
- and implementation notes.

Detailed documentation may be more specific than `.ai/PROJECT.md`, but it must not silently contradict it.

---

### `/AGENTS.md`

`AGENTS.md` is the thin repository entry point for coding agents.

It should tell an agent where to begin rather than duplicate the playbook.

Conceptually:

```text
AGENTS.md
    ↓
.ai/PROJECT.md
    ↓
relevant .ai/policies/
    ↓
relevant .agents/skills/
    ↓
relevant /docs/
    ↓
existing code + tests
```

Vendor-specific files should remain thin adapters whenever possible.

---

## 3. Intended Repository Structure

```text
genshu/
│
├── AGENTS.md
│
├── .agents/
│   └── skills/
│       └── ...
│
├── .ai/
│   ├── README.md
│   ├── PROJECT.md
│   │
│   ├── policies/
│   │   └── ...
│   │
│   ├── scripts/
│   │   └── ...
│   │
│   └── runs/
│       └── ...
│
├── docs/
│   └── ...
│
└── ...
```

Not every file or directory needs content immediately.

The playbook should grow only when repeated workflows justify additional documentation or automation.

Do not create AI infrastructure merely to make the repository look complete.

---

## 4. AI Instruction Hierarchy

When an AI agent works on Genshu, operating guidance should normally be interpreted in this order:

```text
1. Explicit current task
2. .ai/PROJECT.md
3. Relevant .ai/policies/
4. Relevant .agents/skills/
5. Approved feature specification or PRD
6. Other current documentation
7. Existing implementation
8. Tests
9. Git history
```

Higher-level sources define intent and boundaries.

Lower-level sources provide implementation context and evidence.

An explicit task does not automatically authorize breaking established architecture or persistent policies.

If two sources conflict, surface the conflict rather than silently inventing a resolution.

---

## 5. Progressive Context Loading

Use progressive disclosure.

Do not load every document, policy, skill, and source file for every task.

A typical task should inspect only the context required to understand and verify the requested change.

For example:

```text
current task
    ↓
.ai/PROJECT.md
    ↓
relevant policy
    ↓
relevant Agent Skill
    ↓
relevant documentation
    ↓
affected code
    ↓
affected tests
```

The goal is neither:

```text
read almost nothing
```

nor:

```text
load the entire repository into context
```

The goal is targeted understanding.

---

## 6. Default Development Loop

The default AI-assisted development loop is:

```text
Understand
    ↓
Inspect
    ↓
Plan
    ↓
Implement
    ↓
Verify
    ↓
Review
    ↓
Report
```

### Understand

Determine the actual requested outcome.

Distinguish requirements from assumptions.

### Inspect

Read the relevant project truth, policy, documentation, implementation, and tests.

Do not propose a replacement architecture before understanding the current one.

### Plan

Identify the smallest coherent change that satisfies the task.

Avoid unrelated refactors.

### Implement

Make the required change while respecting existing boundaries.

### Verify

Use deterministic evidence where practical.

Examples:

```text
typecheck
lint
tests
build
migration validation
browser verification
```

Not every task requires every check.

Verification should be proportional to the change.

### Review

Evaluate:

- correctness,
- task adherence,
- regressions,
- architecture,
- security,
- UX,
- accessibility where relevant,
- and verification quality.

### Report

Describe what actually changed and what was actually verified.

---

## 7. Conservative by Default

AI agents should modify the smallest reasonable surface.

Prefer:

```text
existing architecture
over architectural replacement

existing dependency
over new dependency

local change
over broad refactor

explicit implementation
over speculative abstraction

current requirement
over hypothetical future requirements
```

Refactoring is allowed when it materially improves the requested implementation.

Refactoring is not permission to redesign unrelated parts of the application.

---

## 8. Do Not Invent Requirements

When a requirement is unclear, first inspect:

```text
.ai/PROJECT.md
relevant /docs/
existing implementation
tests
```

If the project still does not define the answer, prefer a small and reversible implementation.

Do not turn an undefined product decision into permanent architecture merely because an AI agent needs an answer.

Unresolved project questions should remain explicit.

---

## 9. Worker and Reviewer

Genshu may use separate AI roles.

### Worker

The Worker performs implementation.

It may:

- inspect project context,
- modify code,
- run verification,
- update relevant documentation,
- and report completed work.

Detailed Worker rules belong in:

```text
.ai/policies/worker.md
```

---

### Reviewer

The Reviewer evaluates completed work.

The Reviewer should normally operate in read-only mode.

It should evaluate the actual implementation and evidence rather than trust the Worker's summary.

Detailed Reviewer rules belong in:

```text
.ai/policies/reviewer.md
```

Worker/Reviewer orchestration should be automated only after the workflow is understood well enough to automate safely.

---

## 10. Verification Principle

An AI statement such as:

> The implementation looks correct.

is weak evidence.

Where practical, prefer evidence such as:

```text
typecheck passed
lint passed
tests passed
build passed
migration validation passed
browser flow verified
```

Verification should match the risk and scope of the change.

Do not run expensive or irrelevant checks merely as ceremony.

Do not declare meaningful work complete without reasonable evidence.

---

## 11. Completion Reporting

After meaningful implementation work, the Worker should provide a compact structured report.

At minimum:

```text
Summary
Files changed
Behavior changed
Verification performed
Known limitations
```

Where relevant, include:

```text
Database changes
New dependencies
Architecture impact
Documentation changes
Follow-up work
```

The report should describe completed work rather than repeat the original task.

---

## 12. Permanent Knowledge vs Temporary Output

When useful information is discovered during a task, classify it correctly.

```text
Project-level truth
    → .ai/PROJECT.md

Persistent AI operating rule
    → .ai/policies/

Reusable task procedure
    → .agents/skills/

Deterministic repeated operation
    → .ai/scripts/
      or a skill-local script

Detailed feature or technical documentation
    → /docs/

Temporary execution result
    → .ai/runs/
```

Do not keep important permanent knowledge only inside:

- chat history,
- Worker reports,
- Reviewer reports,
- or old run logs.

---

## 13. Dependency Discipline

Dependencies are not free.

A dependency adds:

- maintenance,
- upgrade risk,
- security surface,
- additional APIs,
- and cognitive load.

Before adding one, determine whether the current stack can reasonably solve the problem.

A dependency should reduce total project complexity rather than merely move complexity into another package.

Detailed dependency rules may live in:

```text
.ai/policies/dependencies.md
```

---

## 14. Architectural Changes

AI agents must distinguish normal implementation work from architectural decisions.

Examples of architectural changes include:

- changing the database platform,
- introducing or replacing an ORM,
- replacing authentication architecture,
- introducing a major state-management system,
- adding another backend application,
- restructuring the repository,
- changing the fundamental domain model,
- adding major infrastructure,
- or replacing major framework conventions.

Do not perform architectural changes incidentally during unrelated work.

Architectural changes require explicit justification.

---

## 15. Documentation Maintenance

Documentation should describe the current project.

When behavior or architecture changes enough to make documentation wrong, update the relevant documentation as part of the task.

Do not maintain multiple contradictory active instructions.

Do not document obvious implementation details merely to repeat the source code.

Document information that future developers or agents genuinely need.

---

## 16. External Agent Skills

External Agent Skills may be added to `.agents/skills/` when they provide real value.

Treat external skills like dependencies.

Before adopting one:

- inspect `SKILL.md`,
- inspect bundled scripts,
- understand what commands it may execute,
- check for overlap with existing skills,
- and verify that it fits Genshu's development principles.

Do not assume a public skill is safe or appropriate simply because it exists.

Prefer a small set of useful skills over a large collection with overlapping responsibilities.

---

## 17. Playbook Maintenance

The AI Playbook should evolve from actual development experience.

When the same failure repeatedly occurs, consider adding a policy.

When the same development procedure repeatedly occurs, consider creating a skill.

When AI repeatedly performs a deterministic operation, consider turning it into a script.

A useful progression is:

```text
one-time instruction
        ↓
repeated pattern
        ↓
policy or Agent Skill
        ↓
deterministic automation where practical
```

Do not automate a process before understanding it.

Do not turn every one-off correction into permanent policy.

---

## 18. Vendor Independence

The Genshu AI Development Playbook must not depend on one model vendor as its primary source of truth.

Vendor-specific adapters may exist, for example:

```text
AGENTS.md
CLAUDE.md
Gemini-specific configuration
Codex-specific configuration
```

They should point toward shared repository knowledge rather than duplicate it.

Conceptually:

```text
                  .ai/PROJECT.md
                        │
                 shared playbook
                        │
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
        Codex         Claude        Gemini
```

Models and tools may change.

The repository-level knowledge should remain usable.

---

## 19. What This Playbook Is Not

The `.ai/` directory is not:

- a replacement for source code,
- a replacement for tests,
- a second PRD,
- a dump of previous conversations,
- a prompt archive,
- a duplicate Agent Skills directory,
- or a collection of arbitrary AI tips.

Every file should have an operational purpose.

If a file no longer helps development become more reliable or understandable, simplify or remove it.

---

## 20. Guiding Principles

```text
repository knowledge
over chat memory

repeatable procedure
over improvised prompting

deterministic verification
over AI confidence

progressive disclosure
over giant repeated prompts

shared playbook
over vendor-specific duplication

explicit rules
over assumed behavior

simple workflows
over unnecessary orchestration

real project needs
over AI infrastructure for its own sake
```

The AI Playbook should make Genshu development simpler.

If maintaining the playbook becomes more complicated than developing Genshu itself, the playbook has become overengineered.