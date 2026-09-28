/**
 * Formats a whole-number count with thousands separators, e.g. "2,097".
 *
 * @param value - the raw count
 * @returns the formatted string
 */
export function formatCount(value: number): string {
  return value.toLocaleString('en-GB');
}

/**
 * Formats a water level in metres to two decimals, e.g. "0.07 m".
 *
 * @param value - the level in metres
 * @returns the formatted string
 */
export function formatLevelMetres(value: number): string {
  return `${value.toFixed(2)} m`;
}

/**
 * Formats a signed level change in metres, e.g. "+0.44 m" or "-0.12 m".
 *
 * @param value - the change in metres
 * @returns the formatted string
 */
export function formatSignedMetres(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)} m`;
}

/** Plain-English label for a reading trend. */
export function formatTrendLabel(trend: 'rising' | 'falling' | 'steady' | 'unknown'): string {
  switch (trend) {
    case 'rising':
      return 'rising';
    case 'falling':
      return 'falling';
    case 'steady':
      return 'steady';
    default:
      return 'no direction yet';
  }
}

/**
 * Formats a percentage rate as the Bank of England publishes it, e.g. "3.75%"
 * or "0.1%", keeping up to four decimals so a historical rate such as 5.9375%
 * reads as it was set.
 *
 * @param value - the rate in per cent
 * @returns the rate with a per cent sign
 */
export function formatRatePercent(value: number): string {
  const rate = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 4 }).format(value);
  return `${rate}%`;
}

/**
 * Formats an ISO date as a long UK date, e.g. "24 September 2026".
 *
 * @param isoDate - the date as YYYY-MM-DD
 * @returns the same day written out in full
 */
export function formatIsoDateLong(isoDate: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

/**
 * Formats a published month as a short UK label, e.g. "2026-07" to "Jul 2026".
 *
 * @param isoMonth - the month as YYYY-MM
 * @returns the same month written short, read in UTC
 */
export function formatIsoMonthShort(isoMonth: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoMonth}-01T00:00:00Z`));
}

/**
 * Formats a published month as a long UK label, e.g. "2026-07" to "July 2026".
 *
 * @param isoMonth - the month as YYYY-MM
 * @returns the same month written out in full, read in UTC
 */
export function formatIsoMonthLong(isoMonth: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoMonth}-01T00:00:00Z`));
}
