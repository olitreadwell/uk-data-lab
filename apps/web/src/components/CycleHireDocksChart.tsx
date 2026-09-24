'use client';

import { useMemo } from 'react';
import { ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';

import type { DockSizeBucket } from '@/lib/cycle-hire-data';
import { formatCount } from '@/lib/uk-format';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

import { ChartDataTable } from './ChartDataTable';
import { ChartExplain } from './ChartNotes';

interface CycleHireDocksChartProps {
  /** One entry per dock size, smallest first. */
  buckets: DockSizeBucket[];
  /** Total stations, so the tooltip can say how many share a size. */
  stationCount: number;
}

/** One dot: a station at a dock size, stacked above the others its size. */
interface DockDot {
  dockCount: number;
  dotIndex: number;
}

/** How many dots sit in the tallest column, which sets the chart height. */
function tallestColumn(buckets: DockSizeBucket[]): number {
  return buckets.reduce((tallest, bucket) => Math.max(tallest, bucket.stationCount), 0);
}

/** The dot itself. A custom symbol keeps every dot the same small size. */
function DockSymbol({
  cx,
  cy,
}: {
  cx: number | undefined;
  cy: number | undefined;
}): React.ReactElement | null {
  if (cx === undefined || cy === undefined) {
    return null;
  }
  return <circle cx={cx} cy={cy} r={2.6} fill="var(--color-fg)" fillOpacity={0.75} />;
}

/** Tooltip shown while hovering (mouse) or scrubbing (touch) the chart. */
function CycleHireDocksTooltip({
  active,
  payload,
  buckets,
  stationCount,
}: TooltipContentProps & {
  buckets: DockSizeBucket[];
  stationCount: number;
}): React.ReactElement | null {
  if (!active || payload === undefined || payload.length === 0) {
    return null;
  }
  const dot = payload[0]?.payload as DockDot | undefined;
  if (dot === undefined) {
    return null;
  }
  const stationCountAtSize =
    buckets.find((bucket) => bucket.dockCount === dot.dockCount)?.stationCount ?? 0;
  return (
    <div
      data-testid="cycle-hire-docks-tooltip"
      role="status"
      aria-live="polite"
      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
    >
      <p className="numeral-paragraph-sm text-[var(--color-fg)]">
        {formatCount(dot.dockCount)} docking points
      </p>
      <p className="numeral-text-eyebrow text-[10px] text-[var(--color-muted)]">
        {formatCount(stationCountAtSize)} of the {formatCount(stationCount)} stations
      </p>
    </div>
  );
}

/**
 * Dot plot of every Santander Cycles docking station, one dot per station,
 * stacked at the number of docking points it holds. The tallest stacks are the
 * sizes most stations share; the few stations at the right hold 60 or more.
 */
export function CycleHireDocksChart({
  buckets,
  stationCount,
}: CycleHireDocksChartProps): React.ReactElement {
  const prefersReducedMotion = usePrefersReducedMotion();
  const dots = useMemo<DockDot[]>(
    () =>
      buckets.flatMap((bucket) =>
        Array.from({ length: bucket.stationCount }, (_unused, dotIndex) => ({
          dockCount: bucket.dockCount,
          dotIndex,
        })),
      ),
    [buckets],
  );

  const smallestBucket = buckets[0];
  const biggestBucket = buckets[buckets.length - 1];
  const label =
    biggestBucket === undefined
      ? 'Docking stations by number of docking points'
      : `Docking stations by number of docking points: ${stationCount} stations, the largest holding ${biggestBucket.dockCount}`;

  if (dots.length === 0) {
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

  return (
    <div>
      <div style={{ height: '360px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            role="img"
            aria-label={label}
            data={dots}
            margin={{ top: 8, right: 16, bottom: 24, left: 8 }}
          >
            <XAxis
              type="number"
              dataKey="dockCount"
              name="Docking points"
              domain={[(smallestBucket?.dockCount ?? 0) - 2, (biggestBucket?.dockCount ?? 0) + 2]}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
              label={{
                value: 'Docking points per station',
                position: 'insideBottomRight',
                offset: -12,
                fill: 'var(--color-muted)',
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="dotIndex"
              domain={[-2, tallestColumn(buckets) + 2]}
              hide
            />
            <Tooltip
              content={(tooltipProps) => (
                <CycleHireDocksTooltip
                  {...tooltipProps}
                  buckets={buckets}
                  stationCount={stationCount}
                />
              )}
              cursor={false}
            />
            <Scatter
              shape={DockSymbol}
              isAnimationActive={!prefersReducedMotion}
              fill="var(--color-fg)"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <ChartExplain heading="About the dots">
        Each dot is one docking station, stacked at the number of docking points it holds. The
        tallest stacks are the sizes most stations share.
      </ChartExplain>
      <ChartDataTable
        summary="View the dock sizes as a table"
        columns={[
          { key: 'dockCount', header: 'Docking points' },
          {
            key: 'stationCount',
            header: 'Stations',
            format: (value) => formatCount(value),
          },
        ]}
        rows={buckets}
      />
    </div>
  );
}
