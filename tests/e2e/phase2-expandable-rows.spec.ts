import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const screenshotDir = path.join(process.cwd(), 'docs/ui/showcase/phase2');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

test.describe('Phase 2: Expandable Rows & Inline Dropdown Panel', () => {
  test('Test 1: Row structure, chevron expand/collapse, panel content & single-open mode', async ({
    page,
  }) => {
    // 1. Visit Home
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 2. Find first category card
    const firstCard = page.locator('div[id^="category-"]').first();
    await expect(firstCard).toBeVisible();

    // 3. Find the first row's chevron toggle button
    const firstChevron = firstCard.locator('button[aria-label^="Show details"]').first();
    await expect(firstChevron).toBeVisible();
    await expect(firstChevron).toHaveAttribute('aria-expanded', 'false');

    // 4. Click chevron to expand
    await firstChevron.click();
    await expect(firstChevron).toHaveAttribute('aria-expanded', 'true');

    // 5. Verify inline panel is open and visible
    const expandedPanel = firstCard.locator('div[role="region"]').first();
    await expect(expandedPanel).toBeVisible();

    // 6. Verify panel contents
    // Star button should be present
    const starBtn = expandedPanel.locator('button[aria-label*="star" i]');
    await expect(starBtn).toBeVisible();

    // View details link should be present
    const viewDetailsLink = expandedPanel.locator('a:has-text("View details")');
    await expect(viewDetailsLink).toBeVisible();

    // 7. Test single-open behavior: click the second row's chevron in the same card
    const secondChevron = firstCard.locator('button[aria-label^="Show details"]').nth(1);
    if (await secondChevron.count() > 0) {
      await secondChevron.click();
      await page.waitForTimeout(400);

      // Second row is now expanded, first row should be collapsed
      await expect(secondChevron).toHaveAttribute('aria-expanded', 'true');
      await expect(firstChevron).toHaveAttribute('aria-expanded', 'false');
    }

    // 8. Capture desktop screenshot
    await page.screenshot({
      path: path.join(screenshotDir, 'home-expanded-desktop.png'),
      fullPage: false,
    });
  });

  test('Test 2: Keyboard accessibility (Escape key closes panel)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const firstCard = page.locator('div[id^="category-"]').first();
    const firstChevron = firstCard.locator('button[aria-label^="Show details"]').first();
    await firstChevron.click();

    const expandedPanel = firstCard.locator('div[role="region"]').first();
    await expect(expandedPanel).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // Panel should now be closed / hidden
    await expect(expandedPanel).not.toBeVisible();
    await expect(firstChevron).toHaveAttribute('aria-expanded', 'false');
  });

  test('Test 3: Mobile responsiveness (390px viewport)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const firstCard = page.locator('div[id^="category-"]').first();
    const firstChevron = firstCard.locator('button[aria-label^="Show details"]').first();
    await firstChevron.click();

    const expandedPanel = firstCard.locator('div[role="region"]').first();
    await expect(expandedPanel).toBeVisible();

    // Capture mobile screenshot
    await page.screenshot({
      path: path.join(screenshotDir, 'home-expanded-mobile.png'),
      fullPage: false,
    });
  });
});
