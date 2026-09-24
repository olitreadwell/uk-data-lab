# ORCHESTRATION.md: cycle-hire-docks

Built 2026-09-25, the fourth microsite, one day after the food hygiene story.

- The vendored sources were all in use, so this iteration added one:
  `tfl-bike-points` went into `uk-open-data-connectors` first, on
  `feat/connectors/add_tfl_bike_point_adapter` (PR #19, stacked on the FSA PR
  #16 because the vendored copy has to carry both adapters), with 18 unit tests
  and a six-station fixture.
- `npm run check` in the connectors repo (format, build, lint, type-check,
  tests with coverage) passes, and `RUN_SMOKE=1 npm run test:smoke` probes all
  five registered UK sources live.
- The package was vendored here with
  `node scripts/sync-connectors.mjs --from /tmp/connectors-tfl`, not edited by
  hand.
- The site side follows the food hygiene story: a fetch module with a
  committed snapshot fallback (`cycle-hire-data.ts`), a chart component with
  unit tests, a page-test block, and e2e coverage that picks the route up from
  `MICROSITES`.

## Findings worth keeping

- The station counts arrive as strings inside a key/value property list, so a
  missing key is the realistic failure rather than a wrong type. The parser
  throws with the station name in the message.
- TfL leaves spaces before commas in some station names ("River Street ,
  Clerkenwell"). The adapter tidies the spacing only, and a test pins it.
- The audit found the real reason the published numbers looked stale: every
  build-time fetch carried `cache: 'no-store'`, which Next reads as a dynamic
  fetch. The static export refuses to prerender a route that makes one, so
  every story fell back to its committed snapshot on every build. The failure
  was invisible because the snapshots had been refreshed the previous day. All
  five fetches now use `next: { revalidate: 1 }`, which prerenders and still
  re-reads each source on the next build.
- The published stories also needed a copy refresh: the agency gauge list had
  moved again (2,095 on 24 September, 2,093 on 25 September) and the FSA
  register total had risen by 51 establishments. The gauge prose no longer
  quotes the station total at all, because the count flickers between calls
  minutes apart, and the food prose rounds the establishment total to "more
  than 612,000". The source notes are now filled at build time from the same
  read the chart draws, so their totals and their date always match the page.
- The first chart attempt rendered no dots and no accessible label: a
  `ScatterChart` needs the `ResponsiveContainer` wrapper the bar charts use,
  otherwise the wrapper renders zero-sized and the aria-label never lands.
