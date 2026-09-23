import {
  FSA_API_VERSION,
  FSA_API_VERSION_HEADER,
  FSA_AUTHORITIES_URL,
  parseFoodHygieneAuthorities,
  summarizeFoodHygieneAuthorities,
} from '@uklab/uk-sources';
import type { FoodHygieneSummary } from '@uklab/uk-sources';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/** The FSA register list answers in a few seconds; this is the build-time ceiling. */
export const FSA_LIVE_PROBE_TIMEOUT_MS = 30_000;

// Committed snapshot, so the static build still works when the FSA API is
// slow or unreachable from the build runner.
const FSA_SNAPSHOT_PATH = path.join(
  process.cwd(),
  'src/fixtures/food-hygiene-authorities-sample.json',
);

/** Fetches the register list with the build-time timeout and version header, or throws. */
async function fetchAuthoritiesJson(url: string): Promise<unknown> {
  const response = await globalThis.fetch(url, {
    // The page promises the numbers the source returns on the build day, so
    // never let Next's fetch cache serve a response from an earlier build.
    cache: 'no-store',
    headers: { [FSA_API_VERSION_HEADER]: FSA_API_VERSION },
    signal: AbortSignal.timeout(FSA_LIVE_PROBE_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }
  return response.json();
}

/** Reads a committed snapshot, or throws with the failing path. */
function readSnapshot(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, 'utf8')) as unknown;
}

/**
 * Reads the FSA food hygiene register list at build time.
 *
 * Falls back to the committed snapshot when the API is slow, blocked, or
 * unreachable. The fallback is logged, not swallowed.
 *
 * @returns register, establishment, and scheme counts for the story
 */
export async function fetchFoodHygieneSummary(): Promise<FoodHygieneSummary> {
  try {
    return summarizeFoodHygieneAuthorities(
      parseFoodHygieneAuthorities(await fetchAuthoritiesJson(FSA_AUTHORITIES_URL)),
    );
  } catch (error) {
    console.warn(
      `Falling back to the committed food hygiene snapshot: ${error instanceof Error ? error.message : String(error)}`,
    );
    return summarizeFoodHygieneAuthorities(
      parseFoodHygieneAuthorities(readSnapshot(FSA_SNAPSHOT_PATH)),
    );
  }
}
