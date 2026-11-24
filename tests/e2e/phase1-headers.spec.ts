import { test, expect } from '@playwright/test';

const viewports = [
  { width: 390, height: 844, name: 'mobile-390' },
  { width: 768, height: 1024, name: 'tablet-768' },
  { width: 1280, height: 800, name: 'desktop-1280' },
  { width: 1920, height: 1080, name: 'desktop-1920' },
];

const targetPages = [
  { path: '/category/ott-platforms', title: 'OTT Platforms' },
  { path: '/new', title: 'Recently Added & Updated' },
  { path: '/popular', title: 'Most Popular Websites' },
];

for (const vp of viewports) {
  test.describe(`Phase 1 Header & Typography Tests [${vp.name}]`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const pageInfo of targetPages) {
      test(`verifies header anatomy & absence of legacy items on ${pageInfo.path}`, async ({
        page,
      }) => {
        await page.goto(pageInfo.path);

        // 1. Presence of H1
        const h1 = page.locator('h1');
        await expect(h1).toBeVisible();
        await expect(h1).toContainText(pageInfo.title);

        // 2. Presence of Search Input
        const searchInput = page.locator('input[type="text"][placeholder*="Search"]');
        await expect(searchInput).toBeVisible();

        // 3. Presence of single Filter dropdown button
        const filterButton = page.locator('button[aria-haspopup="dialog"]');
        await expect(filterButton).toBeVisible();

        // 4. Absence of legacy banner card
        const bannerCta = page.locator(
          'a:has-text("List Website"), a:has-text("List Your Website")',
        );
        // The list banner inside page body is removed (only header/nav CTA may exist)
        const bodyBanner = page.locator('.rounded-\\[16px\\].p-4.sm\\:p-5:has-text("Sites")');
        await expect(bodyBanner).toHaveCount(0);

        // 5. Absence of visible breadcrumb nav
        const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
        await expect(breadcrumb).toHaveCount(0);

        // 6. Absence of legacy "All / Has Mirrors" toggle
        const legacyToggle = page.locator('button:has-text("Has Mirrors"), button:has-text("All")');
        // Legacy segmented toggle was inside the sticky toolbar
        const stickyToolbar = page.locator('.sticky.top-14');
        await expect(stickyToolbar).toHaveCount(0);

        // 7. Absence of legacy helper line "Showing X of Y sites · Click row for mirrors"
        const helperText = page.locator('text=Click row for mirrors · Click icon to open');
        await expect(helperText).toHaveCount(0);

        // 8. Body typography computed size is 16px (1rem)
        const bodyFontSize = await page.evaluate(() => {
          return window.getComputedStyle(document.body).fontSize;
        });
        expect(bodyFontSize).toBe('16px');

        // 9. Dropdown interaction & URL synchronization
        await filterButton.click();
        const dialog = page.locator('div[role="dialog"][aria-label="Filter options"]');
        await expect(dialog).toBeVisible();

        // Click an option in the dialog (e.g., 'Newest' or 'A–Z')
        const sortOption = dialog.locator('button:has-text("A–Z")');
        if (await sortOption.isVisible()) {
          await sortOption.click();
          // Verify URL updated with ?sort=az
          await expect(page).toHaveURL(/sort=az/);
        }
      });
    }
  });
}
