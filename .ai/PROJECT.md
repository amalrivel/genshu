# Genshu: product and architecture

## Product scope
Genshu supports Indonesian students in Japanese scholarship programs.
The first release covers public learning materials, anonymous practice, and staff content management.

- Students read published content and practice without accounts. Answers and scores are temporary browser state, not official records.
- Active `SENSEI` staff author and publish content.
- `TANTOSHA` staff have permitted oversight access, not content-authoring permission.
- Attendance, assignments, exams, cohorts, and user management remain prototypes. Preserve their code; do not present them as operational features.
- Student accounts, official progress history, course hierarchy, invitations/recovery details, and future assessment workflows need separate requirements.

## Learning experience
Support Indonesian/Japanese UI, Japanese learning content with Indonesian explanations, and optional furigana. Formal assignments/exams use Japanese; their furigana policy remains undecided.
Prioritize clear actions, understandable loading/empty/error states, accessibility, and usable phone/desktop layouts. Existing shadcn components may be adapted.

Owner-requested practice behavior (requirements, not claims of completion):
- Move forward only during answering; lock each answer after confirmation.
- Offer clear, large Maru/Batsu choices.
- Use a simple back-to-catalog control instead of practice breadcrumbs. Leaving practice is distinct from navigating to earlier questions.
- Keep mock-exam behavior separate.

## Architecture
Use one full-stack Next.js App Router application with TypeScript and Bun.
UI uses Tailwind CSS, shadcn/Base UI, next-intl, and next-themes.
Reuse the existing stack; explain the benefit and migration cost before changing major dependencies, roles, database, or hosting.

Persistent content uses Supabase PostgreSQL via Data API. Server Components and Server Actions use a per-request cookie-aware `@supabase/ssr` client.
Active `staff_members` rows determine staff permissions. Enforce authorization in server mutations and RLS; hidden controls are insufficient.
Practice-set/question replacement uses a restricted transactional RPC.
Prototype `DataProvider` uses mock data/browser storage; it is not the persistent learning backend.

Runtime requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
Use a local Supabase stack or isolated development project. Plain PostgreSQL alone cannot serve Auth/Data API.
`POSTGRES_URL` is administration-only. Keep secret/service-role keys out of browser code.

## Imported practice
Preserve source categories `book`, `genchare`, `menkyo_blog`, and level `NON_JLPT`.
Compare imported data with the original renderer; do not invent wording, translations, furigana, answer keys, or hints from unused metadata.

An illustration group has one shared situation/image and three ordered children with independent answers.
Show shared content once. Standard questions score one point; a complete illustration group scores two only when all three answers are correct.
Do not expose incomplete or partly unpublished groups as complete public groups.
Preserve group membership and same-set relationships when editing.
Imported images live in `public/gentsuki-quiz-assets/`; user-uploaded storage is not implemented.

## Operations and maintenance
- Version SQL changes under `db/migrations/`. Check the target ledger; repository files do not prove application. Correct applied migrations with forward migrations.
- Run sample seeds only locally. Use the dedicated importer for imported content.
- Vercel is the initial app host. Verify the actual deployment commit and affected flows before claiming a change shipped.
- Rehearse backup restoration on an isolated target before relying on production content; code rollback does not undo database/content changes.
- Preserve `patches/next@16.3.5.patch`, the development RSC profiler workaround; reassess it on framework upgrades.
- Keep official learning records server-side when those features are introduced.

Build only for current needs. Public registration, native apps, payments, chat, AI tutoring/grading, multi-tenancy, and additional infrastructure are outside the current scope.
Setup belongs in [README](../README.md); agent workflow and the current review queue belong in [AI workflow](README.md).
