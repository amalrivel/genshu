# Genshu — UI/UX

**Status:** Initial MVP guidance  
**Date:** September 19, 2026

## 1. Design Principles

Genshu should feel like a focused study tool rather than a generic LMS dashboard.

Priorities:

1. clear next action
2. readable Japanese content
3. low cognitive load
4. comfortable smartphone use
5. consistent behavior across practice, exams, and review
6. simple Admin workflows

Avoid unnecessary dashboards, decorative complexity, dense analytics, hidden gestures, and interactions that require users to understand the underlying system.

## 2. Navigation

Participant navigation should prioritize:

- Home
- Practice
- Mock Exam
- History

Admin navigation should expose management tasks clearly without mixing them into participant study flows.

Do not create deep navigation hierarchies unless the content structure requires them.

## 3. Mobile Behavior

Mobile is a first-class target, not a reduced desktop layout.

- Primary actions should be easy to reach and tap.
- Question content should use the full practical width.
- Avoid horizontal scrolling for ordinary text.
- Navigation, answer controls, and submission controls must remain usable on small screens.
- Dense Admin tables should degrade into readable stacked layouts when necessary.

## 4. Japanese Typography

Japanese text is primary content and should have sufficient size, line height, and spacing for study use.

Do not compress Japanese questions merely to fit more content above the fold.

Indonesian translation should be visually secondary but easy to access.

## 5. Furigana

Furigana is a user-controlled reading aid.

- Show readings above the corresponding kanji using semantic ruby markup where practical.
- Turning furigana off must leave the original kanji text intact.
- The control should be easy to find but should not dominate the question interface.
- Toggling furigana must not reset progress or answers.

## 6. Forms

Forms should group related fields and make the save action obvious.

For Admin authoring:

- prioritize the actual content being created
- show validation near the affected field
- preserve entered content after recoverable errors
- avoid modal-heavy editing when a full page is clearer
- require confirmation only for destructive actions

## 7. Question Answering

For Maru/Batsu questions:

- both choices must be visually distinct and clearly labeled
- the selected answer must be obvious
- controls must work with touch and keyboard
- users should not lose answers when navigating between questions

Practice feedback and exam feedback must follow the behavioral rules defined in `PRD.md`.

## 8. Exam Runner

The runner should prioritize the question, answer controls, progress, and navigation.

Useful elements may include:

- current question number
- total question count
- Previous / Next
- question palette or overview when it materially improves navigation
- clear unanswered state
- explicit final submission confirmation

Do not reveal correctness before submission in mock-exam mode.

## 9. Results and Review

Results should make the outcome understandable without turning the screen into an analytics dashboard.

Show:

- score
- total questions
- correctness per question
- submitted answer
- correct answer
- explanation

Incorrect answers should be easy to identify and review.

## 10. Admin Workflow

Admin workflows should optimize for repeated content entry.

The expected sequence is roughly:

Topic / Material → Question → Answer and explanation → Practice set → Participant access → Results.

Do not force Admins to edit normal product data directly in PostgreSQL.

## 11. States and Feedback

Every important screen should define:

- loading state
- empty state
- validation state
- save success
- recoverable failure
- destructive confirmation where needed

Avoid toast-only feedback for important failures. The affected page or form should make the problem visible.

## 12. Accessibility Baseline

- visible keyboard focus
- semantic controls
- adequate touch targets
- meaningful labels
- do not encode correctness using color alone
- images used by questions need appropriate alternative handling when the content allows it

## 13. Boundary

This file describes user experience behavior, not visual branding.

Specific typography families, colors, animation, spacing tokens, and component styling may evolve during implementation, but they should preserve the interaction principles above.
