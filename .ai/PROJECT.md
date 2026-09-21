# Genshu — Project Source of Truth

**Status:** Active  
**Version:** 0.3  
**Last updated:** September 2026

---

## 1. Purpose

`.ai/PROJECT.md` is the canonical project-level source of truth for Genshu.

It defines:

- what Genshu is,
- who it is for,
- the current product scope,
- the current technical direction,
- architectural boundaries,
- product and engineering principles,
- explicit non-goals,
- and important open decisions.

This file is intentionally different from a PRD.

A PRD or feature specification may describe one workflow in greater detail.

`PROJECT.md` defines project-level truths that should remain stable across features.

If this file, implementation, and detailed documentation disagree, do not silently choose one interpretation.

Treat the mismatch as project drift and reconcile it before making unrelated architectural changes.

---

## 2. Product Identity

Genshu is an end-to-end learning management system designed initially for Indonesian students participating in Japanese scholarship learning programs.

Its long-term purpose is to support the learning workflow between:

- students,
- teachers,
- and program coordinators.

Genshu may eventually cover:

- preparation,
- learning content,
- attendance,
- assignments,
- assessment,
- progress monitoring,
- academic administration,
- communication,
- schedules,
- and other learning-management workflows.

The initial product must remain significantly smaller than that long-term vision.

Genshu is not intended to become a generic public LMS in the near term.

---

## 3. Primary Users

Genshu currently models three primary roles.

### 3.1 Gakusei — 学生

Students participating in the learning program.

Primary responsibilities:

- access assigned learning content,
- complete practice activities,
- complete assignments,
- take exams,
- view their own results and progress,
- and participate in attendance workflows.

Internal role identifier:

```text
GAKUSEI
```

---

### 3.2 Sensei — 先生

Teachers responsible for the learning process.

Primary responsibilities:

- create and manage learning content,
- create practice activities,
- create assignments,
- create exams,
- evaluate student work where required,
- monitor student learning progress,
- manage learning workflows,
- and assist with basic student access where appropriate.

Internal role identifier:

```text
SENSEI
```

---

### 3.3 Tantōsha — 担当者

Program coordinators or responsible staff from Japan or Indonesia.

Their primary purpose is operational oversight rather than teaching.

Primary responsibilities:

- manage participant access,
- help manage accounts,
- organize students,
- monitor attendance,
- monitor learning progress and results,
- and support program administration.

Tantōsha should not normally create learning content.

If new teaching content is required, the normal workflow should involve a Sensei.

Internal role identifier:

```text
TANTOSHA
```

---

## 4. Long-Term Product Vision

Genshu may eventually support:

- courses,
- learning materials,
- lessons,
- attendance,
- assignments,
- practice activities,
- examinations,
- grades,
- progress tracking,
- announcements,
- schedules,
- student monitoring,
- administrative workflows,
- and other learning-management capabilities.

This is a product vision.

It is not the current implementation scope.

AI agents must never interpret long-term vision as permission to implement future systems prematurely.

---

## 5. Current MVP

The first usable MVP focuses on four primary learning functions:

1. Attendance
2. Practice
3. Assignments
4. Exams

Supporting functionality may be implemented when required for these workflows.

The goal of the MVP is not maximum feature coverage.

The goal is to provide a small set of genuinely usable workflows with good UX.

---

### 5.1 Attendance

The system should allow relevant users to record and review student attendance.

The first version should remain simple.

Do not build without a concrete requirement:

- complex scheduling engines,
- automatic timetable generation,
- external calendar synchronization,
- biometric attendance,
- location-based attendance,
- or advanced attendance infrastructure.

---

### 5.2 Practice

Sensei can create practice activities for students.

Practice should support:

- Japanese questions,
- answer submission,
- scoring,
- explanations,
- review of incorrect answers,
- question navigation,
- progress through a question set,
- and user-controlled furigana where appropriate.

Practice exists primarily for learning.

Students should be able to review answers and explanations after completing or submitting practice according to the practice configuration.

---

### 5.3 Assignments

Sensei can create assignments and assign them to students.

The first implementation should prioritize:

- clear instructions,
- clear deadlines where applicable,
- submission,
- submission status,
- evaluation or completion status,
- and a straightforward student experience.

Avoid advanced assignment workflows until actual requirements exist.

---

