import { fireEvent, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import type { DockSizeBucket } from '@/lib/cycle-hire-data';

import { CycleHireDocksChart } from './CycleHireDocksChart';

expect.extend(toHaveNoViolations);

const BUCKETS: DockSizeBucket[] = [
  { dockCount: 10, stationCount: 1 },
  { dockCount: 24, stationCount: 3 },
  { dockCount: 63, stationCount: 1 },
];

const STATION_COUNT = 5;

describe('CycleHireDocksChart', () => {
  it('names the biggest dock in the accessible chart label', () => {
    render(<CycleHireDocksChart buckets={BUCKETS} stationCount={STATION_COUNT} />);
    expect(screen.getByRole('img')).toHaveAccessibleName(/5 stations, the largest holding 63/);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <CycleHireDocksChart buckets={BUCKETS} stationCount={STATION_COUNT} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('exposes the dock sizes in a keyboard-reachable table', () => {
    const { container } = render(
      <CycleHireDocksChart buckets={BUCKETS} stationCount={STATION_COUNT} />,
    );
    const summary = container.querySelector('summary');
    if (summary === null) {
      throw new Error('Expected a chart data table summary');
    }
    fireEvent.click(summary);
    expect(screen.getByRole('columnheader', { name: 'Docking points' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Stations' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: '63' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '3' })).toBeInTheDocument();
  });

  it('renders a fallback label for an empty station list', () => {
    render(<CycleHireDocksChart buckets={[]} stationCount={0} />);
    expect(screen.getByRole('img')).toHaveAccessibleName(/docking stations by number of/i);
  });
});
