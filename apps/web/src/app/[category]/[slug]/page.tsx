import { Container } from '@uklab/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { GaugeRiversChart } from '@/components/GaugeRiversChart';
import { MicrositeStory } from '@/components/MicrositeStory';
import { ReportIssueButton } from '@/components/ReportIssueButton';
import { StatCard } from '@/components/StatCard';
import {
  buildGaugeStationIndex,
  FEATURED_STATION_REFERENCE,
  fetchGaugeLiveLevel,
  fetchGaugeStationSample,
  type GaugeLiveLevel,
  type GaugeStationIndex,
  preferredMeasureIdsFor,
} from '@/lib/gauge-data';
import {
  categorySlugFor,
  freshnessLabelFor,
  micrositePathFor,
  MICROSITES,
  relatedMicrositesFor,
} from '@/lib/microsites';
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

  const stations = await fetchGaugeStationSample();
  const index = buildGaugeStationIndex(stations);
  const level = await fetchGaugeLiveLevel(
    preferredMeasureIdsFor(stations, FEATURED_STATION_REFERENCE),
  );

  const related = relatedMicrositesFor(microsite).map((candidate) => ({
    label: candidate.label,
    href: micrositePathFor(candidate),
  }));

  const content = renderStoryContent(slug, { index, level });

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
        dataNote={microsite.dataNote}
        references={microsite.references}
      />
      <ReportIssueButton pageLabel={microsite.label} />
    </>
  );
}

interface StoryData {
  index: GaugeStationIndex;
  level: GaugeLiveLevel;
}

function renderStoryContent(
  slug: string,
  data: StoryData,
): { chart: React.ReactNode; stats: React.ReactNode } {
  switch (slug) {
    case 'gauge-index': {
      const busiestRiver = data.index.topRivers[0];
      return {
        chart: <GaugeRiversChart rivers={data.index.topRivers} />,
        stats: (
          <dl className="grid gap-6 py-[var(--spacing-2xl)] sm:grid-cols-3">
            <StatCard
              label="Gauges in the sample"
              value={formatCount(data.index.stationCount)}
              accent="cyan"
              testId="gauge-stations"
              dataValue={data.index.stationCount}
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
              label={`${data.level.stationLabel}, ${formatTrendLabel(data.level.trend)}`}
              value={formatLevelMetres(data.level.latestLevelMetres)}
              accent="cyan"
              testId="gauge-live-level"
              dataValue={data.level.latestLevelMetres}
            />
          </dl>
        ),
      };
    }
    default:
      return { chart: null, stats: null };
  }
}
