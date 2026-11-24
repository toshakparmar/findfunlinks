import { test, expect } from '@playwright/test';

test.describe('Phase 3: Home Cards 10 Sites + View All + Mobile Single-Column', () => {
  test('Test 1: Home cards show 10 sites, total count pill, View All button links to category', async ({
    page,
  }) => {
    // 1. Visit homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 2. Locate OTT Platforms card
    const ottCard = page.locator('#category-ott-platforms');
    await expect(ottCard).toBeVisible();

    // Verify Count Pill = Total websites in category (15 Sites, not 10)
    const countPill = ottCard.locator('div:has-text("Sites")').first();
    await expect(countPill).toContainText('15 Sites');

    // Verify Exactly 10 site rows are rendered on Home
    const rows = ottCard.locator('div[role="button"]');
    await expect(rows).toHaveCount(10);

    // Verify "View All" button is visible and clean
    const viewAllBtn = ottCard.locator('a', { hasText: 'View All' });
    await expect(viewAllBtn).toBeVisible();
    const btnText = (await viewAllBtn.innerText()).trim();
    expect(btnText).toBe('View All');

    // 3. Click View All -> navigates to /category/ott-platforms
    await viewAllBtn.click();
    await expect(page).toHaveURL(/\/category\/ott-platforms/);

    // 4. Sidebar "OTT Platforms" becomes active
    const ottSidebarLink = page.locator('aside a', { hasText: 'OTT Platforms' });
    await expect(ottSidebarLink).toHaveAttribute('aria-current', 'page');

    // 5. Full category view displays all 15 sites
    const categoryRows = page.locator('div[role="button"]');
    const catCount = await categoryRows.count();
    expect(catCount).toBeGreaterThanOrEqual(15);
  });

  test('Test 2: Mobile card uses single-column list layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const ottCard = page.locator('#category-ott-platforms');
    await expect(ottCard).toBeVisible();

    // Verify mobile card shows 10 rows
    const rows = ottCard.locator('div[role="button"]');
    await expect(rows).toHaveCount(10);

    // Verify mobile card does NOT use grid-cols-2 split
    const twoColGrid = ottCard.locator('.grid-cols-2');
    await expect(twoColGrid).toHaveCount(0);
  });
});
