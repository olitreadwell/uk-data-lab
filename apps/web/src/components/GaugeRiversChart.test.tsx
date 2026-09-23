import { fireEvent, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import type { GaugeRiverCount } from '@/lib/gauge-data';

import { GaugeRiversChart } from './GaugeRiversChart';

expect.extend(toHaveNoViolations);

const RIVERS: GaugeRiverCount[] = [
  { riverName: 'River Thames', stationCount: 55 },
  { riverName: 'Tide', stationCount: 34 },
  { riverName: 'River Great Ouse', stationCount: 31 },
];

describe('GaugeRiversChart', () => {
  it('names the leading river in the accessible chart label', () => {
    render(<GaugeRiversChart rivers={RIVERS} />);
    expect(screen.getByRole('img')).toHaveAccessibleName(/River Thames leads with 55/);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GaugeRiversChart rivers={RIVERS} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('exposes the rivers in a keyboard-reachable table', () => {
    const { container } = render(<GaugeRiversChart rivers={RIVERS} />);
    const summary = container.querySelector('summary');
    if (summary === null) {
      throw new Error('Expected a chart data table summary');
    }
    fireEvent.click(summary);
    expect(screen.getByRole('columnheader', { name: 'River' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Gauges' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'River Thames' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '55' })).toBeInTheDocument();
  });

  it('renders a fallback label for an empty sample', () => {
    render(<GaugeRiversChart rivers={[]} />);
    expect(screen.getByRole('img')).toHaveAccessibleName(/rivers by number of gauges/i);
  });
});
