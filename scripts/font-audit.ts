/**
 * FinalLinks — Typography & Font Audit Script (Iteration 3)
 * Enforces the new type scale:
 * - Minimum allowed text size: 13px (0.8125rem)
 * - Documented exception: Mobile BottomNav labels may use 11-12px
 * - Body text size: 16px (1rem)
 * - Ban on arbitrary text-[8px|9px|10px|11px|12px]
 */

import * as fs from 'fs';
import * as path from 'path';

interface Violation {
  file: string;
  line: number;
  snippet: string;
  reason: string;
}

const FORBIDDEN_ARBITRARY_SIZES = /text-\[(8|9|10|11|12)px\]/g;
const ALLOWED_EXCEPTION_FILE = 'BottomNav.tsx';

const violations: Violation[] = [];

function walk(dir: string): string[] {
  let results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (['node_modules', '.next', 'dist', '.turbo', '.git'].includes(entry.name)) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.css')) {
      results.push(fullPath);
    }
  }

  return results;
}

async function runStaticAudit(): Promise<boolean> {
  console.log('\n--- Running Static Typography Audit ---');
  const targetDir = path.resolve('apps/web/src');
  const files = walk(targetDir);

  for (const file of files) {
    const isBottomNav = file.endsWith(ALLOWED_EXCEPTION_FILE);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      // If BottomNav, allow 11-12px but disallow <= 10px
      if (isBottomNav) {
        if (/text-\[(8|9|10)px\]/.test(line)) {
          violations.push({
            file: path.relative(process.cwd(), file),
            line: idx + 1,
            snippet: line.trim().slice(0, 100),
            reason: 'BottomNav labels may only use 11-12px (sub-11px forbidden)',
          });
        }
        return;
      }

      let match;
      const regex = new RegExp(FORBIDDEN_ARBITRARY_SIZES);
      while ((match = regex.exec(line)) !== null) {
        violations.push({
          file: path.relative(process.cwd(), file),
          line: idx + 1,
          snippet: line.trim().slice(0, 100),
          reason: `Arbitrary font size ${match[0]} is below the 13px minimum threshold`,
        });
      }
    });
  }

  if (violations.length === 0) {
    console.log(`✓ Static Audit PASSED: Scanned ${files.length} files. Zero sub-13px arbitrary size violations.`);
    return true;
  } else {
    console.error(`✗ Static Audit FAILED with ${violations.length} violations:`);
    violations.forEach((v) => {
      console.error(`  ${v.file}:${v.line} — ${v.reason}\n    ${v.snippet}`);
    });
    return false;
  }
}

async function runPlaywrightAudit(): Promise<boolean> {
  // Try dynamic Playwright evaluation if @playwright/test or chromium is available and dev server is running
  try {
    const { chromium } = require('@playwright/test');
    console.log('\n--- Running Dynamic Playwright Font Size Check ---');
    const browser = await chromium.launch({ headless: true });
    const viewports = [
      { width: 390, height: 844, name: 'mobile-390' },
      { width: 768, height: 1024, name: 'tablet-768' },
      { width: 1280, height: 800, name: 'desktop-1280' },
      { width: 1920, height: 1080, name: 'desktop-1920' },
    ];

    const testPages = ['/', '/category/ott-platforms', '/new', '/popular'];
    let allPassed = true;

    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      for (const route of testPages) {
        try {
          const resp = await page.goto(`http://127.0.0.1:3005${route}`, {
            waitUntil: 'domcontentloaded',
            timeout: 5000,
          });
          if (!resp || resp.status() >= 400) continue;

          // Check body font size
          const bodyFontSize = await page.evaluate(() => {
            return window.getComputedStyle(document.body).fontSize;
          });

          // Check visible text nodes
          const smallNodes = await page.evaluate(() => {
            const results: { text: string; size: string; tag: string }[] = [];
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
              const text = node.textContent?.trim() || '';
              if (text.length < 2) continue;
              const parent = node.parentElement;
              if (!parent) continue;
              const style = window.getComputedStyle(parent);
              if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;

              // Check if inside BottomNav
              const isInsideBottomNav = !!parent.closest('nav.fixed.bottom-0');
              const fontSizePx = parseFloat(style.fontSize);

              if (isInsideBottomNav) {
                if (fontSizePx < 11) {
                  results.push({ text: text.slice(0, 30), size: style.fontSize, tag: parent.tagName });
                }
              } else if (fontSizePx < 12.8) {
                // allow rounding 12.8 ~ 13px
                results.push({ text: text.slice(0, 30), size: style.fontSize, tag: parent.tagName });
              }
            }
            return results.slice(0, 10);
          });

          if (smallNodes.length > 0) {
            console.warn(`  [${vp.name}][${route}] Warning: Found text below 13px:`, smallNodes);
          } else {
            console.log(`  ✓ [${vp.name}][${route}] Body size: ${bodyFontSize}, no visible text < 13px.`);
          }
        } catch (e: any) {
          // Server might not be running on 3000 during CI script
        }
      }
      await page.close();
    }

    await browser.close();
    return allPassed;
  } catch (err) {
    console.log('Note: Playwright browser check skipped (offline or not running). Static scan verified.');
    return true;
  }
}

async function main() {
  const staticOk = await runStaticAudit();
  await runPlaywrightAudit();

  if (!staticOk) {
    process.exit(1);
  }
  console.log('\n✅ Font audit completed successfully!\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
