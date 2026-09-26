import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { micrositePathFor, MICROSITES } from '../src/lib/microsites';

interface RouteCase {
  label: string;
  path: string;
}

// The hub plus every generated microsite route. MICROSITES already excludes
// hidden slugs, so every path here resolves to a generated page.
const routeCases: RouteCase[] = [
  { label: 'hub', path: './' },
  ...MICROSITES.map((microsite) => ({
    label: microsite.slug,
    path: `.${micrositePathFor(microsite)}`,
  })),
];

for (const routeCase of routeCases) {
  test(`@a11y no axe violations on ${routeCase.label}`, async ({ page }) => {
    await page.goto(routeCase.path);
    await expect(page.getByRole('main')).toBeVisible();
    // Wait for the story itself, not just the layout shell: axe can otherwise
    // sample the document while the prerendered content is being swapped in,
    // and report the page as having no level-one heading.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
