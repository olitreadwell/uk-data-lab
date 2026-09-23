# ORCHESTRATION.md — ons-dataset-catalogue

Built 2026-09-23, one day after the gauge story, to prove the second half of
the three-repo chain: a source that had no adapter yet.

- The adapter went into `uk-open-data-connectors` first, on
  `feat/connectors/add_ons_dataset_catalogue_adapter`, with 12 unit tests and
  a committed fixture. PR #6 stacks on the flood-monitoring PR #2, because the
  vendored copy in this repo has to carry both adapters.
- `npm run check` in the connectors repo (format, build, lint, type-check,
  tests with coverage) passes, and `RUN_SMOKE=1 npm run test:smoke` probes all
  three registered sources live.
- The package was vendored here with `node scripts/sync-connectors.mjs`, not
  edited by hand.
- The site side follows the gauge story: a fetch module with a committed
  snapshot fallback (`ons-catalogue-data.ts`), a chart component with unit
  tests, a page-test block, and e2e coverage that picks the route up from
  `MICROSITES` automatically.

## Findings worth keeping

- The catalogue list endpoint and the per-dataset endpoint agree: for
  `wellbeing-quarterly` both report `latest_version` id 9 and the same
  `last_updated` stamp, so the list is not a stale cache.
- 289 of the 338 records leave `release_frequency` out, which ruled it out as
  the chart for this story.
- The page now fetches per story rather than per page. The gauge story used to
  fetch at the top of the route component, which would have made the ONS page
  depend on the Environment Agency API.
