import { test, expect } from '@playwright/test';

test.describe('Phase 1: Routing and State Root-Cause Verification', () => {
  test('Test 1: Home -> click View More on OTT Platforms -> /category/ott-platforms', async ({
    page,
  }) => {
    // 1. Visit homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Verify header "Home" and sidebar "All Links" are active
    const homeHeaderPill = page.locator('header nav a', { hasText: 'Home' });
    await expect(homeHeaderPill).toHaveAttribute('aria-current', 'page');

    const allLinksSidebar = page.locator('aside a', { hasText: 'All Links' });
    await expect(allLinksSidebar).toHaveAttribute('aria-current', 'page');

    // 2. Locate OTT Platforms card
    const ottCard = page.locator('#category-ott-platforms');
    await expect(ottCard).toBeVisible();

    // Verify "View More" button text does NOT have duplicated arrows (Bug b fix)
    const viewMoreBtn = ottCard.locator('a', { hasText: 'View More' });
    await expect(viewMoreBtn).toBeVisible();
    const btnText = await viewMoreBtn.innerText();
    expect(btnText.trim()).toBe('View More');

    // 3. Click View More
    await viewMoreBtn.click();

    // 4. Verify URL navigated to /category/ott-platforms
    await expect(page).toHaveURL(/\/category\/ott-platforms/);

    // 5. Verify active states: Sidebar "OTT Platforms" active, "All Links" inactive
    const ottSidebarLink = page.locator('aside a', { hasText: 'OTT Platforms' });
    await expect(ottSidebarLink).toHaveAttribute('aria-current', 'page');
    await expect(allLinksSidebar).not.toHaveAttribute('aria-current', 'page');

    // Header "Home" remains active for category pages
    await expect(homeHeaderPill).toHaveAttribute('aria-current', 'page');

    // 6. Verify full category view is visible
    await expect(page.locator('h1', { hasText: 'OTT Platforms' })).toBeVisible();
    // Verify site rows are present (Netflix, Amazon Prime Video, etc.)
    await expect(page.locator('text=Netflix')).toBeVisible();
    await expect(page.locator('text=Amazon Prime Video')).toBeVisible();
  });

  test('Test 2: Sidebar navigation, Home/All Links restoration, and browser history', async ({
    page,
  }) => {
    // 1. Go to /category/ott-platforms
    await page.goto('/category/ott-platforms', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/category\/ott-platforms/);

    // 2. Click sidebar "Movies"
    const moviesSidebarLink = page.locator('aside a', { hasText: 'Movies' });
    await moviesSidebarLink.click();

    // Verify URL updated to /category/movies and active state updated
    await expect(page).toHaveURL(/\/category\/movies/);
    await expect(moviesSidebarLink).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('h1', { hasText: 'Movies' })).toBeVisible();
    await expect(page.locator('text=IMDb')).toBeVisible();

    // 3. Click "Home" in top header
    const homeHeaderPill = page.locator('header nav a', { hasText: 'Home' });
    await homeHeaderPill.click();

    // Verify URL restored to / and full home grid restored (Bug e fix)
    await expect(page).toHaveURL('http://127.0.0.1:3000/');
    const allLinksSidebar = page.locator('aside a', { hasText: 'All Links' });
    await expect(allLinksSidebar).toHaveAttribute('aria-current', 'page');
    await expect(moviesSidebarLink).not.toHaveAttribute('aria-current', 'page');

    // Verify multiple category cards exist on home grid (not just 1)
    await expect(page.locator('#category-ott-platforms')).toBeVisible();
    await expect(page.locator('#category-movies')).toBeVisible();
    await expect(page.locator('#category-anime-streaming')).toBeVisible();

    // 4. Test Browser Back navigation
    await page.goBack();
    await expect(page).toHaveURL(/\/category\/movies/);
    await expect(moviesSidebarLink).toHaveAttribute('aria-current', 'page');
    await expect(allLinksSidebar).not.toHaveAttribute('aria-current', 'page');

    // 5. Test Browser Forward navigation
    await page.goForward();
    await expect(page).toHaveURL('http://127.0.0.1:3000/');
    await expect(allLinksSidebar).toHaveAttribute('aria-current', 'page');
  });
});