### 5.4 Exams

The system should support exam-style assessments.

Formal exams and exam simulations must use Japanese as the assessment language.

Exam behavior should prioritize:

- clear navigation,
- reliable answer persistence,
- explicit submission,
- server-side result calculation where relevant,
- clear completion states,
- and protection against accidental submission.

Exam functionality should resemble the intended real-world assessment experience where appropriate.

---

## 6. Language Rules

### Application Interface

The application interface should support:

- Japanese,
- Indonesian.

Users should be able to switch between them where appropriate.

Avoid unnecessarily mixing both languages inside the same UI element when a clean translated interface can be provided.

---

### Learning Content

Japanese is the primary learning language.

Indonesian may be used for:

- translations,
- explanations,
- supporting instructions,
- learning assistance,
- and other appropriate supporting content.

---

### Assignments and Exams

Formal assignments and exams should use Japanese.

Supporting Indonesian text may exist outside the actual assessment content where appropriate.

---

### Furigana

Japanese learning content should support optional furigana where useful.

Furigana should normally be user-controlled.

Exam behavior may restrict furigana when required to reproduce intended examination conditions.

Do not assume furigana is always available during formal assessment.

---

## 7. Product Structure

The initial domain should remain simple while leaving room for justified future growth.

Preferred conceptual hierarchy:

```text
Program / Cohort
    ├── Users
    │   ├── Gakusei
    │   ├── Sensei
    │   └── Tantōsha
    │
    └── Course
        └── Topic
            ├── Material
            ├── Practice
            └── Assignment
```

Exams and attendance may belong at the Course, class, cohort, or program level depending on the actual workflow.

Do not create additional hierarchy without a concrete product requirement.

Exact class and cohort modeling remains an open decision.

---

## 8. Account Management

Genshu does not require public self-registration for the initial MVP.

Accounts are managed by authorized program users.

Both:

```text
SENSEI
TANTOSHA
```

may participate in basic account management where permitted.

This may include:

- creating or inviting users,
- helping users regain access,
- managing participation,
- and associating students with the appropriate learning context.

Do not create a complex organization or enterprise IAM system for the MVP.

Fine-grained account and role management may be introduced later when actual requirements justify it.

---

## 9. Technical Direction

### Runtime and Package Manager

Use:

```text
Bun
```

Bun is the default package manager and development tooling for this project.

Do not introduce npm, pnpm, or Yarn workflows unless a concrete compatibility issue requires it.

---

### Application Framework

Current application direction:

```text
Next.js
TypeScript
```

Genshu should remain a single full-stack Next.js application unless an explicit architectural decision changes this.

Do not split Genshu into separate frontend and backend applications without a concrete requirement.

Prefer native Next.js capabilities before introducing additional backend frameworks.

Appropriate server-side mechanisms include:

- Server Components,
- Server Actions,
- Route Handlers,
- and other standard Next.js server capabilities.

Do not introduce Express, NestJS, or another standalone backend framework without an explicit architectural reason.

---

### UI

Preferred UI stack:

```text
Tailwind CSS
shadcn/ui
```

Existing components should be reused before installing another UI framework.

shadcn/ui components may be modified when required to create a better product experience.

The goal is not to preserve library defaults.

The goal is to build a coherent Genshu interface.

---

## 10. Data Platform

Genshu's planned persistent database is PostgreSQL.

The current frontend prototype intentionally uses mock data and browser
`localStorage`. No persistent backend is implemented yet.

When backend work begins, development should start with a local PostgreSQL
workflow. Supabase is not part of the current architecture.

---

### Local Development

Development should remain local-first.

Preferred development environment:

```text
Local PostgreSQL
```

Development should not depend on manually editing a hosted production
environment.

Database schema changes must be reproducible from repository-controlled migrations.

Do not treat manually configured remote database state as the source of truth.

---

### Database Access Layer

The access layer is undecided until persistent backend work begins.

Do not introduce an ORM or backend framework without a concrete requirement.
Choosing the database access layer is an architectural decision.

---

## 11. Authentication

Authentication is not implemented and its provider is undecided.

Authentication implementation must support the role model required by Genshu.

Authorization is a separate concern from authentication.

Role and permission checks must be enforced server-side.

Do not assume that hiding UI controls is sufficient authorization.

The exact invitation and account-recovery workflows may evolve during MVP implementation.

