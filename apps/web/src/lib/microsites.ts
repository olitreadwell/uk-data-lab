import type { MicrositeAccent } from '@/components/microsite-styles';
import type { MicrositeReference } from '@/components/MicrositeReferences';

import { withHiddenMicrositesRemoved } from './hidden-microsites';
import { PUBLISHED_MICROSITES } from './published-microsites';

/** Who publishes the underlying data for a microsite story. */
export type MicrositeDataSource =
  | 'Environment Agency'
  | 'Office for National Statistics (ONS)'
  | 'data.gov.uk'
  | 'Ordnance Survey'
  | 'Met Office'
  | 'Natural England'
  | 'Department for Transport'
  | 'NHS England'
  | 'British Geological Survey'
  | 'OpenStreetMap'
  | 'Wikipedia & Wikidata';

/** The main visualisation used by a microsite story. */
export type MicrositeChartType =
  | 'Line chart'
  | 'Bar chart'
  | 'Rank / slope'
  | 'Map'
  | 'Search & table'
  | 'Tree'
  | 'Pyramid'
  | 'Histogram'
  | 'Scatter'
  | 'Rose / polar'
  | 'Sunburst'
  | 'Streamgraph'
  | 'Cycle plot'
  | 'Dumbbell'
  | 'Ridgeline'
  | 'Waffle'
  | 'Parallel coordinates'
  | 'Tile grid'
  | 'Dot plot'
  | 'Choropleth'
  | 'Marimekko'
  | 'Pareto'
  | 'Heatmap'
  | 'Strip chart'
  | 'Bar-in-bar';

/** The subject area a microsite story belongs to. */
export type MicrositeCategory =
  | 'Agriculture & farming'
  | 'Biodiversity & nature'
  | 'Census & population'
  | 'Economy & business'
  | 'Education'
  | 'Energy & climate'
  | 'Environment & geography'
  | 'Health'
  | 'Open data & digital'
  | 'Society & community'
  | 'Transport';

/** URL slug for each microsite category, used for /category-slug/ routes. */
export const CATEGORY_SLUGS: Record<MicrositeCategory, string> = {
  'Agriculture & farming': 'agriculture',
  'Biodiversity & nature': 'biodiversity',
  'Census & population': 'census',
  'Economy & business': 'economy',
  Education: 'education',
  'Energy & climate': 'energy',
  'Environment & geography': 'environment',
  Health: 'health',
  'Open data & digital': 'open-data',
  'Society & community': 'society',
  Transport: 'transport',
};

/** Category slug for a microsite config. */
export function categorySlugFor(microsite: Pick<MicrositeConfig, 'category'>): string {
  return CATEGORY_SLUGS[microsite.category];
}

/** Category label for a category slug, or undefined when unknown. */
export function categoryLabelForSlug(slug: string): MicrositeCategory | undefined {
  return (Object.entries(CATEGORY_SLUGS) as [MicrositeCategory, string][]).find(
    ([, candidate]) => candidate === slug,
  )?.[0];
}

/** Canonical story path for a microsite: /category-slug/slug/. */
export function micrositePathFor(microsite: Pick<MicrositeConfig, 'slug' | 'category'>): string {
  return `/${CATEGORY_SLUGS[microsite.category]}/${microsite.slug}/`;
}

/** Other microsites in the same category, same data source ranked first. */
export function relatedMicrositesFor(
  microsite: Pick<MicrositeConfig, 'slug' | 'category' | 'dataSource'>,
  limit = 4,
): MicrositeConfig[] {
  return [...MICROSITES]
    .filter(
      (candidate) => candidate.slug !== microsite.slug && candidate.category === microsite.category,
    )
    .sort((first, second) => {
      const firstSameSource = first.dataSource === microsite.dataSource ? 0 : 1;
      const secondSameSource = second.dataSource === microsite.dataSource ? 0 : 1;
      return firstSameSource - secondSameSource;
    })
    .slice(0, limit);
}

/** Human-readable freshness line for one microsite, from its data note. */
export function freshnessLabelFor(microsite: Pick<MicrositeConfig, 'dataNote'>): string {
  return microsite.dataNote.includes('live from the browser')
    ? 'Live data, loaded from your browser'
    : 'Data fetched at deploy time; the site redeploys daily';
}

export interface MicrositeConfig {
  slug: string;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  paragraphs: string[];
  /** Three to five headline facts, pulled from the story's own numbers. */
  keyFacts: string[];
  /** One-line reading guide for the page's main chart. */
  howToRead: string;
  /** Canonical data source URL, reused from the reference list. */
  sourceUrl: string;
  accent: MicrositeAccent;
  dataSource: MicrositeDataSource;
  chartType: MicrositeChartType;
  category: MicrositeCategory;
  dataNote: string;
  references: MicrositeReference[];
}

export const CATEGORY_DETAILS: Record<MicrositeCategory, string> = {
  'Agriculture & farming': 'Farm sizes, crop areas, and livestock counts from the farm surveys.',
  'Biodiversity & nature':
    'Species records, protected sites, and the citizen-science datasets behind them.',
  'Census & population':
    'Who lives where, how old they are, and how the picture shifted between censuses.',
  'Economy & business': 'Prices, trade, employment, and the shape of the business register.',
  Education: 'Schools, pupils, and qualifications, open by local authority.',
  'Energy & climate': 'Generation, emissions, and the weather records that sit behind them.',
  'Environment & geography': 'Rivers, rainfall, coastlines, and the map underneath it all.',
  Health: 'Waiting lists, admissions, and public health counts at local level.',
  'Open data & digital': 'Live searches across the national data portals and their catalogues.',
  'Society & community': 'Local services, charities, and the things people rely on day to day.',
  Transport: 'Roads, rail, and the traffic counters that watch them.',
};

