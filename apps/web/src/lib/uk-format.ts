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
