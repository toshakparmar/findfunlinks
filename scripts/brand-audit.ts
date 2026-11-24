import * as fs from 'fs';
import * as path from 'path';

const IGNORE_DIRS = new Set([
  '.git',
  'node_modules',
  '.next',
  'dist',
  '.turbo',
  'coverage',
  'scratch',
  '.pgdata',
]);

const ALLOW_LIST_FILES = new Set([
  'docs/ui/CHANGELOG.md',
  'docs/CHANGELOG.md',
  'docs/BRAND_MIGRATION.md',
  'docs/DECISIONS.md',
  'scripts/generate-migration-doc.js',
  'scripts/rebrand-replace.js',
  'scripts/brand-audit.ts',
  'docs/iteration-3-prompt.md',
  'pnpm-lock.yaml',
]);

const FORBIDDEN_PATTERNS = [/findfun/i, /find\s+fun/i, /\bffl[_-]/i];

let violationsCount = 0;
const violations: { file: string; line?: number; text: string; reason: string }[] = [];

function checkFile(filePath: string) {
  const normPath = filePath.replace(/\\/g, '/');

  // Check filename for old brand
  const fileName = path.basename(filePath);
  if (/findfun/i.test(fileName) || /find\s*fun/i.test(fileName)) {
    violations.push({
      file: normPath,
      text: fileName,
      reason: 'Filename contains forbidden brand pattern',
    });
    violationsCount++;
  }

  if (ALLOW_LIST_FILES.has(normPath)) {
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(line)) {
          // Allow comments explicitly marked as migration reference
          if (line.includes('brand-audit:ignore')) continue;

          violations.push({
            file: normPath,
            line: idx + 1,
            text: line.trim().slice(0, 120),
            reason: `Matches forbidden pattern: ${pattern}`,
          });
          violationsCount++;
          break;
        }
      }
    });
  } catch (err) {
    // binary files
  }
}

function walkDir(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile()) {
      checkFile(fullPath);
    }
  }
}

console.log('🔍 Running FinalLinks Brand Audit Check...');
walkDir('.');

if (violationsCount > 0) {
  console.error(`\n❌ Brand Audit Failed: ${violationsCount} violation(s) found!`);
  violations.slice(0, 25).forEach((v) => {
    console.error(`  - ${v.file}${v.line ? `:${v.line}` : ''} -> ${v.text} (${v.reason})`);
  });
  if (violations.length > 25) {
    console.error(`  ... and ${violations.length - 25} more violations.`);
  }
  process.exit(1);
} else {
  console.log('✅ Brand Audit Passed: Zero old brand references found!');
  process.exit(0);
}
