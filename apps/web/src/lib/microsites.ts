import type { MicrositeAccent } from '@/components/microsite-styles';
import type { MicrositeReference } from '@/components/MicrositeReferences';

import { withHiddenMicrositesRemoved } from './hidden-microsites';
import { PUBLISHED_MICROSITES } from './published-microsites';

/** Who publishes the underlying data for a microsite story. */
export type MicrositeDataSource =
  | 'Environment Agency'
  | 'Office for National Statistics (ONS)'
  | 'Food Standards Agency'
  | 'data.gov.uk'
  | 'Ordnance Survey'
  | 'Met Office'
  | 'Natural England'
  | 'Department for Transport'
  | 'NHS England'
  | 'British Geological Survey'
  | 'Transport for London'
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

/** Build day in long form, for the "as of" line in a story's source note. */
export function formatBuildDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  }).format(now);
}

/**
 * Fills a story's source note with the figures from this build.
 *
 * The note is the one place a story states exact totals, and those totals move
 * between builds, so every moving figure is a `{token}` filled from the same
 * read the chart draws: a static note would quote last build's numbers.
 *
 * @param note - the note, with `{token}` placeholders
 * @param values - the build-time values to substitute
 * @returns the note with every placeholder replaced
 */
export function fillStoryDataNote(note: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    note,
  );
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
      'The sample spreads across 808 named rivers.',
      'Rainfall shows up on eight stations, and 89 publish flow.',
      'Nine stations have no coordinates recorded, all of them groundwater boreholes.',
    ],
    howToRead: 'Longer bars mean more gauges on that river; hover a bar for the exact count.',
    sourceUrl: 'https://environment.data.gov.uk/flood-monitoring/doc/reference',
    label: 'Gauge index',
    eyebrow: 'the gauge index',
    title: 'The River Thames carries more gauges than any other river in England.',
    description:
      "The Environment Agency's flood-monitoring list runs to thousands of stations across England. The River Thames holds 55 of them, more than any other river in the sample, and almost all of the network watches water level rather than rain.",
    paragraphs: [
      'The gauges exist to warn people about flooding. Most sit on a river or a stream and take a reading every 15 minutes. Where a station publishes flow as well as level, the flow is worked out from the level rather than measured on its own.',
      'The agency marks some stations as closed or suspended, and leaves the status field empty on others, so those counts move as the list is edited. Nine stations have no coordinates recorded, all of them groundwater boreholes, because the agency leaves the map position empty for those.',
      'The agency writes "Tide" in the river field for tidal monitoring sites. That is why it sits second in the chart without being a river.',
    ],
    accent: 'cyan',
    dataSource: 'Environment Agency',
    chartType: 'Bar chart',
    category: 'Environment & geography',
    dataNote:
      'Data: Environment Agency flood-monitoring API, /id/stations. The list holds the {stationCount} rows the endpoint returned for _limit=3000 on {asOf}. The agency caps the response below the requested limit, so treat the count as a floor rather than the whole network. The agency adds and removes stations through the day, so the total moves by a few between builds. River names are as the agency publishes them, including "Tide" at tidal sites. The live level comes from Bourton Dickler on the River Dikler, which reports every 15 minutes in metres above ordnance datum.',
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
      'Data: ONS beta API, /v1/datasets?limit=1000. The call returned {datasetCount} records on {asOf}, which is the whole catalogue: the response reports a total_count of {datasetCount} against a limit of 1000. last_updated is the timestamp the API holds for the dataset record, so it moves when the record changes rather than when the data behind it is released. If the API is unreachable at build time the page falls back to the committed snapshot in apps/web/src/fixtures/ons-datasets-sample.json and logs that it did.',
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
  {
    slug: 'food-hygiene-registers',
    keyFacts: [
      'Birmingham: 10,239 establishments, the largest register in the country.',
      '363 registers between them hold more than 612,000 establishments.',
      '331 registers run the five-point rating scheme; the 32 Scottish ones run pass or improve.',
    ],
    howToRead:
      'Longer bars mean more establishments on that register; hover a bar for the exact count.',
    sourceUrl: 'https://api.ratings.food.gov.uk/help',
    label: 'Food hygiene registers',
    eyebrow: 'the food hygiene registers',
    title: 'Birmingham lists 10,239 food outlets, more than any other register in the UK.',
    description:
      'The Food Standards Agency publishes 363 local authority food hygiene registers holding more than 612,000 establishments. Birmingham holds the most at 10,239, and the 32 Scottish registers run their own scheme.',
    paragraphs: [
      'Every food business sits on a register kept by its local authority, and the Food Standards Agency collects those registers into one list with a count of establishments against each one. The count is premises on the register, not premises that have been inspected.',
      'Scotland runs a separate scheme. Its 32 registers report pass or improve rather than a score out of five, so the FSA files them under a different scheme type from the 331 registers elsewhere in the UK.',
      'The registers vary in size. River Tees holds 3 establishments and Hull and Goole Port holds 5, while the median register holds 1,317. Those two smallest registers cover port health rather than a local authority district.',
    ],
    accent: 'amber',
    dataSource: 'Food Standards Agency',
    chartType: 'Bar chart',
    category: 'Health',
    dataNote:
      'Data: Food Standards Agency Food Hygiene Rating Scheme API, /Authorities/basic, called with the x-api-version: 2 header the FSA requires. The call returned {registerCount} registers holding {establishmentCount} establishments on {asOf}. Establishment counts are the FSA totals for each register, and they count premises on the register rather than premises inspected. If the API is unreachable at build time the page falls back to the committed snapshot in apps/web/src/fixtures/food-hygiene-authorities-sample.json and logs that it did.',
    references: [
      {
        label: 'Food Hygiene Rating Scheme API help (Food Standards Agency)',
        url: 'https://api.ratings.food.gov.uk/help',
        kind: 'data',
      },
      {
        label: 'Food hygiene ratings open data (Food Standards Agency)',
        url: 'https://ratings.food.gov.uk/open-data',
        kind: 'data',
      },
      {
        label: 'Food Hygiene Information Scheme (Food Standards Scotland)',
        url: 'https://www.foodstandards.gov.scot/consumer-advice/fhis',
        kind: 'data',
      },
      {
        label: 'Open Government Licence v3.0',
        url: 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/',
        kind: 'licence',
      },
    ],
  },
  {
    slug: 'cycle-hire-docks',
    keyFacts: [
      'Jubilee Plaza at Canary Wharf: 63 docking points, the largest station in London.',
      '798 docking stations hold 20,992 docking points between them.',
      '182 stations hold fewer than 20 docking points, 551 hold between 20 and 39, and two hold 60 or more.',
      'A docking point is the space a bike locks into, not the bike parked in it.',
    ],
    howToRead:
      'Each dot is one docking station, stacked at the number of docking points it holds; taller stacks mean more stations of that size.',
    sourceUrl: 'https://api.tfl.gov.uk/BikePoint',
    label: 'Cycle hire docks',
    eyebrow: 'the cycle hire docks',
    title: "Most of London's 798 cycle hire docks hold space for 20 to 39 bikes.",
    description:
      'Transport for London lists 798 Santander Cycles docking stations holding 20,992 docking points. Jubilee Plaza at Canary Wharf is the biggest at 63, and only one other station holds 60 or more.',
    paragraphs: [
      'A docking point is the fixed part of the network: the post a bike locks into. TfL reports the docked bikes and the empty docks in the same call, and both move through the day, so the docking points are what the shape of the network is measured in.',
      'Most stations are small. 551 of the 798 hold between 20 and 39 docking points, and 182 hold fewer than 20. Two hold 60 or more, both on the busy side of central London: Jubilee Plaza at Canary Wharf with 63 and Bankside Mix with 60.',
      'The smallest station is Royal Avenue 2 in Chelsea with 10 docking points, a sixth of the size of the biggest. TfL counts electric bikes in the same list, so the bikes docked at a station split into standard and electric.',
    ],
    accent: 'sky',
    dataSource: 'Transport for London',
    chartType: 'Dot plot',
    category: 'Transport',
    dataNote:
      'Data: Transport for London Unified API, /BikePoint. The call returned {stationCount} docking stations holding {dockCount} docking points on {asOf}. A docking point is a space a bike locks into, so the counts describe capacity rather than the bikes in them; the docked bikes and the empty docks come from the same call and move through the day. TfL keeps closed stations in the list until it removes them, and the count drops those. If the API is unreachable at build time the page falls back to the committed snapshot in apps/web/src/fixtures/tfl-bike-points-sample.json and logs that it did.',
    references: [
      {
        label: 'BikePoint docking station API (Transport for London)',
        url: 'https://api.tfl.gov.uk/BikePoint',
        kind: 'data',
      },
      {
        label: 'Unified API documentation (Transport for London)',
        url: 'https://api-portal.tfl.gov.uk/',
        kind: 'data',
      },
      {
        label: 'Cycle hire usage data (Transport for London)',
        url: 'https://cycling.data.tfl.gov.uk/',
        kind: 'data',
      },
      {
        label: 'TfL open data terms and licences (Transport for London)',
        url: 'https://tfl.gov.uk/info-for/open-data-users/',
        kind: 'licence',
      },
    ],
  },
]).filter((microsite) => PUBLISHED_MICROSITES.includes(microsite.slug));
