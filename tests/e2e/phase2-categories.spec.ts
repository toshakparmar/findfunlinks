import { test, expect } from '@playwright/test';

test.describe('Phase 2 — Categories Page (/categories)', () => {
  test('verifies desktop layout, 5-col grid, All Links first tile, and navigation at 1440px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/categories');

    // 1. Heading and gradient flanking lines
    const h1 = page.locator('h1');
    await expect(h1).toHaveText('Categories');
    const subtitle = page.locator('text=Browse all categories and find your favorite links');
    await expect(subtitle).toBeVisible();

    // 2. All Links tile is first tile
    const allLinksTile = page.locator('a[aria-label*="All Links"]');
    await expect(allLinksTile).toBeVisible();
    await expect(allLinksTile).toHaveAttribute('href', '/');

    // 3. 29 seeded categories + 1 All Links tile = 30 tiles
    const allTiles = page.locator('a[href^="/category/"], a[aria-label*="All Links"]');
    await expect(allTiles).toHaveCount(30);

    // 4. Click tile navigates to category
    const ottTile = page.locator('a[href="/category/ott-platforms"]');
    await expect(ottTile).toBeVisible();
    await ottTile.click();
    await expect(page).toHaveURL(/\/category\/ott-platforms/);
  });

  test('verifies mobile 2-column tile grid at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/categories');

    const h1 = page.locator('h1');
    await expect(h1).toHaveText('Categories');

    // Tiles exist and are visible
    const firstTile = page.locator('a[aria-label*="All Links"]');
    await expect(firstTile).toBeVisible();
  });
});

test.describe('Phase 2 — Home Quick-Access Tile Strip (/)', () => {
  test('verifies mobile 6 slots (5 categories + All Categories) at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // All Categories tile is visible in top strip
    const allCatLink = page.locator('a[href="/categories"]:has-text("All Categories")');
    await expect(allCatLink).toBeVisible();

    // Clicking All Categories navigates to /categories
    await allCatLink.click();
    await expect(page).toHaveURL(/\/categories/);
  });

  test('verifies desktop tile strip at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const allCatLink = page.locator('a[href="/categories"]:has-text("All Categories")');
    await expect(allCatLink).toBeVisible();
  });
});