export const MICROSITES: MicrositeConfig[] = withHiddenMicrositesRemoved<MicrositeConfig>([
  {
    slug: 'gauge-index',
    keyFacts: [
      'River Thames: 55 gauges, more than any other river in the sample.',
      'The sample holds 2,097 stations spread across 808 named rivers.',
      'Rainfall shows up on eight of them; 2,075 publish a water level and 89 publish flow.',
    ],
    howToRead: 'Longer bars mean more gauges on that river; hover a bar for the exact count.',
    sourceUrl: 'https://environment.data.gov.uk/flood-monitoring/doc/reference',
    label: 'Gauge index',
    eyebrow: 'the gauge index',
    title: 'The River Thames carries more gauges than any other river in England.',
    description:
      'The Environment Agency publishes 2,097 monitoring stations. The River Thames holds 55 of them, more than any other river in the sample. Almost all of the network watches water level rather than rain.',
    paragraphs: [
      'The gauges exist to warn people about flooding. Most sit on a river or a stream and take a reading every 15 minutes. Where a station publishes flow as well as level, the flow is worked out from the level rather than measured on its own.',
      'Thirty-nine stations in the sample were closed or suspended on the snapshot date, and 202 carry no status at all. Nine more have no coordinates recorded, all of them groundwater boreholes, because the agency leaves the map position empty for those.',
      'The agency writes "Tide" in the river field for tidal monitoring sites. That is why it sits second in the chart without being a river.',
    ],
    accent: 'cyan',
    dataSource: 'Environment Agency',
    chartType: 'Bar chart',
    category: 'Environment & geography',
    dataNote:
      'Data: Environment Agency flood-monitoring API, /id/stations. The list holds the 2,097 rows the endpoint returned for _limit=3000 on 23 September 2026. The agency caps the response below the requested limit, so treat the count as a floor rather than the whole network. River names are as the agency publishes them, including "Tide" at tidal sites. The live level comes from Bourton Dickler on the River Dikler, which reports every 15 minutes in metres above ordnance datum.',
    references: [
      {
        label: 'Flood-monitoring API reference (Environment Agency)',
        url: 'https://environment.data.gov.uk/flood-monitoring/doc/reference',
        kind: 'data',
      },
      {
        label: 'Bourton Dickler station record (Environment Agency)',
        url: 'https://environment.data.gov.uk/flood-monitoring/id/stations/1029TH',
        kind: 'data',
      },
      {
        label: 'Check for flooding in England (GOV.UK)',
        url: 'https://www.gov.uk/check-flooding',
        kind: 'news',
      },
      {
        label: 'Open Government Licence v3.0',
        url: 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/',
        kind: 'licence',
      },
    ],
  },
  {
    slug: 'ons-dataset-catalogue',
    keyFacts: [
      '338 dataset records are listed, every one of them in state "published".',
      '310 of the 338 carry a last-updated stamp from 2023 or 2024.',
      '281 records are flagged as national statistics, 40 are not, and 17 leave the flag out.',
      'The tag "ltla" appears on 286 records, more than any other keyword.',
    ],
    howToRead:
      'Each bar is one year. Taller bars mean more dataset records carry that year in their last-updated stamp.',
    sourceUrl: 'https://api.beta.ons.gov.uk/v1/datasets?limit=1000',
    label: 'ONS catalogue',
    eyebrow: 'the ONS catalogue',
    title: 'The ONS dataset API lists 338 datasets, and 310 of them carry a 2023 or 2024 stamp.',
    description:
      'One keyless endpoint holds the ONS beta API dataset catalogue: 338 records, 281 of them flagged as national statistics, and 310 stamped 2023 or 2024 in the last-updated field.',
    paragraphs: [
      'The catalogue call is open. It needs no key and no login, and one request returned all 338 records.',
      'last_updated is the API stamp on the dataset record, not the day the data behind it was published. It moves when the record changes, which is why 180 records sit in 2023, 130 in 2024, and only 12 in 2025 or 2026.',
      'The national statistic flag is the ONS marking its own output against the Code of Practice for Statistics. 281 records carry it. Forty do not, and 17 leave the field out entirely.',
      'Keywords are thin. Eleven records list none at all, and one tag, ltla, covers 286 of the 338.',
    ],
    accent: 'teal',
    dataSource: 'Office for National Statistics (ONS)',
    chartType: 'Histogram',
    category: 'Open data & digital',
    dataNote:
      'Data: ONS beta API, /v1/datasets?limit=1000. The call returned 338 records on 23 September 2026, which is the whole catalogue: the response reports a total_count of 338 against a limit of 1000. last_updated is the timestamp the API holds for the dataset record, so it moves when the record changes rather than when the data behind it is released. If the API is unreachable at build time the page falls back to the committed snapshot in apps/web/src/fixtures/ons-datasets-sample.json and logs that it did.',
    references: [
      {
        label: 'ONS beta API dataset catalogue (Office for National Statistics)',
        url: 'https://api.beta.ons.gov.uk/v1/datasets?limit=1000',
        kind: 'data',
      },
      {
        label: 'ONS Developer Hub (Office for National Statistics)',
        url: 'https://developer.ons.gov.uk/',
        kind: 'data',
      },
      {
        label: 'The Code of Practice for Statistics (Office for Statistics Regulation)',
        url: 'https://osr.statisticsauthority.gov.uk/the-code-of-practice-for-statistics/',
        kind: 'data',
      },
      {
        label: 'Open Government Licence v3.0',
        url: 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/',
        kind: 'licence',
      },
    ],
  },
]).filter((microsite) => PUBLISHED_MICROSITES.includes(microsite.slug));
