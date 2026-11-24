import { spawn, ChildProcess } from 'child_process';
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const outDir = path.resolve('docs/ui/showcase/phase2');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const artifactDir = 'C:/Users/hp/.gemini/antigravity/brain/5a976452-709c-46b9-b024-9bb67cad7d11';

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

  let ready = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    try {
      const res = await fetch('http://127.0.0.1:3005/');
      console.log(`Probe status: ${res.status}`);
      if (res.status === 200) {
        ready = true;
        console.log('✓ Next.js server ready on 3005!');
        break;
      }
    } catch (e: any) {
      console.log(`Waiting for server (attempt ${i + 1}):`, e?.cause || e?.message);
    }
  }

  if (!ready) {
    console.error('Server failed to start');
    server.kill();
    process.exit(1);
  }

  console.log('\n--- Running Phase 2 Showcase Verification (Expandable Rows & Dropdown Panels) ---');
  let allPass = true;

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop Dark Mode (1440px)
    console.log('\n1. Desktop (1440px, Dark Mode) - Expandable Row Verification:');
    const contextDark = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: 'dark',
    });
    const pageDark = await contextDark.newPage();
    await pageDark.goto('http://127.0.0.1:3005/', { waitUntil: 'networkidle' });
    await sleep(1000);

    const firstCard = pageDark.locator('div[id^="category-"]').first();
    const isCardVisible = await firstCard.isVisible();
    console.log(`- Category card visible: ${isCardVisible ? 'PASS ✓' : 'FAIL ✗'}`);

    // Verify first row's chevron
    const firstChevron = firstCard.locator('button[aria-expanded]').first();
    const isChevronVisible = await firstChevron.isVisible();
    console.log(`- Row chevron toggle visible: ${isChevronVisible ? 'PASS ✓' : 'FAIL ✗'}`);
    const initialAria = await firstChevron.getAttribute('aria-expanded');
    console.log(`- Initial aria-expanded="false": ${initialAria === 'false' ? 'PASS ✓' : 'FAIL ✗'}`);

    // Click to expand row 1
    await firstChevron.click();
    await sleep(600);

    const expandedAria = await firstChevron.getAttribute('aria-expanded');
    console.log(`- Click expands row (aria-expanded="true"): ${expandedAria === 'true' ? 'PASS ✓' : 'FAIL ✗'}`);
    if (expandedAria !== 'true') allPass = false;

    // Verify inline panel is mounted and wait for preview data
    const expandedPanel = firstCard.locator('div[role="region"]').first();
    const isPanelVisible = await expandedPanel.isVisible();
    console.log(`- Inline dropdown panel visible: ${isPanelVisible ? 'PASS ✓' : 'FAIL ✗'}`);
    if (!isPanelVisible) allPass = false;

    // Wait for content (StarButton) in footer
    const starBtn = expandedPanel.locator('button[aria-label*="star" i]');
    await starBtn.waitFor({ state: 'visible', timeout: 8000 });
    const isStarVisible = await starBtn.isVisible();
    console.log(`- StarButton in footer visible: ${isStarVisible ? 'PASS ✓' : 'FAIL ✗'}`);
    if (!isStarVisible) allPass = false;

    // Check "View details" link
    const viewDetailsLink = expandedPanel.locator('a:has-text("View details")');
    const isViewDetailsVisible = await viewDetailsLink.isVisible();
    console.log(`- "View details" link visible: ${isViewDetailsVisible ? 'PASS ✓' : 'FAIL ✗'}`);
    if (!isViewDetailsVisible) allPass = false;

    // Check single-open behavior: click second row's chevron in same card
    console.log('\n2. Single-Open Expansion Behavior:');
    const secondChevron = firstCard.locator('button[aria-expanded]').nth(1);
    if ((await secondChevron.count()) > 0) {
      await secondChevron.click();
      await sleep(600);

      const secondAria = await secondChevron.getAttribute('aria-expanded');
      const firstAriaAfter = await firstChevron.getAttribute('aria-expanded');
      const isSingleOpenOk = secondAria === 'true' && firstAriaAfter === 'false';
      console.log(`- Row 2 expanded, Row 1 automatically collapsed: ${isSingleOpenOk ? 'PASS ✓' : 'FAIL ✗'}`);
      if (!isSingleOpenOk) allPass = false;
    }

    // Capture desktop dark screenshot with row expanded
    const desktopDarkPath = path.join(outDir, 'showcase-expanded-desktop-dark.png');
    await pageDark.screenshot({ path: desktopDarkPath, fullPage: false });
    if (fs.existsSync(artifactDir)) {
      fs.copyFileSync(desktopDarkPath, path.join(artifactDir, 'showcase-expanded-desktop-dark.png'));
    }
    console.log('✓ Captured desktop dark screenshot');

    // Test Escape key closes panel
    console.log('\n3. Keyboard Accessibility (Escape Key):');
    await pageDark.keyboard.press('Escape');
    await sleep(500);
    const isPanelHidden = !(await expandedPanel.isVisible());
    console.log(`- Pressing Escape closes expanded panel: ${isPanelHidden ? 'PASS ✓' : 'FAIL ✗'}`);
    if (!isPanelHidden) allPass = false;

    await contextDark.close();

    // 2. Desktop Light Mode (1440px)
    console.log('\n4. Desktop (1440px, Light Mode):');
    const contextLight = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: 'light',
    });
    const pageLight = await contextLight.newPage();
    await pageLight.goto('http://127.0.0.1:3005/', { waitUntil: 'networkidle' });
    await sleep(1000);

    const lightCard = pageLight.locator('div[id^="category-"]').first();
    const lightChevron = lightCard.locator('button[aria-expanded]').first();
    await lightChevron.click();
    await sleep(600);

    const desktopLightPath = path.join(outDir, 'showcase-expanded-desktop-light.png');
    await pageLight.screenshot({ path: desktopLightPath, fullPage: false });
    if (fs.existsSync(artifactDir)) {
      fs.copyFileSync(desktopLightPath, path.join(artifactDir, 'showcase-expanded-desktop-light.png'));
    }
    console.log('✓ Captured desktop light screenshot');
    await contextLight.close();

    // 3. Mobile Dark Mode (390px)
    console.log('\n5. Mobile (390px, Dark Mode):');
    const contextMobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      colorScheme: 'dark',
    });
    const pageMobile = await contextMobile.newPage();
    await pageMobile.goto('http://127.0.0.1:3005/', { waitUntil: 'networkidle' });
    await sleep(1000);

    const mobileCard = pageMobile.locator('div[id^="category-"]').first();
    const mobileChevron = mobileCard.locator('button[aria-expanded]').first();
    await mobileChevron.click();
    await sleep(600);

    const mobileDarkPath = path.join(outDir, 'showcase-expanded-mobile-dark.png');
    await pageMobile.screenshot({ path: mobileDarkPath, fullPage: false });
    if (fs.existsSync(artifactDir)) {
      fs.copyFileSync(mobileDarkPath, path.join(artifactDir, 'showcase-expanded-mobile-dark.png'));
    }
    console.log('✓ Captured mobile dark screenshot');
    await contextMobile.close();

    console.log(`\n========================================`);
    console.log(`PHASE 2 SHOWCASE UPGRADE: ${allPass ? 'ALL TESTS PASSED ✓' : 'SOME TESTS FAILED ✗'}`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('Test execution error:', err);
    allPass = false;
  } finally {
    await browser.close();
    server.kill();
  }

  process.exit(allPass ? 0 : 1);
}

run();
