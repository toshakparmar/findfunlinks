import { spawn, ChildProcess } from 'child_process';
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const outDir = path.resolve('docs/ui/v3/phase2');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Starting Next.js production server on 127.0.0.1:3005...');
  const nextBin = path.resolve('apps/web/node_modules/next/dist/bin/next');
  const server: ChildProcess = spawn(
    process.execPath,
    [nextBin, 'start', 'apps/web', '--hostname', '127.0.0.1', '--port', '3005'],
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
    } catch (e) {}
  }

  if (!ready) {
    console.error('Server failed to start');
    server.kill();
    process.exit(1);
  }

  console.log('\n--- Running Phase 2 Endpoint & DOM Tests ---');
  let allPass = true;

  // 1. Test /categories HTML
  const catRes = await fetch('http://127.0.0.1:3005/categories');
  const catHtml = await catRes.text();

  console.log(`\nTesting /categories (Status: ${catRes.status}):`);
  const hasH1Categories = catHtml.includes('>Categories<');
  console.log(`- Centered H1 "Categories": ${hasH1Categories ? 'PASS ✓' : 'FAIL ✗'}`);

  const hasGradientLines = catHtml.includes('linear-gradient(90deg');
  console.log(`- Flanking horizontal gradient lines: ${hasGradientLines ? 'PASS ✓' : 'FAIL ✗'}`);

  const hasSubtitle = catHtml.includes('Browse all categories and find your favorite links');
  console.log(`- Subtitle text: ${hasSubtitle ? 'PASS ✓' : 'FAIL ✗'}`);

  const hasAllLinksTile = catHtml.includes('All Links') && catHtml.includes('href="/"');
  console.log(`- First tile "All Links" -> /: ${hasAllLinksTile ? 'PASS ✓' : 'FAIL ✗'}`);

  const sampleCats = [
    'movies',
    'tv-shows',
    'ott-platforms',
    'anime',
    'sports',
    'cartoons',
    'gaming',
    'technology',
  ];
  let missingCats = 0;
  for (const s of sampleCats) {
    if (!catHtml.includes(`href="/category/${s}"`)) {
      console.error(`Missing category link: /category/${s}`);
      missingCats++;
    }
  }
  console.log(
    `- Seeded category tiles present (checked sample): ${missingCats === 0 ? 'PASS ✓' : 'FAIL ✗'}`,
  );

  if (
    !hasH1Categories ||
    !hasGradientLines ||
    !hasSubtitle ||
    !hasAllLinksTile ||
    missingCats > 0
  ) {
    allPass = false;
  }

  // 2. Test Home (/) HTML for CategoryTileStrip
  const homeRes = await fetch('http://127.0.0.1:3005/');
  const homeHtml = await homeRes.text();

  console.log(`\nTesting Home / (Status: ${homeRes.status}):`);
  const hasAllCategoriesSlot =
    homeHtml.includes('All Categories') && homeHtml.includes('href="/categories"');
  console.log(
    `- Top Tile Strip "All Categories" slot -> /categories: ${hasAllCategoriesSlot ? 'PASS ✓' : 'FAIL ✗'}`,
  );

  const hasStripTiles =
    homeHtml.includes('href="/category/movies"') &&
    homeHtml.includes('href="/category/ott-platforms"');
  console.log(
    `- Quick-access category tiles present on top: ${hasStripTiles ? 'PASS ✓' : 'FAIL ✗'}`,
  );

  if (!hasAllCategoriesSlot || !hasStripTiles) {
    allPass = false;
  }

  // 3. Playwright browser visual capture & E2E navigation test
  console.log('\nLaunching Playwright for Phase 2 screenshots & interaction tests...');
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { width: 1440, height: 900, name: 'desktop-1440' },
    { width: 390, height: 844, name: 'mobile-390' },
  ];

  for (const theme of ['dark', 'light']) {
    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });

      // Categories Page
      await page.goto('http://127.0.0.1:3005/categories', { waitUntil: 'domcontentloaded' });
      await page.evaluate((t) => {
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(t);
        document.documentElement.setAttribute('data-theme', t);
      }, theme);
      await page.waitForTimeout(400);

      const catFile = `categories-${vp.name}-${theme}.png`;
      await page.screenshot({ path: path.join(outDir, catFile), fullPage: false });
      console.log(`Saved screenshot: ${catFile}`);

      // Home Page
      await page.goto('http://127.0.0.1:3005/', { waitUntil: 'domcontentloaded' });
      await page.evaluate((t) => {
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(t);
        document.documentElement.setAttribute('data-theme', t);
      }, theme);
      await page.waitForTimeout(400);

      const homeFile = `home-top-strip-${vp.name}-${theme}.png`;
      await page.screenshot({ path: path.join(outDir, homeFile), fullPage: false });
      console.log(`Saved screenshot: ${homeFile}`);

      await page.close();
    }
  }

  await browser.close();

  // Cleanup
  console.log('\nShutting down server...');
  server.kill('SIGTERM');

  if (allPass) {
    console.log('\n🎉 ALL PHASE 2 TESTS PASSED SUCCESSFULLY! 🎉\n');
    process.exit(0);
  } else {
    console.error('\n❌ SOME PHASE 2 TESTS FAILED.\n');
    process.exit(1);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
