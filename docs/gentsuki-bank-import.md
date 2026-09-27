# Gentsuki bank import

Source: [`amalrivel/gentsuki-ready-web`](https://github.com/amalrivel/gentsuki-ready-web), commit `f085af618ff11e594868eeed653a945d6daaa682`. Exact source JSON snapshots, their Git blob IDs, and the referenced JPEG blob IDs and dimensions are pinned in `db/imports/gentsuki-ready-web/manifest.json`. Converted rows and source-to-target mappings are in `dataset.json`.

## Mapping

- The 12 source files map to 12 sets: Book 1–3, Genchare 1–4, and Menkyo Blog 1–5. Categories remain `book`, `genchare`, and `menkyo_blog`; every set is `NON_JLPT` because the source does not specify a JLPT level.
- There are 586 source top-level records. Fourteen `illustration_group` records expand into 42 child questions, giving 614 scoreable questions total. Each group has a stable ID, source reference, shared stem/furigana, image metadata, and three ordered child IDs. The player renders the shared stem and image once with all three children in order; each child has independent answer and explanation state.
- `focus_points_plain` and `focus_points_ruby` exist in the pinned JSON, but the legacy answering renderer neither displays nor transfers them into a question. They are source metadata, not prompt or explanation text, and Genshu omits them from display fields. In six Book groups, the previous importer had appended 15 focus-point items to child contexts; the guarded repair removes these additions.
- Every question is Japanese true/false. Source `true` maps to option 0 (`○`); `false` maps to option 1 (`×`). Source plain text and furigana tokens are both retained. No Indonesian translations or descriptions are invented.
- The source player awards one point for a standard question. For an illustration group it awards two points only when all three child answers are correct; otherwise the group earns zero. Genshu uses that rule, calculates the maximum from playable units, and excludes incomplete or partly unpublished groups.
- 602 questions publish. Twelve with differing plain/ruby wording stay as Sensei-visible drafts until reviewed; their source text is preserved. The 21 boolean image markers in three Menkyo Blog banks are warnings, since the old source renderer ignored those non-path values. They do not invalidate the question. All 84 actual referenced JPEGs are bundled by upstream Git blob ID.
- The source inventory contained no duplicate normalized question text or placeholder/example records. Every scoreable record has Japanese prompt, explanation, and furigana data.

| Source set | Total | Published | Draft |
| --- | ---: | ---: | ---: |
| Book 1 | 52 | 52 | 0 |
| Book 2 | 52 | 51 | 1 |
| Book 3 | 52 | 50 | 2 |
| Genchare 1 | 52 | 51 | 1 |
| Genchare 2 | 52 | 50 | 2 |
| Genchare 3 | 52 | 49 | 3 |
| Genchare 4 | 52 | 52 | 0 |
| Menkyo Blog 1 | 50 | 50 | 0 |
| Menkyo Blog 2 | 50 | 49 | 1 |
| Menkyo Blog 3 | 50 | 49 | 1 |
| Menkyo Blog 4 | 50 | 50 | 0 |
| Menkyo Blog 5 | 50 | 49 | 1 |
| **Total** | **614** | **602** | **12** |

Draft refs and differing source fields: `book_2/8` (`explanation_plain`); `book_3/12` (`question_plain`), `book_3/28` (both); `genchare_1/7` (`question_plain`); `genchare_2/16` (both), `genchare_2/35` (`explanation_plain`); `genchare_3/3` (both), `genchare_3/31`, `genchare_3/38` (`question_plain`); `menkyo_blog_2/5` (`question_plain`); `menkyo_blog_3/39` (`explanation_plain`); `menkyo_blog_5/29` (`question_plain`).

## Run

Apply migration 006 and migrations 007–013 in order through the normal migration process. Migration 006 adds per-question publication, source provenance, image metadata, source categories, and the non-JLPT level. Migrations 007–011 add group records and child links, repair support, and group RLS. Migration 012 enforces complete ordered groups and public eligibility. Migration 013 makes update limits depend on stored provenance, preserves imported provenance during atomic replacement, and reserves 60-question creation for the pinned Gentsuki bank identities. Runtime remains on the Supabase Data API; anonymous writes are not allowed.

With the Genshu Supabase URL and publishable key plus `SENSEI_EMAIL` and `SENSEI_PASSWORD` set in a local, untracked environment file:

```sh
bun db/scripts/import-gentsuki-ready-web.ts --check
bun db/scripts/import-gentsuki-ready-web.ts --dry-run
bun db/scripts/import-gentsuki-ready-web.ts --apply
bun db/scripts/import-gentsuki-ready-web.ts --verify-live
```

`--snapshot` regenerates the deterministic dataset. `--check` verifies pinned source Git blobs, mappings, text, counts, duplicate question text, group membership, known plain/ruby exceptions, and all referenced JPEG blob hashes (including group images) without contacting Supabase. `--dry-run` reports insert/update/skip/error counts and, per illustration group, child IDs and focus-point text that would be removed; it does not write. `--apply` authenticates an active Sensei and uses the Sensei-only atomic `save_practice_set` RPC for new sets. Existing group-free sets are repaired only through `repair_gentsuki_illustration_groups`, which verifies pinned provenance and compares every legacy child row with the exact preserved baseline before updating group links, context, and image metadata. It refuses mismatches, so Sensei edits are not silently overwritten. `--verify-live` compares stored sets, questions, group metadata, image metadata, and anonymous visibility with the converted dataset. It does not replace the dedicated group/RPC role tests.

If an import stops, rerun `--dry-run`, inspect per-set counts/errors, then rerun `--apply`: matching completed sets skip and independent sets can be retried. For a failed illustration repair, retain the database state and inspect the affected set and its Sensei edits before manual action. The repair RPC is transactional per set and refuses partial or changed legacy content. Do not delete, reset, seed, or recreate imported content to recover. Before any rollback that removes group data, take a database backup/export and prepare a reviewed reverse migration; do not drop schema used by the player or existing records.

An edited imported set remains protected from later import runs because the importer never calls the update path. Sensei changes to imported questions retain their stable IDs and source references through the existing editor.

## Evidence and acceptance status

On 2026-09-26, `--check` passed for 12 sets, 614 questions, 602 published, 12
drafts, and 84 assets. A connected Data API `--dry-run` returned insert 0,
update 0, skip 12, error 0; it reported the 14 source groups, 42 children, and
15 focus-point labels absent from the corrected import, with no writes. The
target database contains 14 groups and 42 children with no incomplete group,
missing group image, or legacy child context. The `--verify-live` command could
not authenticate with the local Sensei credentials during this run; see
[release readiness](release-readiness.md) for the successful role checks and
remaining deployment/recovery limits. Keep editorial exceptions as drafts
until reviewed; baseline counts are not a permanent constraint on legitimate
future Sensei content changes.
