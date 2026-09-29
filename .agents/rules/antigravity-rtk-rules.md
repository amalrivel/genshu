# RTK for Google Antigravity

RTK is an optional output-reduction tool, not a project dependency or permission
boundary. Check `command -v rtk` before using it. Prefer RTK for supported routine
inspection commands when its output preserves the evidence needed.

Use normal commands when RTK is unavailable, a command is unsupported, or an
exact result is needed. Use `rtk proxy <command>` or the raw command for full
error output, stack traces, SQL diagnostics, migration results, and audit data.
Do not infer success from a filtered summary: retain exit status and inspect
all relevant errors. Never hide failed checks to reduce token usage.

Examples:

```sh
rtk git status
rtk git diff --stat
rtk proxy bun run typecheck
```

Prefer `rg` for source searches as required by the agent entry point. Use the
project's Bun scripts for verification; output compression must not replace or
change the underlying check. Role boundaries, migration/deployment authorization,
and credential handling come from the current task and `.ai/README.md`, not RTK.

Optional usage statistics: `rtk gain`, `rtk gain --history`, and `rtk discover`.
