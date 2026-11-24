import { spawn, ChildProcess } from 'child_process';
import * as http from 'http';
import * as path from 'path';

async function get(url: string): Promise<{ status: number; body: string }> {
  const res = await fetch(url);
  const body = await res.text();
  return { status: res.status, body };
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Starting Next.js production server on 127.0.0.1:3005...');
  const nextBin = path.resolve('apps/web/node_modules/next/dist/bin/next');
  const server: ChildProcess = spawn(process.execPath, [nextBin, 'start', 'apps/web', '--hostname', '127.0.0.1', '--port', '3005'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  server.stdout?.on('data', (data) => console.log('[Server stdout]:', data.toString().trim()));
  server.stderr?.on('data', (data) => console.error('[Server stderr]:', data.toString().trim()));

  // Wait for server to be responsive
  let ready = false;
  for (let i = 0; i < 40; i++) {
    await sleep(1000);
    try {
      const res = await get('http://127.0.0.1:3005/');
      if (res.status === 200) {
        ready = true;
        console.log('✓ Next.js server is ready!');
        break;
      }
    } catch (e: any) {
      if (i % 5 === 0) console.log(`Waiting for server... (${i}s): ${e.message}`);
    }
  }

  if (!ready) {
    console.error('Server failed to start in time');
    server.kill();
    process.exit(1);
  }

  // Test endpoints
  const endpoints = ['/category/ott-platforms', '/new', '/popular'];
  let allPass = true;

  for (const ep of endpoints) {
    console.log(`\nTesting endpoint: ${ep}`);
    const res = await get(`http://127.0.0.1:3005${ep}`);
    console.log(`Status: ${res.status}`);

    if (res.status !== 200) {
      console.error(`✗ Expected 200, got ${res.status}`);
      allPass = false;
      continue;
    }

    const html = res.body;

    // 1. Check for absence of legacy banner
    const hasLegacyBanner = html.includes('Verified directory of official') || html.includes('Freshly curated websites and newly verified');
    console.log(`- Absence of legacy banner text: ${!hasLegacyBanner ? 'PASS ✓' : 'FAIL ✗'}`);

    // 2. Check for absence of visible breadcrumb
    const hasVisibleBreadcrumb = html.includes('aria-label="Breadcrumb"') || html.includes('aria-label="breadcrumb"');
    console.log(`- Absence of visible breadcrumb <nav>: ${!hasVisibleBreadcrumb ? 'PASS ✓' : 'FAIL ✗'}`);

    // 3. Check for absence of legacy toggle
    const hasLegacyToggle = html.includes('Has Mirrors') && html.includes('All') && html.includes('rounded-[10px] p-0.5');
    console.log(`- Absence of legacy All/Has Mirrors toggle: ${!hasLegacyToggle ? 'PASS ✓' : 'FAIL ✗'}`);

    // 4. Check for absence of legacy helper line
    const hasHelperLine = html.includes('Click row for mirrors · Click icon to open');
    console.log(`- Absence of legacy helper text: ${!hasHelperLine ? 'PASS ✓' : 'FAIL ✗'}`);

    // 5. Check for PageHeader components
    const hasH1 = html.includes('<h1');
    const hasSearch = html.includes('placeholder="Search');
    const hasFilterButton = html.includes('aria-haspopup="dialog"');
    console.log(`- Presence of H1: ${hasH1 ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`- Presence of Search Input: ${hasSearch ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`- Presence of Filter dropdown button: ${hasFilterButton ? 'PASS ✓' : 'FAIL ✗'}`);

    if (hasLegacyBanner || hasVisibleBreadcrumb || hasLegacyToggle || hasHelperLine || !hasH1 || !hasSearch || !hasFilterButton) {
      allPass = false;
    }
  }

  // Cleanup
  console.log('\nShutting down server...');
  server.kill('SIGTERM');

  if (allPass) {
    console.log('\n🎉 ALL PHASE 1 HEADER TESTS PASSED SUCCESSFULLY! 🎉\n');
    process.exit(0);
  } else {
    console.error('\n❌ SOME TESTS FAILED.\n');
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
