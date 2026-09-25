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

vi.mock('@/lib/cycle-hire-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/cycle-hire-data')>();
  return {
    ...actual,
    fetchCycleHireIndex: vi.fn().mockResolvedValue({
      stationCount: 798,
      dockCount: 20992,
      bikeCount: 8492,
      electricBikeCount: 967,
      sizeBuckets: [
        { dockCount: 10, stationCount: 1 },
        { dockCount: 24, stationCount: 3 },
        { dockCount: 63, stationCount: 1 },
      ],
      largestStations: [
        {
          id: 'BikePoints_532',
          name: 'Jubilee Plaza, Canary Wharf',
          dockCount: 63,
          bikeCount: 37,
          electricBikeCount: 1,
          emptyDockCount: 26,
          temporary: false,
        },
        {
          id: 'BikePoints_193',
          name: 'Bankside Mix, Bankside',
          dockCount: 60,
          bikeCount: 5,
          electricBikeCount: 0,
          emptyDockCount: 55,
          temporary: false,
        },
      ],
    }),
  };
});

vi.mock('@/lib/gauge-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/gauge-data')>();
  return {
    ...actual,
    fetchGaugeStationSample: vi.fn().mockResolvedValue([]),
    buildGaugeStationIndex: vi.fn().mockReturnValue({
      stationCount: 2095,
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

vi.mock('@/lib/food-hygiene-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/food-hygiene-data')>();
  return {
    ...actual,
    fetchFoodHygieneSummary: vi.fn().mockResolvedValue({
      authorityCount: 363,
      establishmentCount: 612721,
      fhrsAuthorityCount: 331,
      fhisAuthorityCount: 32,
      largestAuthorities: [
        {
          localAuthorityId: 374,
          localAuthorityCode: '402',
          localAuthorityName: 'Birmingham',
          establishmentCount: 10239,
          scheme: 'fhrs' as const,
        },
        {
          localAuthorityId: 397,
          localAuthorityCode: '413',
          localAuthorityName: 'Leeds',
          establishmentCount: 7428,
          scheme: 'fhrs' as const,
        },
      ],
    }),
  };
});

vi.mock('@/lib/planning-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/planning-data')>();
  return {
    ...actual,
    fetchPlanningDatasetSummary: vi.fn().mockResolvedValue({
      datasetCount: 201,
      entityCount: 25355887,
      emptyDatasetCount: 84,
      largestDatasets: [
        {
          dataset: 'title-boundary',
          name: 'Title boundary',
          entityCount: 22740586,
          themes: ['administrative', 'housing'],
          typology: 'geography',
          phase: 'beta',
          licence: 'ogl3',
        },
        {
          dataset: 'flood-risk-zone',
          name: 'Flood risk zone',
          entityCount: 780636,
          themes: ['environment'],
          typology: 'geography',
          phase: 'beta',
          licence: 'ogl3',
        },
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
    expect(html).toContain('The agency marks some stations as closed or suspended');
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
    expect(html).toContain('2,095');
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

  it('renders the food hygiene story with narrative, chart, and sources', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('food-hygiene-registers'))} />,
    );
    const html = await new Response(stream).text();
    expect(html).toContain('Birmingham lists 10,239 food outlets');
    expect(html).toContain('Scotland runs a separate scheme');
    expect(html).toContain('Key facts');
    expect(html).toContain('How to read this chart');
    expect(html).toContain('Sources and further reading');
    expect(html).toContain('Food Hygiene Rating Scheme API help');
    expect(html).toContain('Food Hygiene Information Scheme');
    expect(html).toContain('href="/health"');
    expect(html).toContain('Food hygiene registers');
    expect(html.match(/<h1[^>]*>/g) ?? []).toHaveLength(1);
  });

  it('reads the headline numbers out of the fetched registers', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('food-hygiene-registers'))} />,
    );
    const html = await new Response(stream).text();
    expect(html).toContain('data-testid="food-hygiene-establishments" data-value="612721"');
    expect(html).toContain('data-testid="food-hygiene-registers" data-value="363"');
    expect(html).toContain('data-testid="food-hygiene-largest-register" data-value="10239"');
    expect(html).toContain('View the registers as a table');
    expect(html).toContain('>Birmingham<');
    expect(html).toContain('>10,239<');
  });

  it('returns a unique document title for the food hygiene microsite', async () => {
    await expect(
      generateMetadata({ params: Promise.resolve(paramsFor('food-hygiene-registers')) }),
    ).resolves.toEqual({
      title: 'Food hygiene registers - uk-data-lab',
      description: expect.any(String),
      openGraph: {
        title: 'Food hygiene registers - uk-data-lab',
        description: expect.any(String),
        url: '/health/food-hygiene-registers/',
        type: 'article',
      },
    });
  });

  it('renders the cycle hire story with narrative, chart, and sources', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('cycle-hire-docks'))} />,
    );
    const html = await new Response(stream).text();
    expect(html).toContain('798 cycle hire docks hold space for 20 to 39 bikes');
    expect(html).toContain('A docking point is the fixed part of the network');
    expect(html).toContain('Key facts');
    expect(html).toContain('How to read this chart');
    expect(html).toContain('Sources and further reading');
    expect(html).toContain('BikePoint docking station API');
    expect(html).toContain('TfL open data terms and licences');
    expect(html).toContain('href="/transport"');
    expect(html).toContain('Cycle hire docks');
    expect(html.match(/<h1[^>]*>/g) ?? []).toHaveLength(1);
  });

  it('reads the headline numbers out of the fetched docking stations', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('cycle-hire-docks'))} />,
    );
    const html = await new Response(stream).text();
    expect(html).toContain('data-testid="cycle-hire-stations" data-value="798"');
    expect(html).toContain('data-testid="cycle-hire-docking-points" data-value="20992"');
    expect(html).toContain('data-testid="cycle-hire-largest-station" data-value="63"');
    expect(html).toContain('View the dock sizes as a table');
    expect(html).toContain('Jubilee Plaza, Canary Wharf');
    expect(html).toContain('>20,992<');
  });

  it('returns a unique document title for the cycle hire microsite', async () => {
    await expect(
      generateMetadata({ params: Promise.resolve(paramsFor('cycle-hire-docks')) }),
    ).resolves.toEqual({
      title: 'Cycle hire docks - uk-data-lab',
      description: expect.any(String),
      openGraph: {
        title: 'Cycle hire docks - uk-data-lab',
        description: expect.any(String),
        url: '/transport/cycle-hire-docks/',
        type: 'article',
      },
    });
  });

  it('renders the planning datasets story with narrative, chart, and sources', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('planning-datasets'))} />,
    );
    const html = await new Response(stream).text();
    expect(html).toContain('nearly nine in ten of the records');
    expect(html).toContain('The ranking is lopsided');
    expect(html).toContain('Key facts');
    expect(html).toContain('How to read this chart');
    expect(html).toContain('Sources and further reading');
    expect(html).toContain('Planning Data API documentation');
    expect(html).toContain('Open Government Licence v3.0');
    expect(html).toContain('href="/open-data"');
    expect(html).toContain('Planning datasets');
    expect(html.match(/<h1[^>]*>/g) ?? []).toHaveLength(1);
  });

  it('reads the headline numbers out of the fetched dataset catalogue', async () => {
    const stream = await renderToReadableStream(
      <MicrositePage params={Promise.resolve(paramsFor('planning-datasets'))} />,
    );
    const html = await new Response(stream).text();
    expect(html).toContain('data-testid="planning-datasets" data-value="201"');
    expect(html).toContain('data-testid="planning-records" data-value="25355887"');
    expect(html).toContain('data-testid="planning-largest-dataset" data-value="22740586"');
    expect(html).toContain('View the largest datasets as a table');
    expect(html).toContain('Title boundary');
    expect(html).toContain('>22,740,586<');
  });

  it('returns a unique document title for the planning datasets microsite', async () => {
    await expect(
      generateMetadata({ params: Promise.resolve(paramsFor('planning-datasets')) }),
    ).resolves.toEqual({
      title: 'Planning datasets - uk-data-lab',
      description: expect.any(String),
      openGraph: {
        title: 'Planning datasets - uk-data-lab',
        description: expect.any(String),
        url: '/open-data/planning-datasets/',
        type: 'article',
      },
    });
  });
});
