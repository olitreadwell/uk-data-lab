import { describe, expect, it } from 'vitest';

import { formatCount, formatLevelMetres, formatSignedMetres, formatTrendLabel } from './uk-format';

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
