import { describe, expect, it } from 'vitest';

import {
  CATEGORY_DETAILS,
  fillStoryDataNote,
  formatBuildDate,
  freshnessLabelFor,
  micrositePathFor,
  MICROSITES,
  relatedMicrositesFor,
} from './microsites';

describe('MICROSITES taxonomy', () => {
  it('gives every microsite a data source, chart type, and category', () => {
    for (const microsite of MICROSITES) {
      expect(microsite.dataSource.length, microsite.slug).toBeGreaterThan(0);
      expect(microsite.chartType.length, microsite.slug).toBeGreaterThan(0);
      expect(microsite.category.length, microsite.slug).toBeGreaterThan(0);
    }
  });

  it('has unique slugs', () => {
    const slugs = MICROSITES.map((microsite) => microsite.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('keeps every filter dimension selectable', () => {
    const sources = new Set(MICROSITES.map((microsite) => microsite.dataSource));
    const chartTypes = new Set(MICROSITES.map((microsite) => microsite.chartType));
    const categories = new Set(MICROSITES.map((microsite) => microsite.category));
    expect(sources.size).toBeGreaterThanOrEqual(1);
    expect(chartTypes.size).toBeGreaterThanOrEqual(1);
    expect(categories.size).toBeGreaterThanOrEqual(1);
  });

  it('gives every microsite key facts, a reading guide, and a source URL', () => {
    for (const microsite of MICROSITES) {
      expect(microsite.keyFacts.length, microsite.slug).toBeGreaterThanOrEqual(3);
      expect(microsite.howToRead.length, microsite.slug).toBeGreaterThan(0);
      expect(microsite.sourceUrl.startsWith('https://'), microsite.slug).toBe(true);
    }
  });

  it('describes every category', () => {
    const categories = new Set(MICROSITES.map((microsite) => microsite.category));
    for (const category of categories) {
      expect(CATEGORY_DETAILS[category].length, category).toBeGreaterThan(0);
    }
  });
});

describe('relatedMicrositesFor', () => {
  it('points every related link at an existing page', () => {
    const knownPaths = new Set(MICROSITES.map((microsite) => micrositePathFor(microsite)));
    for (const microsite of MICROSITES) {
      for (const related of relatedMicrositesFor(microsite)) {
        expect(knownPaths.has(micrositePathFor(related)), related.slug).toBe(true);
      }
    }
  });

  it('returns no related stories while only one microsite is published', () => {
    const gauge = MICROSITES.find((microsite) => microsite.slug === 'gauge-index');
    if (gauge === undefined) {
      throw new Error('gauge-index missing');
    }
    expect(relatedMicrositesFor(gauge)).toHaveLength(0);
  });
});

describe('freshnessLabelFor', () => {
  it('labels deploy-time fetches', () => {
    const fetched = MICROSITES.find((microsite) => microsite.slug === 'gauge-index');
    if (fetched === undefined) {
      throw new Error('gauge-index missing');
    }
    expect(freshnessLabelFor(fetched)).toContain('deploy time');
  });
});

describe('fillStoryDataNote', () => {
  it('replaces every placeholder with the build-time value', () => {
    const note = 'The call returned {stationCount} stations on {asOf}.';
    expect(fillStoryDataNote(note, { stationCount: '2,093', asOf: '25 September 2026' })).toBe(
      'The call returned 2,093 stations on 25 September 2026.',
    );
  });

  it('replaces a placeholder that appears more than once', () => {
    expect(fillStoryDataNote('{n} of {n}', { n: '338' })).toBe('338 of 338');
  });

  it('leaves a note with no placeholders alone', () => {
    expect(fillStoryDataNote('Data: a keyless API.', {})).toBe('Data: a keyless API.');
  });

  it('gives every published story a note with its moving totals filled in', () => {
    for (const microsite of MICROSITES) {
      expect(microsite.dataNote, microsite.slug).toContain('{asOf}');
      for (const token of ['{stationCount}', '{registerCount}', '{datasetCount}', '{dockCount}']) {
        expect(microsite.dataNote.includes(token), `${microsite.slug} ${token}`).toBe(
          token === '{stationCount}'
            ? ['gauge-index', 'cycle-hire-docks'].includes(microsite.slug)
            : microsite.dataNote.includes(token),
        );
      }
    }
  });
});

describe('formatBuildDate', () => {
  it('writes the build day in long form', () => {
    expect(formatBuildDate(new Date('2026-09-25T09:00:00Z'))).toBe('25 September 2026');
  });
});
