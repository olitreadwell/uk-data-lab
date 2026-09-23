import { renderToReadableStream } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { CATEGORY_SLUGS, MICROSITES } from '@/lib/microsites';

import MicrositePage, { generateMetadata } from './page';

/** Builds the category/slug params for a microsite, or a miss for unknown slugs. */
function paramsFor(slug: string): { category: string; slug: string } {
  const microsite = MICROSITES.find((candidate) => candidate.slug === slug);
  return {
    category: microsite === undefined ? 'nope' : CATEGORY_SLUGS[microsite.category],
    slug,
  };
}

const notFoundMock = vi.fn();
vi.mock('next/navigation', () => ({
  notFound: (): never => {
    notFoundMock();
    throw new Error('NEXT_NOT_FOUND');
  },
}));

vi.mock('@/lib/gauge-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/gauge-data')>();
  return {
    ...actual,
    fetchGaugeStationSample: vi.fn().mockResolvedValue([]),
    buildGaugeStationIndex: vi.fn().mockReturnValue({
      stationCount: 2097,
      riverCount: 808,
      measureCount: 2933,
      topRivers: [
        { riverName: 'River Thames', stationCount: 55 },
        { riverName: 'Tide', stationCount: 34 },
      ],
    }),
    fetchGaugeLiveLevel: vi.fn().mockResolvedValue({
      stationReference: '1029TH',
      stationLabel: 'Bourton Dickler',
      measureId: 'm1',
      latestLevelMetres: 0.071,
      latestReadingTime: '2026-09-23T08:00:00Z',
      changeMetres: 0.003,
      windowHours: 25,
      trend: 'steady' as const,
    }),
  };
});

vi.mock('@/lib/ons-catalogue-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/ons-catalogue-data')>();
  return {
    ...actual,
    fetchOnsCatalogueSummary: vi.fn().mockResolvedValue({
      datasetCount: 338,
      nationalStatisticCount: 281,
      unflaggedCount: 17,
      yearCounts: [
        { year: '2022', datasetCount: 4 },
        { year: '2023', datasetCount: 180 },
        { year: '2024', datasetCount: 130 },
        { year: '2026', datasetCount: 10 },
      ],
    }),
  };
});

describe('MicrositePage', () => {
  it('renders the gauge story with narrative, chart, and sources', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('gauge-index'))} />,
    );
    const html = await new Response(stream).text();
    expect(html).toContain('more gauges than any other river in England');
    expect(html).toContain('Thirty-nine stations');
    expect(html).toContain('Key facts');
    expect(html).toContain('How to read this chart');
    expect(html).toContain('Open source data');
    expect(html).toContain('Sources and further reading');
    expect(html).toContain('Flood-monitoring API reference');
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html).toContain('href="/environment"');
    expect(html).toContain('Gauge index');
    expect(html.match(/<h1[^>]*>/g) ?? []).toHaveLength(1);
  });

  it('reads the headline numbers out of the fetched index', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('gauge-index'))} />,
    );
    const html = await new Response(stream).text();
    expect(html).toContain('2,097');
    expect(html).toContain('River Thames');
    expect(html).toContain('Bourton Dickler, steady');
  });

  it('renders exactly one h1 with the microsite title before any h2', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('gauge-index'))} />,
    );
    const html = await new Response(stream).text();
    const h1s = html.match(/<h1[^>]*>(.*?)<\/h1>/g) ?? [];
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toContain('more gauges than any other river in England');
    const headingIndexes = ['<h1', '<h2', '<h3', '<h4', '<h5', '<h6']
      .map((tag) => html.indexOf(tag))
      .filter((index) => index !== -1);
    expect(Math.min(...headingIndexes)).toBe(html.indexOf('<h1'));
  });

  it('returns a unique document title for the gauge microsite', async () => {
    await expect(
      generateMetadata({ params: Promise.resolve(paramsFor('gauge-index')) }),
    ).resolves.toEqual({
      title: 'Gauge index - uk-data-lab',
      description: expect.any(String),
      openGraph: {
        title: 'Gauge index - uk-data-lab',
        description: expect.any(String),
        url: '/environment/gauge-index/',
        type: 'article',
      },
    });
  });

  it('returns a generic title for an unknown microsite', async () => {
    await expect(generateMetadata({ params: Promise.resolve(paramsFor('nope')) })).resolves.toEqual(
      {
        title: 'uk-data-lab',
      },
    );
  });

  it('renders the ONS catalogue story with narrative, chart, and sources', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('ons-dataset-catalogue'))} />,
    );
    const html = await new Response(stream).text();
    expect(html).toContain('The ONS dataset API lists 338 datasets');
    expect(html).toContain('The national statistic flag is the ONS marking its own output');
    expect(html).toContain('Key facts');
    expect(html).toContain('How to read this chart');
    expect(html).toContain('Sources and further reading');
    expect(html).toContain('ONS Developer Hub');
    expect(html).toContain('href="/open-data"');
    expect(html).toContain('ONS catalogue');
    expect(html.match(/<h1[^>]*>/g) ?? []).toHaveLength(1);
  });

  it('reads the headline numbers out of the fetched catalogue', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('ons-dataset-catalogue'))} />,
    );
    const html = await new Response(stream).text();
    expect(html).toContain('data-testid="ons-datasets" data-value="338"');
    expect(html).toContain('data-testid="ons-stamped-recently" data-value="310"');
    expect(html).toContain('data-testid="ons-national-statistics" data-value="281"');
    expect(html).toContain('View the years as a table');
    expect(html).toContain('>2023<');
    expect(html).toContain('>180<');
  });

  it('returns a unique document title for the ONS catalogue microsite', async () => {
    await expect(
      generateMetadata({ params: Promise.resolve(paramsFor('ons-dataset-catalogue')) }),
    ).resolves.toEqual({
      title: 'ONS catalogue - uk-data-lab',
      description: expect.any(String),
      openGraph: {
        title: 'ONS catalogue - uk-data-lab',
        description: expect.any(String),
        url: '/open-data/ons-dataset-catalogue/',
        type: 'article',
      },
    });
  });
});
