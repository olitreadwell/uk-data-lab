# ORCHESTRATION.md: planning-datasets

Built 2026-09-26, the fifth microsite, one day after the cycle hire story.

- Every vendored source was already used by a published story, so this
  iteration added one: `planning-datasets` went into
  `uk-open-data-connectors` first, on
  `feat/connectors/add_planning_dataset_adapter` (PR #20), with 13 unit tests
  and a seven-entry fixture.
- `npm run check` in the connectors repo (format, build, lint, type-check,
  tests with coverage) passes, and `RUN_SMOKE=1 npm run test:smoke` probes all
  six registered UK sources live.
- The package was vendored here with
  `node scripts/sync-connectors.mjs --from ../uk-open-data-connectors`, not
  edited by hand.
- The site side follows the cycle hire story: a fetch module with a committed
  snapshot fallback (`planning-data.ts`), a chart component with unit tests, a
  page-test block, and e2e coverage that picks the route up from `MICROSITES`.

## Findings worth keeping

- The catalogue file is not only datasets. It carries the platform's own
  tables (pipeline columns, realms, licences, provenance) in the same array,
  and `realm` is the field that separates them: 222 rows, 201 of them
  `realm: dataset`. Counting all 222 would have overstated the platform by 21
  entries that are not datasets.
- Only 84 of the datasets are empty, but they include every `prioritised`
  entry, so the empty list is a mix of work in progress and work not started.
- The site-side fixture is the full 222-row payload with the fields the site
  never reads dropped, which keeps it at 74 KB instead of 348 KB.

## Copy notes

- The gauge story's key facts still quoted two counts that move with the
  agency's list edits (rainfall stations and stations with no coordinates).
  Both had drifted since the copy was written, and the fix follows the cycle
  hire precedent: state what holds, leave the totals to the cards and the
  note.
