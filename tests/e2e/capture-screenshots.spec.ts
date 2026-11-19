import { test } from '@playwright/test';

test('capture Phase 2 verification screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1. New additions page
  await page.goto('/new', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/phase2-new.png',
  });

  // 2. Popular page
  await page.goto('/popular', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/phase2-popular.png',
  });

  // 3. Requests page
  await page.goto('/requests', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/phase2-requests.png',
  });
});
