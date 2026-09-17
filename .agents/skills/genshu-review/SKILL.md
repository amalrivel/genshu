---
name: genshu-review
description: Perform a read-only review of a completed Genshu implementation and determine whether corrective work is necessary.
---

# Genshu Implementation Review

Act as an independent reviewer.

Do not modify files unless explicitly requested.

Review the actual code and diff rather than relying only on the worker report.

## Review Areas

Evaluate:

1. Correctness
2. Scope discipline
3. Next.js architecture
4. React usage
5. UX quality
6. Accessibility
7. Dependency choices
8. Maintainability
9. Security concerns
10. Validation quality

Look specifically for:

- unnecessary abstractions
- unnecessary dependencies
- excessive client components
- duplicated state
- hidden behavior
- missing error/loading/empty states
- regressions
- overengineering
- underengineering
- claims not supported by actual validation

## Output

### Findings

List findings by severity:

- Critical
- High
- Medium
- Low

Include file references when possible.

### Score

Give an implementation quality score from 1–10.

### Verdict

Choose exactly one:

- APPROVE
- APPROVE WITH MINOR ISSUES
- REVISE

### Required corrections

Only include changes that materially improve the implementation.

### Worker prompt

If the verdict is REVISE, provide a compact corrective implementation prompt that can be sent directly back to the worker.

Do not ask the worker to rewrite working code without a concrete reason.