---

## 12. File Storage

Persistent file storage is not implemented and its provider is undecided.

Examples may include:

- question illustrations,
- assignment attachments,
- learning materials,
- and other uploaded educational assets.

Do not introduce separate object-storage infrastructure unless actual requirements justify it.

---

## 13. Deployment Direction

Production deployment is undecided. Do not select a hosting platform for the
backend before the local PostgreSQL workflow and application requirements are
defined.

The exact production pricing tier remains an operational decision rather than a project architecture rule.

Optimize primarily for:

```text
low operational complexity
+
low cost
+
good developer experience
+
reasonable portability
```

Do not introduce:

- AWS,
- GCP,
- Kubernetes,
- microservices,
- additional cloud services,
- or complex deployment infrastructure

merely for perceived scalability or professionalism.

Infrastructure should become more sophisticated only when actual requirements justify the complexity.

---

## 14. Architecture Principle

Default rule:

> Prefer the simplest solution that correctly solves the current requirement.

Do not build infrastructure for hypothetical scale.

The initial user base is small.

Optimize primarily for:

- maintainability,
- clarity,
- reliability,
- development speed,
- low operating cost,
- and good user experience.

---

## 15. Anti-Overengineering Rules

Prefer simple solutions over generalized systems.

Do not introduce the following without a concrete requirement:

- additional application frameworks,
- unnecessary state-management libraries,
- microservices,
- queues,
- event buses,
- complex caching infrastructure,
- generalized plugin systems,
- unnecessary repositories,
- premature abstraction layers,
- complex design patterns,
- infrastructure intended for hypothetical large scale,
- or large dependency chains.

Reuse the existing stack first.

Adding a new dependency requires clear justification.

Before adding a library, ask:

1. Can the existing stack reasonably solve this?
2. Is the requirement complex enough to justify another dependency?
3. Does the dependency reduce total complexity rather than move it elsewhere?
4. Will another maintainer understand why it exists?

If the answer is unclear, do not add it.

---

## 16. UX Principles

A technically complete feature is not necessarily a finished Genshu feature.

User experience is part of the product requirement.

The interface should prioritize:

- clarity,
- low cognitive load,
- obvious next actions,
- responsive behavior,
- fast scanning,
- accessible interactions,
- mobile usability,
- and predictable navigation.

The MVP should contain fewer features implemented well rather than many features implemented poorly.

Do not optimize primarily for visual novelty.

Do not blindly preserve default shadcn/ui layouts if they create awkward workflows.

UI decisions should support the task the user is trying to complete.

---

## 17. Mobile and Desktop

Genshu must work comfortably on:

- smartphones,
- desktop browsers.

Student workflows are especially likely to occur on mobile devices.

Administrative and authoring workflows may use denser desktop layouts where appropriate.

Responsive design is a product requirement, not optional polish.

---

## 18. Data Ownership

Persistent learning data must be stored server-side.

Examples include:

- attendance,
- assignment submissions,
- exam attempts,
- practice attempts where history is required,
- scores,
- and user progress.

Browser storage may be used for temporary interface state or drafts.

For example:

```text
Temporary unfinished answer state
    → browser storage where appropriate

Submitted attempt / official result
    → PostgreSQL
```

Important learning history must not depend solely on one browser or device.

---

## 19. Security and Permissions

Authorization must be enforced server-side.

Hiding a button in the UI is not authorization.

A user must not be able to gain additional privileges by manually calling:

- a route,
- a Server Action,
- an API endpoint,
- or another server-side interface.

Role-sensitive operations must validate the authenticated user and their permissions on the server.

Particular care is required for:

- account management,
- student data,
- grades,
- submissions,
- exams,
- attendance,
- and learning-content modification.

---

## 20. Definition of Done

A feature is not done merely because it renders successfully.

Where applicable, a feature is complete when:

- required behavior works,
- expected role permissions work,
- server-side authorization exists,
- loading states exist,
- empty states exist,
- error states are understandable,
- validation exists,
- important data persists correctly,
- mobile layout works,
- desktop layout works,
- relevant accessibility behavior works,
- TypeScript passes,
- linting passes,
- relevant tests pass,
- and the UX is coherent from start to finish.

Do not add tests for trivial implementation details solely to increase test count.

