import { describe, expect, it } from 'vitest';

import {
  formatCount,
  formatIsoDateLong,
  formatLevelMetres,
  formatRatePercent,
  formatSignedMetres,
  formatTrendLabel,
} from './uk-format';

describe('formatCount', () => {
  it('adds thousands separators', () => {
    expect(formatCount(2097)).toBe('2,097');
    expect(formatCount(55)).toBe('55');
  });
});

describe('formatLevelMetres', () => {
  it('keeps two decimals and the unit', () => {
    expect(formatLevelMetres(0.071)).toBe('0.07 m');
    expect(formatLevelMetres(-0.4)).toBe('-0.40 m');
  });
});

describe('formatSignedMetres', () => {
  it('marks a rise with a plus and a fall with a minus', () => {
    expect(formatSignedMetres(0.436)).toBe('+0.44 m');
    expect(formatSignedMetres(-0.12)).toBe('-0.12 m');
    expect(formatSignedMetres(0)).toBe('0.00 m');
  });
});

describe('formatTrendLabel', () => {
  it('names each trend in plain English', () => {
    expect(formatTrendLabel('rising')).toBe('rising');
    expect(formatTrendLabel('falling')).toBe('falling');
    expect(formatTrendLabel('steady')).toBe('steady');
    expect(formatTrendLabel('unknown')).toBe('no direction yet');
  });
});

describe('formatRatePercent', () => {
  it('writes the rate with a per cent sign and no padding', () => {
    expect(formatRatePercent(3.75)).toBe('3.75%');
    expect(formatRatePercent(0.1)).toBe('0.1%');
    expect(formatRatePercent(17)).toBe('17%');
  });

  it('keeps the decimals a historical rate was set at', () => {
    expect(formatRatePercent(5.9375)).toBe('5.9375%');
    expect(formatRatePercent(13.8438)).toBe('13.8438%');
  });
});

describe('formatIsoDateLong', () => {
  it('writes an ISO date out in full', () => {
    expect(formatIsoDateLong('2026-09-24')).toBe('24 September 2026');
    expect(formatIsoDateLong('1975-01-02')).toBe('2 January 1975');
  });
});
