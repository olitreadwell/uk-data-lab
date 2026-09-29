import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import type { CarbonIntensityDay, CarbonIntensitySlotProfile } from '@/lib/carbon-intensity-data';

import { CarbonIntensityHeatmap } from './CarbonIntensityHeatmap';

expect.extend(toHaveNoViolations);

/** One day with a reading in the first two columns and nothing after them. */
function day(date: string, label: string, intensities: number[]): CarbonIntensityDay {
  return {
    date,
    label,
    slots: Array.from({ length: 48 }, (_unused, slot) => {
      const intensity = intensities[slot];
      return intensity === undefined ? null : { intensity, index: 'moderate' };
    }),
  };
}

const DAYS: CarbonIntensityDay[] = [
  day('2026-09-27', 'Sun 27 Sept', [140, 150]),
  day('2026-09-28', 'Mon 28 Sept', [70, 60]),
];

const PROFILE: CarbonIntensitySlotProfile[] = [
  {
    label: '00:00',
    dayCount: 2,
    averageIntensity: 105,
    lowestIntensity: 70,
    highestIntensity: 140,
  },
  {
    label: '00:30',
    dayCount: 2,
    averageIntensity: 105,
    lowestIntensity: 60,
    highestIntensity: 150,
  },
];

const SUMMARY = {
  periodCount: 1440,
  averageIntensity: 108,
  lowestIntensity: 27,
  highestIntensity: 235,
  bandCounts: [
    { index: 'very low' as const, periodCount: 0 },
    { index: 'low' as const, periodCount: 634 },
    { index: 'moderate' as const, periodCount: 621 },
    { index: 'high' as const, periodCount: 183 },
    { index: 'very high' as const, periodCount: 2 },
  ],
};

describe('CarbonIntensityHeatmap', () => {
  it('names the window and its range for screen readers', () => {
    render(<CarbonIntensityHeatmap days={DAYS} profile={PROFILE} summary={SUMMARY} />);
    const chart = screen.getByRole('img', {
      name: /Half-hourly carbon intensity for Great Britain/,
    });
    expect(chart.getAttribute('aria-label')).toContain('1,440 readings');
    expect(chart.getAttribute('aria-label')).toContain('from Sun 27 Sept to Mon 28 Sept');
  });

  it('draws one cell per reading, labelled with its day, half hour, and grade', () => {
    const { container } = render(
      <CarbonIntensityHeatmap days={DAYS} profile={PROFILE} summary={SUMMARY} />,
    );
    expect(container.querySelectorAll('rect')).toHaveLength(1 + 4);
    const titles = [...container.querySelectorAll('rect > title')].map(
      (title) => title.textContent ?? '',
    );
    expect(titles).toContain('Sun 27 Sept, 00:30: 150 gCO2/kWh (moderate)');
    expect(titles).toContain('Mon 28 Sept, 00:00: 70 gCO2/kWh (moderate)');
  });

  it('offers the half hours as a table and the grades as a key', () => {
    const { container } = render(
      <CarbonIntensityHeatmap days={DAYS} profile={PROFILE} summary={SUMMARY} />,
    );
    expect(container.querySelector('summary')?.textContent).toBe('View the half hours as a table');
    expect(screen.getByText('low: 634 half hours')).toBeTruthy();
    expect(screen.getByText('very high: 2 half hours')).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <CarbonIntensityHeatmap days={DAYS} profile={PROFILE} summary={SUMMARY} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
