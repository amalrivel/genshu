# Gentsuki bank import

Source: [`amalrivel/gentsuki-ready-web`](https://github.com/amalrivel/gentsuki-ready-web), commit `f085af618ff11e594868eeed653a945d6daaa682`. Exact source JSON snapshots, their Git blob IDs, and the referenced JPEG blob IDs and dimensions are pinned in `db/imports/gentsuki-ready-web/manifest.json`. Converted rows and source-to-target mappings are in `dataset.json`.

## Mapping

- The 12 source files map to 12 sets: Book 1–3, Genchare 1–4, and Menkyo Blog 1–5. Categories remain `book`, `genchare`, and `menkyo_blog`; every set is `NON_JLPT` because the source does not specify a JLPT level.
- There are 586 source top-level records. Fourteen illustration groups expand into 42 child questions, giving 614 scoreable questions total. The group stem, focus points, and illustration are retained as shared question context.
- Every question is Japanese true/false. Source `true` maps to option 0 (`○`); `false` maps to option 1 (`×`). Source plain text and furigana tokens are both retained. No Indonesian translations or descriptions are invented.
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

First apply `db/migrations/006_gentsuki_import_support.sql` through the normal migration process. This adds per-question publication, source provenance, illustration/image metadata, source categories, and the non-JLPT level; RLS still requires Sensei for writes and hides draft questions from anonymous readers.

With the Genshu Supabase URL and publishable key plus `SENSEI_EMAIL` and `SENSEI_PASSWORD` set in a local, untracked environment file:

```sh
bun db/scripts/import-gentsuki-ready-web.ts --check
bun db/scripts/import-gentsuki-ready-web.ts --dry-run
bun db/scripts/import-gentsuki-ready-web.ts --apply
```

`--snapshot` regenerates the deterministic dataset. `--check` verifies pinned source Git blobs, question mappings, text, counts, duplicate question text, and local JPEG blob hashes without contacting Supabase. `--dry-run` authenticates as Sensei and reports insert/skip/error counts without writes. `--apply` invokes the Sensei-only atomic `save_practice_set` RPC once per bank. Matching source commit and converted-content digest are skipped on rerun. Existing sets with conflicting IDs or provenance are reported as errors and never updated. If a run stops, rerun dry-run: completed banks are skipped and the remaining banks can be retried independently. Never delete or reset existing Genshu content to recover an import.

An edited imported set remains protected from later import runs because the importer never calls the update path. Sensei changes to imported questions retain their stable IDs and source references through the existing editor.
