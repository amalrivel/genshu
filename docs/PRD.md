# Genshu — Executive MVP PRD

**Status:** Draft v0.4  
**Date:** September 19, 2026  
**Target launch:** End of 2026

## Document Role

This document is the product source of truth for the Genshu MVP.

It defines product scope, user behavior, requirements, acceptance criteria, and explicitly excluded functionality.

Technical decisions belong in `ARCHITECTURE.md`. UI and interaction decisions belong in `UI-UX.md`. Significant decisions and rationale belong in `DECISIONS.md`.

The current rebuild changes implementation, not the product goals defined here.

## 1. Product Overview

Genshu is a practice-focused learning app for Japanese gentsuki exam preparation.

**Primary users:** Indonesian Asahi Shimbun scholarship recipients entering in 2027  
**Initial scale:** Fewer than 30 invited participants  
**Platforms:** Responsive smartphone and desktop web  
**Core outcome:** Users complete practice sets and mock exams, view results and attempt history, and review incorrect answers

The product must not claim official affiliation with Asahi Shimbun unless formally confirmed.

## 2. MVP Scope

| Area | MVP requirement |
| --- | --- |
| Access | Admin-created or invited accounts; no public registration |
| Content language | Japanese with Indonesian translation |
| Furigana | User-selectable furigana for Japanese text |
| Question types | Text and illustrated Maru/Batsu questions |
| Practice | Admin-curated practice sets |
| Mock exams | Exam-inspired format with configurable question count |
| Results | Scores, attempt history, incorrect-answer review |
| Admin | Manage topics, materials, questions, answers, explanations, illustrations, users, and results |
| Content structure | Topic → Material; no Course entity required |

## 3. Core User Flows

**Participant:** Sign in → Select practice set or mock exam → Answer questions → Submit → View results → Review incorrect answers.

**Admin:** Sign in → Manage learning content and questions → Build sets → Grant access → Review participant results.

## 4. Functional Requirements

### Accounts and Permissions

- Support Participant and Admin roles.
- Only Admins can create or invite users and manage content.
- Participants can access only their own attempts and results.
- Admins can view participant results.
- Enforce authorization server-side.
- Account creation, activation, login, and recovery implementation remain open decisions.

### Content

- Admins can manage Japanese content with Indonesian translations.
- Support text and illustrated Maru/Batsu questions.
- Each question includes an answer key and explanation.
- Admins can create practice sets by selecting questions.
- Illustrated-question structure must be validated against the intended exam format.
- Question relationships, ordering, and reuse should remain simple unless product needs require more complexity.

### Furigana

- Users can show or hide furigana on Japanese questions, materials, explanations, practice sessions, mock exams, and result review.
- Kanji remain visible in both settings.
- Furigana display must not change answers, scores, or progress.
- The preference should eventually persist for the user; the exact persistence method remains open.
- Japanese text that requires furigana should remain editable text rather than being permanently embedded in illustrations.

### Practice Mode

- Participants complete admin-provided practice sets.
- Current proposed behavior: show the correct answer and explanation after each confirmed response.
- No time limit is required for the MVP unless later approved.
- Participants may retry a set.
- Each completed attempt is stored separately.

### Mock Exam Mode

- Admins can configure the number of questions.
- Current proposed behavior: hide answers and explanations until submission and allow answer review before final submission.
- Time limits, question composition, scoring weights, and passing thresholds require validation.
- Do not use an official-looking fixed passing score when question counts differ without an approved normalization rule.
- “Exam-inspired” does not imply official questions or a passing guarantee.

### Results and History

- Store completed attempts with score, submitted answers, and correctness.
- Participants can view attempt history and incorrect answers.
- Historical results must remain stable after content changes.
- Automatic retry quizzes from incorrect answers are outside the MVP unless explicitly approved.

## 5. Quality Requirements

- Responsive on smartphones and desktops.
- Japanese text, translations, and illustrations must remain readable without unnecessary horizontal scrolling.
- Maru/Batsu controls must work comfortably with touch and keyboard.
- Prevent duplicate completed attempts caused by repeated submissions.
- Handle loading, empty, error, and save-failure states clearly.
- Define refresh and connection-loss behavior before launch.
- Provide a basic database backup and recovery process before launch.

## 6. Content and Launch Readiness

Before release:

- identify all source materials
- confirm permission to use questions, illustrations, translations, and reference content
- replace content without clear usage rights
- assign responsibility for question and translation review
- do not assume ownership of a book or PDF grants application-use rights

## 7. Delivery Order

1. Resolve account, question-structure, scoring, and content-rights decisions.
2. Deliver one end-to-end flow: Admin creates a set → Participant completes it → Result is stored.
3. Add mock exams, history, and incorrect-answer review.
4. Pilot with invited users on smartphones and desktops before launch.

## 8. MVP Acceptance Criteria

- Users can toggle furigana without changing answers, scores, or readability.
- Invited participants can sign in and cannot access Admin functions or another user's results.
- Admins can manage content and practice sets without direct database edits.
- Text and illustrated questions work on smartphone and desktop.
- Scores match approved calculation examples.
- History persists across sessions.
- Participants can review incorrect answers.
- Admins can view completed participant results.
- Launch content has passed factual and usage-rights review.
- Pilot users can complete the primary flows without direct assistance.

Passing the real-world exam is not an MVP success metric.

## 9. Out of Scope

Unless explicitly approved later:

- public registration
- payments
- leaderboards
- certificates
- forums or chat
- AI-generated questions or tutoring
- native mobile apps
- offline mode
- topic-level progress dashboards
- multi-course LMS functionality

## 10. Open Decisions

1. Official exam reference: format, illustrated questions, scoring, time limit, and passing rules.
2. Scoring and timing when Admins change question counts.
3. Mock-exam question selection and source.
4. Translation display behavior.
5. Final practice-feedback and retry behavior.
6. Account creation, invitation, login, and recovery implementation.
7. Refresh and connection-loss behavior.
8. Incorrect-answer review scope.
9. Approved content sources, reviewers, and launch content volume.
10. Production hosting, database hosting, data retention, and Admin ownership.

## 11. Development Guidance

Build and test one small user flow at a time. Treat proposed behavior and open decisions as non-final until approved. Do not add out-of-scope features without approval.

The current development environment uses local PostgreSQL. Product requirements in this PRD must not be interpreted as requiring Supabase, a particular auth provider, a particular storage provider, or another hosted service.
