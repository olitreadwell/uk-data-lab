import { Container } from '@uklab/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { FoodHygieneRegistersChart } from '@/components/FoodHygieneRegistersChart';
import { GaugeRiversChart } from '@/components/GaugeRiversChart';
import { MicrositeStory } from '@/components/MicrositeStory';
import { OnsCatalogueChart } from '@/components/OnsCatalogueChart';
import { ReportIssueButton } from '@/components/ReportIssueButton';
import { StatCard } from '@/components/StatCard';
import { fetchFoodHygieneSummary } from '@/lib/food-hygiene-data';
import {
  buildGaugeStationIndex,
  FEATURED_STATION_REFERENCE,
  fetchGaugeLiveLevel,
  fetchGaugeStationSample,
  preferredMeasureIdsFor,
} from '@/lib/gauge-data';
import {
  categorySlugFor,
  freshnessLabelFor,
  micrositePathFor,
  MICROSITES,
  relatedMicrositesFor,
} from '@/lib/microsites';
import {
  countDatasetsStampedIn,
  fetchOnsCatalogueSummary,
  ONS_PEAK_STAMP_YEARS,
} from '@/lib/ons-catalogue-data';
import { formatCount, formatLevelMetres, formatTrendLabel } from '@/lib/uk-format';

interface MicrositePageProps {
  params: Promise<{ category: string; slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { category: string; slug: string }[] {
  return MICROSITES.map((microsite) => ({
    category: categorySlugFor(microsite),
    slug: microsite.slug,
  }));
}

export async function generateMetadata({ params }: MicrositePageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const microsite = MICROSITES.find((candidate) => candidate.slug === slug);
  if (microsite === undefined || categorySlugFor(microsite) !== category) {
    return { title: 'uk-data-lab' };
  }
  const path = micrositePathFor(microsite);
  return {
    title: `${microsite.label} - uk-data-lab`,
    description: microsite.description,
    openGraph: {
      title: `${microsite.label} - uk-data-lab`,
      description: microsite.description,
      url: path,
      type: 'article',
    },
  };
}

export default async function MicrositePage({
  params,
}: MicrositePageProps): Promise<React.ReactElement> {
  const { category, slug } = await params;
  const microsite = MICROSITES.find((candidate) => candidate.slug === slug);
  if (microsite === undefined || categorySlugFor(microsite) !== category) {
    notFound();
  }

  const related = relatedMicrositesFor(microsite).map((candidate) => ({
    label: candidate.label,
    href: micrositePathFor(candidate),
  }));

  const content = await renderStoryContent(slug, microsite.dataNote);

  return (
    <>
      <Container size="wide">
        <nav aria-label="Breadcrumb" className="py-[var(--spacing-2xl)]">
          <ol className="numeral-paragraph-sm flex flex-wrap items-center gap-2 text-[var(--color-muted)]">
            <li>
              <Link href="/" className="underline hover:text-[var(--color-fg)]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/${categorySlugFor(microsite)}/`}
                className="underline hover:text-[var(--color-fg)]"
              >
                {microsite.category}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-[var(--color-fg)]">
              {microsite.label}
            </li>
          </ol>
        </nav>
      </Container>
      <MicrositeStory
        id={microsite.slug}
        eyebrow={microsite.eyebrow}
        title={microsite.title}
        description={microsite.description}
        paragraphs={microsite.paragraphs}
        keyFacts={microsite.keyFacts}
        howToRead={microsite.howToRead}
        sourceUrl={microsite.sourceUrl}
        updatedLabel={freshnessLabelFor(microsite)}
        related={related}
        accent={microsite.accent}
        chart={content.chart}
        stats={content.stats}
        dataNote={content.dataNote}
        references={microsite.references}
      />
      <ReportIssueButton pageLabel={microsite.label} />
    </>
  );
}

interface StoryContent {
  chart: React.ReactNode;
  stats: React.ReactNode;
  /** Source note for the footer, defaulting to the microsite config's own. */
  dataNote: string;
}

/**
 * Builds the chart, stats, and source note for one story. Each story fetches
 * only the data it draws, so a story page never depends on another story's
 * upstream API.
 *
 * @param slug - microsite slug
 * @param dataNote - the microsite config's source note
 * @returns the chart, stat cards, and source note for the page
 */
async function renderStoryContent(slug: string, dataNote: string): Promise<StoryContent> {
  switch (slug) {
    case 'gauge-index': {
      const stations = await fetchGaugeStationSample();
      const index = buildGaugeStationIndex(stations);
      const level = await fetchGaugeLiveLevel(
        preferredMeasureIdsFor(stations, FEATURED_STATION_REFERENCE),
      );
      const busiestRiver = index.topRivers[0];
      return {
        chart: <GaugeRiversChart rivers={index.topRivers} />,
        stats: (
          <dl className="grid gap-6 py-[var(--spacing-2xl)] sm:grid-cols-3">
            <StatCard
              label="Gauges in the sample"
              value={formatCount(index.stationCount)}
              accent="cyan"
              testId="gauge-stations"
              dataValue={index.stationCount}
            />
            <StatCard
              label={busiestRiver === undefined ? 'Busiest river' : busiestRiver.riverName}
              value={
                busiestRiver === undefined ? 'No data' : formatCount(busiestRiver.stationCount)
              }
              accent="cyan"
              testId="gauge-busiest-river"
              dataValue={busiestRiver?.stationCount}
            />
            <StatCard
              label={`${level.stationLabel}, ${formatTrendLabel(level.trend)}`}
              value={formatLevelMetres(level.latestLevelMetres)}
              accent="cyan"
              testId="gauge-live-level"
              dataValue={level.latestLevelMetres}
            />
          </dl>
        ),
        dataNote,
      };
    }
    case 'ons-dataset-catalogue': {
      const catalogue = await fetchOnsCatalogueSummary();
      const peakYearsCount = countDatasetsStampedIn(catalogue, ONS_PEAK_STAMP_YEARS);
      return {
        chart: <OnsCatalogueChart yearCounts={catalogue.yearCounts} />,
        stats: (
          <dl className="grid gap-6 py-[var(--spacing-2xl)] sm:grid-cols-3">
            <StatCard
              label="Datasets in the catalogue"
              value={formatCount(catalogue.datasetCount)}
              accent="teal"
              testId="ons-datasets"
              dataValue={catalogue.datasetCount}
            />
            <StatCard
              label={`Stamped ${ONS_PEAK_STAMP_YEARS.join(' or ')}`}
              value={formatCount(peakYearsCount)}
              accent="teal"
              testId="ons-stamped-recently"
              dataValue={peakYearsCount}
            />
            <StatCard
              label="Flagged as national statistics"
              value={formatCount(catalogue.nationalStatisticCount)}
              accent="teal"
              testId="ons-national-statistics"
              dataValue={catalogue.nationalStatisticCount}
            />
          </dl>
        ),
        dataNote,
      };
    }
    case 'food-hygiene-registers': {
      const summary = await fetchFoodHygieneSummary();
      const largestRegister = summary.largestAuthorities[0];
      return {
        chart: <FoodHygieneRegistersChart registers={summary.largestAuthorities} />,
        stats: (
          <dl className="grid gap-6 py-[var(--spacing-2xl)] sm:grid-cols-3">
            <StatCard
              label="Establishments listed"
              value={formatCount(summary.establishmentCount)}
              accent="amber"
              testId="food-hygiene-establishments"
              dataValue={summary.establishmentCount}
            />
            <StatCard
              label="Registers listed"
              value={formatCount(summary.authorityCount)}
              accent="amber"
              testId="food-hygiene-registers"
              dataValue={summary.authorityCount}
            />
            <StatCard
              label={
                largestRegister === undefined
                  ? 'Largest register'
                  : largestRegister.localAuthorityName
              }
              value={
                largestRegister === undefined
                  ? 'No data'
                  : formatCount(largestRegister.establishmentCount)
              }
              accent="amber"
              testId="food-hygiene-largest-register"
              dataValue={largestRegister?.establishmentCount}
            />
          </dl>
        ),
        dataNote,
      };
    }
    default:
      return { chart: null, stats: null, dataNote };
  }
}
