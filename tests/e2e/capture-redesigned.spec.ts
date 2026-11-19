import { test } from '@playwright/test';

test('capture redesigned pages and dropdown screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1. Redesigned Requests Page
  await page.goto('/requests', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/redesigned-requests.png',
  });

  // 2. Open Custom Dropdown on Requests Page
  const selectTrigger = page.locator('button[aria-haspopup="listbox"]').first();
  if (await selectTrigger.isVisible()) {
    await selectTrigger.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/redesigned-dropdown-open.png',
    });
  }

  // 3. Redesigned New Page
  await page.goto('/new', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/redesigned-new.png',
  });

  // 4. Redesigned Popular Page
  await page.goto('/popular', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/redesigned-popular.png',
  });

  // 5. Redesigned About Page
  await page.goto('/about', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/redesigned-about.png',
  });

  // 6. Redesigned Register Page with Custom Dropdown
  await page.goto('/register', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const regSelectTrigger = page.locator('button[aria-haspopup="listbox"]').first();
  if (await regSelectTrigger.isVisible()) {
    await regSelectTrigger.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({
    path: 'C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11/redesigned-register-dropdown.png',
  });
});

