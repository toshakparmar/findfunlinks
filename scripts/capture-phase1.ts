import { chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const outDir = path.resolve('docs/ui/v3/phase1');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const viewports = [
  { width: 390, height: 844, name: 'mobile-390' },
  { width: 768, height: 1024, name: 'tablet-768' },
  { width: 1280, height: 800, name: 'desktop-1280' },
  { width: 1920, height: 1080, name: 'desktop-1920' },
];

const routes = [
  { path: '/category/ott-platforms', slug: 'category-ott' },
  { path: '/new', slug: 'new' },
  { path: '/popular', slug: 'popular' },
];

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function capture() {
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

  console.log('Launching browser to capture Phase 1 screenshots...');
  const browser = await chromium.launch({ headless: true });

  for (const theme of ['dark', 'light']) {
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme as 'dark' | 'light',
      });
      const page = await context.newPage();

      for (const route of routes) {
        try {
          await page.goto(`http://127.0.0.1:3005${route.path}`, {
            waitUntil: 'domcontentloaded',
            timeout: 10000,
          });

          // Set theme class on html element
          await page.evaluate((t) => {
            document.documentElement.classList.remove('dark', 'light');
            document.documentElement.classList.add(t);
            document.documentElement.setAttribute('data-theme', t);
          }, theme);

          await page.waitForTimeout(400);

          const fileName = `${route.slug}-${vp.name}-${theme}.png`;
          const filePath = path.join(outDir, fileName);
          await page.screenshot({ path: filePath, fullPage: false });
          console.log(`Saved screenshot: ${fileName}`);
        } catch (e: any) {
          console.error(`Error capturing ${route.path} on ${vp.name} (${theme}):`, e.message);
        }
      }
      await page.close();
      await context.close();
    }
  }

  await browser.close();
  console.log('Shutting down server...');
  server.kill('SIGTERM');
  console.log('Capture complete!');
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
