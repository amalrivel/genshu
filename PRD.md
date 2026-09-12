# Genshu — Executive MVP PRD

**Status:** Draft v0\.2
**Date:** September 8, 2026
**Target launch:** End of 2026

## 1\. Product Overview

Genshu is a practice\-focused learning app for Japanese gentsuki exam preparation\. The MVP must be usable in real study settings, not only as a portfolio demo\.

**Primary users:** Indonesian Asahi Shimbun scholarship recipients entering in 2027\.
**Initial scale:** Fewer than 30 invited participants\.
**Platforms:** Responsive smartphone and desktop web\.
**Core outcome:** Users complete practice sets and mock exams, view scores and attempt history, and review incorrect answers\.

The product must not claim official affiliation with Asahi Shimbun unless formally confirmed\.

## 2\. MVP Scope

|Area             |MVP Requirement                                                                                  |
|-----------------|-------------------------------------------------------------------------------------------------|
|Access           |Admin-created or invited accounts; no public registration                                        |
|Content language |Japanese with Indonesian translation                                                             |
|Furigana         |User-selectable furigana display for Japanese questions and text                                  |
|Question types   |Text and illustrated Maru/Batsu questions                                                        |
|Practice         |Admin-curated practice sets                                                                      |
|Mock exams       |Exam-inspired format with admin-configurable question count                                      |
|Results          |Scores, attempt history, and incorrect-answer review                                             |
|Admin            |Manage topics, materials, questions, answer keys, explanations, illustrations, users, and results|
|Content structure|Topic → Material; no Course entity required                                                      |

## 3\. Core User Flows

**Participant:** Sign in → Select practice set or mock exam → Answer questions → Submit → View results → Review incorrect answers\.

**Admin:** Sign in → Create topics, materials, questions, illustrations, answer keys, and explanations → Build sets → Grant access → Review participant results\.

## 4\. Functional Requirements

### Accounts and Permissions

- Support Participant and Admin roles\.
- Only Admins can create or invite users and manage content\.
- Participants can access only their own attempts and results\.
- Admins can view participant results\.
- Login, account activation, and recovery methods remain open decisions\.
- Enforce authorization server\-side\.

### Content and Practice Sets

- Admins can manage Japanese content with Indonesian translations\.
- Support text and illustrated Maru/Batsu questions\.
- Each question includes an answer key and explanation\.
- Admins can create practice sets by selecting questions\.
- Illustrated\-question structure must be validated against the intended exam format\.
- Question\-topic relationships, ordering, and question\-bank reuse require confirmation\.

### Optional Furigana

- Users can show or hide furigana (kana readings above kanji) on Japanese questions, materials, and explanations, including practice, mock exams, and result review.
- Kanji remain visible in both settings; enabling furigana does not replace the Japanese text with kana only.
- The furigana control is independent of Indonesian translation display and does not change answers, scores, or attempt progress.
- Proposed behavior: remember the user's preference for future visits. The default setting and persistence method remain open decisions.
- Content preparation proposal: allow Admins to review and correct readings. Japanese text requiring this toggle should be available as separate text rather than embedded permanently in an illustration.

### Practice Mode

- Participants complete admin\-provided practice sets\.
- Proposed behavior: show the correct answer and explanation after each confirmed response\.
- No time limit is required for MVP unless later approved\.
- Participants may retry a set; each attempt must be stored separately\.

### Mock Exam Mode

- Admins can configure the number of questions\.
- Proposed behavior: hide answers and explanations until submission; allow review and changes before final submission\.
- Time limits, text/illustration composition, scoring weights, and passing thresholds require validation\.
- Do not apply absolute official passing scores when question counts vary without an approved normalization rule\.
- “Exam\-inspired” does not imply official questions or a passing guarantee\.

### Results and History

- Store each completed attempt with score, answers, and correctness\.
- Participants can view their history and incorrect answers\.
- Recommended stored metadata: date, mode, set, score, maximum score, and question/answer\-key versions\.
- Historical results must remain stable after content changes\.
- Automatic retry quizzes from incorrect answers are out of MVP unless approved\.

## 5\. Quality and Operational Requirements

- Responsive layout for smartphones and desktops\.
- Japanese text, translations, and illustrations must remain readable without unnecessary horizontal scrolling\.
- Maru/Batsu controls must be clearly labeled and usable by touch and keyboard\.
- Prevent duplicate completed attempts from repeated submissions\.
- Clearly handle loading, empty, error, and save\-failure states\.
- Define refresh and connection\-loss behavior before implementation\.
- Provide basic data backup and recovery before launch\.
- Hosting, operating cost, and retention policy remain open decisions\.

## 6\. Content and Launch Readiness

Launch content must be legally usable and factually reviewed\.

Before release:

- Identify all source materials\.
- Confirm permission to use questions, illustrations, translations, and reference content\.
- Replace any content without clear usage rights\.
- Assign responsibility for question and translation review\.
- Do not assume ownership of books or PDFs grants application\-use rights\.

## 7\. Delivery Plan

1. Resolve decisions affecting accounts, question structure, scoring, and content rights\.
2. Deliver the end\-to\-end flow: Admin creates a set → Participant completes it → Result is stored\.
3. Add mock exams, history, and incorrect\-answer review\.
4. Pilot with invited users on smartphones and desktops before the end\-of\-2026 launch\.

## 8\. MVP Acceptance Criteria

- Users can show and hide furigana on Japanese questions, materials, and explanations on smartphones and desktops; kanji remain visible, layout stays readable, and answers and scores remain unchanged.
- Invited participants can sign in and cannot access Admin functions or other users’ results\.
- Admins can manage content and sets without direct database edits\.
- Text and illustrated questions work on smartphone and desktop\.
- Japanese content and Indonesian translations follow the approved display rules\.
- Scores match approved calculation examples\.
- Mock\-exam timing and passing rules pass testing once finalized\.
- History persists across sign\-out and sign\-in\.
- Participants can review incorrect answers\.
- Admins can view completed participant results\.
- Launch content has passed factual and usage\-rights review\.
- Pilot users can complete quizzes without direct assistance\.
- Admins can manage sets independently\.

Passing the real\-world exam is not an MVP success metric\.

## 9\. Out of Scope

Unless explicitly approved later:

- Public registration
- Payments
- Leaderboards
- Certificates
- Forums or chat
- AI\-generated questions or tutoring
- Native mobile apps
- Offline mode
- Topic\-level progress dashboards
- Multi\-course LMS functionality

## 10\. Open Decisions

1. Official exam reference: exam type, location, illustrated\-question structure, scoring, time limit, and passing rules\.
2. Scoring and timing when Admins change question counts\.
3. Mock\-exam question selection and source\.
4. Translation display: always visible or toggle\-based; availability during mock exams\.
5. Approval of practice feedback, retries, and mock\-exam review behavior\.
6. Account creation, invitation flow, login, and recovery method\.
7. Refresh and connection\-loss behavior\.
8. Incorrect\-answer scope: per attempt or combined\.
9. Approved content sources, reviewers, and launch content volume\.
10. Final launch date, hosting, operating cost, data retention, and Admin ownership\.

## 11\. Development Guidance

Build and test one small user flow at a time\. Treat proposed behavior and open decisions as non\-final until approved\. Do not add out\-of\-scope features without approval\. Validate technical decisions against the actual repository; this PRD does not automatically require stack or database\-schema changes\.
