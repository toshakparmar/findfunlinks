import { spawn, ChildProcess } from 'child_process';
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const outDir = path.resolve('docs/ui/v3/phase3');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Starting Next.js server on 127.0.0.1:3005...');
  const nextBin = path.resolve('apps/web/node_modules/next/dist/bin/next');
  const server: ChildProcess = spawn(
    process.execPath,
    [nextBin, 'dev', 'apps/web', '--hostname', '127.0.0.1', '--port', '3005'],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    },
  );

  server.stdout?.on('data', (d) => console.log('[Server]:', d.toString().trim()));
  server.stderr?.on('data', (d) => console.error('[Server err]:', d.toString().trim()));

  // Wait for server to be responsive
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    try {
      const res = await fetch('http://127.0.0.1:3005/');
      if (res.status === 200) {
        ready = true;
        console.log('✓ Next.js server ready on 3005!');
        break;
      }
    } catch (e: any) {
      // log every 5 attempts
      if (i % 5 === 0) console.log(`Waiting for server (attempt ${i + 1}):`, e?.message);
    }
  }

  if (!ready) {
    console.error('Server failed to start');
    server.kill();
    process.exit(1);
  }

  console.log('\n--- Running Phase 3 Card & Navigation Verification ---');
  let allPass = true;

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop Check (1280px)
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:3005/', { waitUntil: 'networkidle' });

    console.log('\n1. Checking Home Category Cards (Desktop 1280px):');
    const ottCard = page.locator('#category-ott-platforms');
    const isOttVisible = await ottCard.isVisible();
    console.log(`- OTT Platforms card visible: ${isOttVisible ? 'PASS ✓' : 'FAIL ✗'}`);

    // Verify Count Pill = Total (15 Sites, not 10)
    const countPillText = await ottCard.locator('.cat-card div:has-text("Sites")').first().innerText();
    const countMatchesTotal = countPillText.includes('15 Sites');
    console.log(`- Card header count pill shows total ("15 Sites"): ${countMatchesTotal ? `PASS ✓ (${countPillText.trim()})` : `FAIL ✗ (${countPillText.trim()})`}`);

    // Verify Exactly 10 rows rendered on Home card
    // Site rows have role="button"
    const rowButtons = ottCard.locator('div[role="button"]');
    const rowCount = await rowButtons.count();
    const has10Rows = rowCount === 10;
    console.log(`- Exactly 10 site rows rendered on Home card: ${has10Rows ? `PASS ✓ (count=${rowCount})` : `FAIL ✗ (count=${rowCount})`}`);

    // Verify "View All" button
    const viewAllBtn = ottCard.locator('a', { hasText: 'View All' });
    const isViewAllVisible = await viewAllBtn.isVisible();
    const viewAllText = (await viewAllBtn.innerText()).trim();
    const isCleanViewAll = viewAllText === 'View All';
    console.log(`- "View All" button visible: ${isViewAllVisible ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`- Button text is clean "View All" (no duplicate arrow): ${isCleanViewAll ? `PASS ✓ ("${viewAllText}")` : `FAIL ✗ ("${viewAllText}")`}`);

    // Click "View All" and verify navigation + active sidebar
    await viewAllBtn.click();
    await page.waitForURL('**/category/ott-platforms');
    const currentUrl = page.url();
    const isNavigated = currentUrl.includes('/category/ott-platforms');
    console.log(`- "View All" navigates to /category/ott-platforms: ${isNavigated ? 'PASS ✓' : 'FAIL ✗'}`);

    // Check sidebar active state
    const ottSidebarItem = page.locator('aside a', { hasText: 'OTT Platforms' });
    const isOttActive = (await ottSidebarItem.getAttribute('aria-current')) === 'page';
    console.log(`- Sidebar "OTT Platforms" has aria-current="page": ${isOttActive ? 'PASS ✓' : 'FAIL ✗'}`);

    // Wait for sites to finish rendering on the category page
    await page.locator('text=Netflix').first().waitFor({ state: 'visible', timeout: 20000 });
    const categoryRows = page.locator('div[role="button"]');
    const catRowCount = await categoryRows.count();
    const hasAllSites = catRowCount >= 15;
    console.log(`- Full category page displays all sites (>=15): ${hasAllSites ? `PASS ✓ (count=${catRowCount})` : `FAIL ✗ (count=${catRowCount})`}`);

    if (!isOttVisible || !countMatchesTotal || !has10Rows || !isViewAllVisible || !isCleanViewAll || !isNavigated || !isOttActive || !hasAllSites) {
      allPass = false;
    }

    await context.close();

    // 2. Mobile Check (390px)
    console.log('\n2. Checking Mobile Single-Column Layout (390px):');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      colorScheme: 'dark',
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://127.0.0.1:3005/', { waitUntil: 'networkidle' });

    const mobileOttCard = mobilePage.locator('#category-ott-platforms');
    const mobileRowCount = await mobileOttCard.locator('div[role="button"]').count();
    const mobileHas10Rows = mobileRowCount === 10;
    console.log(`- Mobile card shows exactly 10 rows: ${mobileHas10Rows ? 'PASS ✓' : 'FAIL ✗'}`);

    // Check that there is NO grid-cols-2 inside the card
    const hasTwoColsGrid = await mobileOttCard.locator('.grid-cols-2').count();
    const isSingleCol = hasTwoColsGrid === 0;
    console.log(`- Mobile card uses single-column vertical list (no 2-col split): ${isSingleCol ? 'PASS ✓' : 'FAIL ✗'}`);

    if (!mobileHas10Rows || !isSingleCol) {
      allPass = false;
    }

    await mobileContext.close();

    // 3. Capture Screenshots Matrix across viewports
    console.log('\n3. Capturing Phase 3 Screenshots (Home cards & View All):');
    const viewports = [
      { name: 'mobile-390', width: 390, height: 844 },
      { name: 'tablet-768', width: 768, height: 1024 },
      { name: 'desktop-1280', width: 1280, height: 900 },
      { name: 'ultrawide-1920', width: 1920, height: 1080 },
    ];

    for (const vp of viewports) {
      for (const scheme of ['dark', 'light'] as const) {
        const c = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: scheme,
        });
        const p = await c.newPage();
        await p.goto('http://127.0.0.1:3005/', { waitUntil: 'networkidle' });
        if (scheme === 'light') {
          await p.evaluate(() => document.documentElement.classList.remove('dark'));
        } else {
          await p.evaluate(() => document.documentElement.classList.add('dark'));
        }
        await sleep(300);

        const filename = `home-cards-${vp.name}-${scheme}.png`;
        const filepath = path.join(outDir, filename);
        await p.screenshot({ path: filepath, fullPage: false });
        console.log(`  ✓ Saved ${filename}`);
        await c.close();
      }
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    allPass = false;
  } finally {
    await browser.close();
    server.kill();
  }

  console.log(`\n========================================`);
  console.log(`Phase 3 Test Status: ${allPass ? '100% PASSED ✓' : 'FAILED ✗'}`);
  console.log(`========================================\n`);

  if (!allPass) {
    process.exit(1);
  }
}

run();
