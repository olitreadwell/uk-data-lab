import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BANK_RATE_LIVE_TIMEOUT_MS, fetchBankRateSummary } from './bank-rate-data';

/** The committed snapshot, as the CSV text the database returns. */
function snapshotCsv(): string {
  return readFileSync(path.join(process.cwd(), 'src/fixtures/bank-rate-sample.csv'), 'utf8');
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchBankRateSummary', () => {
  it('summarises the live CSV the database returns', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response('DATE,IUDBEDR\r\n02 Jan 1975,11.5\r\n03 Jan 1975,11.5\r\n06 Jan 1975,12\r\n'),
    );
    vi.stubGlobal('fetch', fetchImpl);
    const summary = await fetchBankRateSummary();
    expect(summary.observationCount).toBe(3);
    expect(summary.changeCount).toBe(1);
    expect(summary.highestSpell.ratePercent).toBe(12);
  });

  it('asks the database for the series up to today', async () => {
    const urls: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL | Request) => {
        urls.push(
          typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
        );
        return new Response(snapshotCsv());
      }),
    );
    await fetchBankRateSummary();
    const url = new URL(String(urls[0]));
    expect(url.searchParams.get('SeriesCodes')).toBe('IUDBEDR');
    expect(url.searchParams.get('Datefrom')).toBe('02/Jan/1975');
    expect(url.searchParams.get('Dateto')).toMatch(/^\d{2}\/[A-Z][a-z]{2}\/\d{4}$/);
  });

  it('falls back to the committed snapshot when the database is down', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('down', { status: 503 })),
    );
    const summary = await fetchBankRateSummary();
    expect(summary.observationCount).toBe(13077);
    expect(summary.longestSpell.dayCount).toBe(2709);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('committed Bank Rate snapshot'));
    warn.mockRestore();
  });

  it('falls back when the database answers with its error page', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('<html>ErrorPage</html>')),
    );
    const summary = await fetchBankRateSummary();
    expect(summary.highestSpell.ratePercent).toBe(17);
    warn.mockRestore();
  });

  it('gives the live read a timeout longer than the database takes', () => {
    expect(BANK_RATE_LIVE_TIMEOUT_MS).toBeGreaterThan(10_000);
  });
});
