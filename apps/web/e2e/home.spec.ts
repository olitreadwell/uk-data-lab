import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { micrositePathFor, MICROSITES } from '../src/lib/microsites';

test.describe('home', () => {
  test('@critical renders the landing page with microsite cards', async ({ page }) => {
    // Relative URL (no leading slash) so it resolves against the baseURL path
    // (the site may be served under a base path).
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // One card per published microsite, no more and no fewer.
    for (const microsite of MICROSITES) {
      const href = micrositePathFor(microsite);
      await expect(page.locator(`a[href="${href}"]`)).toHaveCount(1);
    }
  });

  test('@critical opens a microsite story from its card', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('link', { name: /more gauges than any other river in England/i }).click();
    await expect(page.getByRole('img', { name: /rivers by number of gauges/i })).toBeVisible();
    await expect(page.getByText('Sources and further reading')).toBeVisible();
  });

  test('@critical @a11y no a11y violations on the landing page', async ({ page }) => {
    await page.goto('./');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('@smoke shows a plausible live river level', async ({ page }) => {
    await page.goto('./environment/gauge-index');
    const latest = await page.getAttribute('[data-testid="gauge-live-level"]', 'data-value');
    expect(latest).not.toBeNull();
    const level = Number(latest);
    expect(Number.isFinite(level)).toBe(true);
    expect(level).toBeGreaterThan(-2);
    expect(level).toBeLessThan(3);
  });

  test('@smoke counts the gauges in the sample', async ({ page }) => {
    await page.goto('./environment/gauge-index');
    const count = await page.getAttribute('[data-testid="gauge-stations"]', 'data-value');
    expect(Number(count)).toBeGreaterThan(1000);
  });

  test('@smoke counts the datasets in the ONS catalogue', async ({ page }) => {
    await page.goto('./open-data/ons-dataset-catalogue');
    const count = await page.getAttribute('[data-testid="ons-datasets"]', 'data-value');
    expect(Number(count)).toBeGreaterThan(200);
  });

  test('@smoke counts the docking stations in the cycle hire list', async ({ page }) => {
    await page.goto('./transport/cycle-hire-docks');
    const stations = await page.getAttribute('[data-testid="cycle-hire-stations"]', 'data-value');
    expect(Number(stations)).toBeGreaterThan(500);
    const points = await page.getAttribute(
      '[data-testid="cycle-hire-docking-points"]',
      'data-value',
    );
    expect(Number(points)).toBeGreaterThan(10000);
  });

  test('@smoke draws the cycle hire dot plot', async ({ page }) => {
    await page.goto('./transport/cycle-hire-docks');
    await expect(
      page.getByRole('img', { name: /docking stations by number of docking points/i }),
    ).toBeVisible();
    await expect(
      page.locator('summary', { hasText: 'View the dock sizes as a table' }),
    ).toBeVisible();
  });

  test('@smoke counts the establishments on the food hygiene registers', async ({ page }) => {
    await page.goto('./health/food-hygiene-registers');
    const count = await page.getAttribute(
      '[data-testid="food-hygiene-establishments"]',
      'data-value',
    );
    expect(Number(count)).toBeGreaterThan(100000);
  });
});