Prefer tests that protect meaningful behavior.

---

## 21. Architectural Changes

The following should be treated as architectural decisions:

- changing the database platform,
- introducing or replacing an ORM,
- changing authentication architecture,
- adding major dependencies,
- restructuring the repository,
- introducing another backend,
- changing the fundamental domain model,
- changing role or permission architecture,
- introducing new infrastructure,
- or replacing major framework conventions.

AI agents must not perform these changes silently.

A proposal should explain:

- the existing problem,
- why the current architecture cannot reasonably solve it,
- the proposed change,
- alternatives considered,
- migration impact,
- and new complexity introduced.

Detailed behavioral rules for AI Workers and Reviewers belong in `.ai/policies/`.

---

## 22. Documentation Rules

Documentation should describe the current project rather than accumulate obsolete architecture.

When an important project decision changes:

1. update `.ai/PROJECT.md` when project-level truth changes,
2. update affected detailed documentation,
3. remove obsolete active instructions where safe,
4. avoid keeping contradictory setup paths.

Historical information belongs in Git history or an explicit decision record rather than active setup instructions.

Detailed product or technical documentation belongs under:

```text
/docs/
```

Examples:

- PRDs,
- feature specifications,
- architecture notes,
- data-model documentation,
- UX specifications,
- and implementation notes.

`docs/` may be more detailed than `.ai/PROJECT.md`, but it must not silently contradict it.

---

## 23. Project Knowledge Hierarchy

This hierarchy describes project and product truth.

AI operating instructions are governed separately by `.ai/README.md`, `.ai/policies/`, and applicable Agent Skills.

Project knowledge should normally be interpreted in this order:

```text
1. Explicit current task
2. .ai/PROJECT.md
3. Approved architectural decisions
4. Current approved PRD or feature specification
5. Detailed documentation under /docs
6. Existing implementation
7. Tests
8. Git history
```

An explicit task does not automatically authorize breaking established architecture or persistent project policy.

Source code represents the current implementation, but it does not automatically override intentional project decisions.

If sources disagree, identify the mismatch rather than silently normalizing it.

---

## 24. Current MVP Priorities

Current development priority follows this rough order:

```text
foundation
    ↓
frontend UI/UX consistency
    ↓
basic user / cohort management
    ↓
authentication & roles
    ↓
attendance
    ↓
practice
    ↓
assignments
    ↓
exams
    ↓
backend persistence and infrastructure
```

This ordering may change when implementation dependencies justify it.

Do not skip foundational reliability merely to expose more features.

---

## 25. Explicit MVP Non-Goals

Unless separately approved, the MVP does not require:

- chat,
- direct messaging,
- video conferencing,
- live classroom infrastructure,
- automatic timetable generation,
- calendar synchronization,
- complex analytics,
- AI tutoring,
- AI grading,
- gamification systems,
- certificates,
- public registration,
- payment systems,
- multi-tenant enterprise architecture,
- microservices,
- native mobile applications,
- real-time collaborative editing,
- sophisticated notification infrastructure,
- or large-scale cloud architecture.

These may become valid future features.

They are not current requirements.

---

## 26. Open Decisions

The following areas are intentionally not fully specified yet:

- exact cohort and class structure,
- detailed account-management permissions,
- exact attendance workflow,
- exact assignment submission types,
- grading model,
- detailed exam furigana behavior,
- notification requirements,
- production deployment pricing tier,
- detailed course-authoring workflow,
- exact account invitation and recovery workflows,
- and future organization structure.

Do not invent elaborate solutions for these areas.

Resolve them when the corresponding feature becomes an active implementation task.

---

## 27. Product Philosophy

Genshu should grow from real usage.

Do not implement features simply because mature LMS products contain them.

Every major feature should answer a real need from:

- Gakusei,
- Sensei,
- or Tantōsha.

Preferred sequence:

```text
real problem
→ smallest useful workflow
→ actual usage
→ feedback
→ refinement
→ expansion
```

not:

```text
large feature list
→ generalized architecture
→ implementation
→ hope users need it
```

---

## 28. Core Principle

When uncertain, prefer:

```text
simple
over clever

explicit
over magical

existing stack
over new dependency

good UX
over feature count

current requirement
over hypothetical future scale

maintainable
over impressive
```

Genshu should become more sophisticated only when real usage requires it.
