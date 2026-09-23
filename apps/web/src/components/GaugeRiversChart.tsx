'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';

import type { GaugeRiverCount } from '@/lib/gauge-data';
import { formatCount } from '@/lib/uk-format';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

import { ChartDataTable } from './ChartDataTable';
import { ChartExplain } from './ChartNotes';

interface GaugeRiversChartProps {
  rivers: GaugeRiverCount[];
}

/** Tooltip shown while hovering (mouse) or scrubbing (touch) the chart. */
function GaugeRiversTooltip({ active, payload }: TooltipContentProps): React.ReactElement | null {
  if (!active || payload === undefined || payload.length === 0) {
    return null;
  }
  const row = payload[0]?.payload as GaugeRiverCount | undefined;
  if (row === undefined) {
    return null;
  }
  return (
    <div
      data-testid="gauge-rivers-tooltip"
      role="status"
      aria-live="polite"
      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
    >
      <p className="numeral-paragraph-sm text-[var(--color-fg)]">{row.riverName}</p>
      <p className="numeral-text-eyebrow text-[10px] text-[var(--color-muted)]">
        {formatCount(row.stationCount)} gauges
      </p>
    </div>
  );
}

/**
 * Horizontal bar chart of the rivers carrying the most gauges. The river with
 * the longest bar has the most monitoring stations in the sample.
 */
export function GaugeRiversChart({ rivers }: GaugeRiversChartProps): React.ReactElement {
  const prefersReducedMotion = usePrefersReducedMotion();
  const busiest = rivers[0];

  const label =
    busiest === undefined
      ? 'Rivers by number of gauges'
      : `Rivers by number of gauges: ${busiest.riverName} leads with ${busiest.stationCount}`;

  if (rivers.length === 0) {
    return (
      <svg
        role="img"
        aria-label={label}
        viewBox="0 0 720 240"
        className="mx-auto h-auto max-h-[clamp(320px,46vh,560px)] w-full"
      >
        <title>{label}</title>
      </svg>
    );
  }

  const chartHeight = Math.max(240, rivers.length * 34);

  return (
    <div style={{ height: `${chartHeight}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          role="img"
          aria-label={label}
          data={rivers}
          layout="vertical"
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
        >
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="riverName"
            width={150}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
          />
          <Tooltip content={GaugeRiversTooltip} cursor={{ fill: 'var(--color-border)' }} />
          <Bar
            dataKey="stationCount"
            isAnimationActive={!prefersReducedMotion}
            fill="var(--color-fg)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <ChartExplain>Longer bars mean more gauges on that river.</ChartExplain>
      <ChartDataTable
        summary="View the rivers as a table"
        columns={[
          { key: 'riverName', header: 'River' },
          { key: 'stationCount', header: 'Gauges', format: (value) => formatCount(Number(value)) },
        ]}
        rows={rivers}
      />
    </div>
  );
}
