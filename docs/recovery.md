# Backup and recovery

## Status and responsibility

No completed backup/restore rehearsal is recorded in the repository. Treat
recovery as an outstanding operational gate, not a verified capability.
The owner has deferred the isolated rehearsal to a later operational phase;
this is not a completed recovery check.
Earlier notes reported a Free Supabase plan; inspect the current project's
backup facilities before choosing a method. Supabase recommends regular CLI
exports and off-site copies for Free projects; see the official
[backup guide](https://supabase.com/docs/guides/platform/backups) and
[CLI dump reference](https://supabase.com/docs/reference/cli/supabase-db-dump).

The procedure below defines acceptance criteria. Exact export/restore commands
must be checked against the installed CLI (`--help`), target privileges, and
current official restore instructions before running. This document does not
assert that a generic restore command has been rehearsed successfully.

## Export inventory

1. Identify the source project, schema version, migration ledger, and application
   commit. Export before schema/content changes; maintain regular off-site copies
   while beta users depend on content.
2. Include application tables, group/child relationships, functions, private
   authorization helpers, policies/grants, and `genshu_schema_migrations`.
   Inspect what the chosen dump actually contains instead of assuming coverage.
3. Record counts and content digests, including draft/publication state and
   imported provenance. Preserve local illustration assets via the source
   revision; a database dump alone does not contain those JPEG files.
4. Inventory excluded Auth users, project Auth settings, role credentials, and
   external assets separately. Store required account-ID mappings securely;
   recreate/invite staff and remap UUIDs if the restore target has new identities.
5. Keep exports and credential-bearing output outside the public repository.
   Restrict access and encrypt off-site copies. Do not log connection URLs.

## Isolated restore rehearsal

Use a separate Supabase project or local Supabase stack with Data API and Auth.
Never use production as a rehearsal target. Check that source dumps and target
managed schemas/roles are compatible; resolve ownership and extension requirements
using current Supabase instructions. Avoid copying unreviewed role creation or
constraint-bypass commands into production.

Restore the reviewed exports, then compare the target ledger's migration names
with the captured source ledger. Do not assume there are four entries or that
all files in the current worktree had been applied to the source. Confirm the
restored baseline before applying later forward migrations.

Verify content digests, provenance, group relationships, child positions,
publication state, and assets. Run read-only grants/RLS inspection against the
restore, then test direct Data API access for anon, non-staff, Sensei, Tantōsha,
and inactive staff, including group tables and RPCs. Group permission checks and a local five-role Data API harness are available.
Repeat the relevant checks on the restored target; a source/local pass does
not establish that the restore preserves permissions and behavior.

Point an isolated application at the restore and verify public reading/practice,
draft privacy, staff authentication, and authoring. Record the source/target,
commit, ledger, date, commands, results, limitations, and recovery time without
secrets. Only then mark the rehearsal complete in `docs/release-readiness.md`.

## Application and data rollback

Confirm compatibility between the previous application revision and the current
schema before promoting a previous Vercel deployment. Verify routes and logs
after rollback. Database/group repair and content rollback need a separate,
reviewed recovery action; preserve Sensei edits and take an export first.
Do not drop group tables, reset data, or run the sample seed to roll back a UI.

## Environment inventory — 2026-09-27 JST

The inspected source project is `invekuqrmwvrfxkcqfcp` (`ap-southeast-1`).
The available branch listing contains only `main` on that same project and no
isolated target. Local `supabase` CLI and Docker are absent, and
`POSTGRES_URL` is not configured. No export, restore, reset, or seed was run.

To perform the rehearsal, the owner must provide an isolated Supabase project
or local Supabase stack, access appropriate for read-only source export and
target restore, and the required CLI/container tooling. Confirm source and
target project identities and capabilities without recording credentials.
Until those resources exist, the rehearsal remains incomplete; production is
not an acceptable substitute.
