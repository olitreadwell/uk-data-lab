# ORCHESTRATION.md: food-hygiene-registers

Built 2026-09-24, the third microsite, one day after the ONS catalogue story.

- The site had no unused vendored source left, so this iteration added one: the
  `food-hygiene-authorities` adapter went into `uk-open-data-connectors` first,
  on `feat/connectors/add_fsa_food_hygiene_adapter` (PR #16), with 13 unit
  tests and a committed fixture of 363 registers and 612,721 establishments.
- `npm run check` in the connectors repo (format, build, lint, type-check,
  tests with coverage) passes, and `RUN_SMOKE=1 npm run test:smoke` probes all
  four registered UK sources live.
- The package was vendored here with
  `node scripts/sync-connectors.mjs --from /tmp/connectors-fsa`, not edited by
  hand.
- The site side follows the ONS story: a fetch module with a committed snapshot
  fallback (`food-hygiene-data.ts`), a chart component with unit tests, a
  page-test block, and e2e smoke coverage that picks the route up from
  `MICROSITES`.

## Findings worth keeping

- The register endpoint returns 404 without the version header, which is easy
  to misread as a retired API. The adapter sends the header on every call and a
  test pins it.
- A bare call to the endpoint in a browser shows that 404, so the reference
  list points at the FSA help page rather than the raw endpoint.
- The gauge story needed a refresh in this iteration: three stations that were
  in yesterday's snapshot no longer appear in the agency list, and the total has
  moved again since (2,097 on 23 September, 2,095 on 24 September). The copy,
  the station counts in the docs, and both committed snapshots were updated to
  match the live list, and the gauge data note now says the total moves by a few
  stations between builds.
