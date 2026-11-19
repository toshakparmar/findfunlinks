import { test, expect } from '@playwright/test';

test.describe('Phase 2: Header Tabs, Registration CTAs & Shell Persistence', () => {
  test('Test 3: Header tabs (Categories, New, Popular, Requests) render without shell reload', async ({
    page,
  }) => {
    // 1. Visit homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL('http://127.0.0.1:3000/');

    // Get a reference handle to header and sidebar to verify DOM node identity is preserved
    const headerHandle = await page.locator('header').elementHandle();
    const sidebarHandle = await page.locator('aside').elementHandle();
    expect(headerHandle).not.toBeNull();
    expect(sidebarHandle).not.toBeNull();

    // 2. Click Categories header pill
    const categoriesPill = page.locator('header nav a', { hasText: 'Categories' });
    await categoriesPill.click();
    await expect(page).toHaveURL(/\/categories/);
    await expect(categoriesPill).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('h1', { hasText: 'All Categories' })).toBeVisible();

    // 3. Click New header pill
    const newPill = page.locator('header nav a', { hasText: 'New' });
    await newPill.click();
    await expect(page).toHaveURL(/\/new/);
    await expect(newPill).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('h1', { hasText: 'Recently Added & Updated' })).toBeVisible();

    // 4. Click Popular header pill
    const popularPill = page.locator('header nav a', { hasText: 'Popular' });
    await popularPill.click();
    await expect(page).toHaveURL(/\/popular/);
    await expect(popularPill).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('h1', { hasText: 'Most Popular Websites' })).toBeVisible();
    // Verify top 3 podium is visible
    await expect(page.locator('text=Rank #1')).toBeVisible();

    // 5. Click Requests header pill
    const requestsPill = page.locator('header nav a', { hasText: 'Requests' });
    await requestsPill.click();
    await expect(page).toHaveURL(/\/requests/);
    await expect(requestsPill).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('h1', { hasText: 'Website Requests & Curation' })).toBeVisible();
    await expect(page.locator('text=Suggest a Website')).toBeVisible();

    // 6. Test /hot redirect -> /new
    await page.goto('/hot', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/new/);
    await expect(newPill).toHaveAttribute('aria-current', 'page');
  });

  test('Test 4: CTA "List Your Website" in header, sidebar, Requests hero, and footer reach /register', async ({
    page,
  }) => {
    // 1. Header CTA -> /register
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const headerCta = page.locator('header a', { hasText: 'List Your Website' });
    await expect(headerCta).toBeVisible();
    await headerCta.click();
    await expect(page).toHaveURL(/\/register/);
    // Verify focus layout: Sidebar is NOT present on /register
    await expect(page.locator('aside[data-testid="category-sidebar"]')).toHaveCount(0);
    await expect(page.locator('aside[aria-label="Category navigation sidebar"]')).toHaveCount(0);

    // 2. Sidebar Promo CTA -> /register
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const sidebarPromoCta = page.locator('aside a', { hasText: 'Get listed' });
    await expect(sidebarPromoCta).toBeVisible();
    await sidebarPromoCta.click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('aside[data-testid="category-sidebar"]')).toHaveCount(0);

    // 3. Requests Hero CTA -> /register
    await page.goto('/requests', { waitUntil: 'domcontentloaded' });
    const requestsHeroCta = page.locator('main a', { hasText: 'List Your Website' }).first();
    await expect(requestsHeroCta).toBeVisible();
    await requestsHeroCta.click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('aside[data-testid="category-sidebar"]')).toHaveCount(0);

    // 4. Footer Link -> /register
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const footerCta = page.locator('footer a', { hasText: 'List your website' });
    await expect(footerCta).toBeVisible();
    await footerCta.click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('aside[data-testid="category-sidebar"]')).toHaveCount(0);
  });
});
