const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = new Set([
  '.git',
  'node_modules',
  '.next',
  'dist',
  '.turbo',
  'coverage',
  'scratch',
]);

const IGNORE_FILES = new Set([
  'docs/BRAND_MIGRATION.md',
  'scripts/rebrand-replace.js',
  'scripts/generate-migration-doc.js',
  'pnpm-lock.yaml',
]);

const REPLACEMENTS = [
  // Package scopes & monorepo name
  { from: /@findfunlinks\//g, to: '@finallinks/' },
  { from: /findfunlinks-monorepo/g, to: 'finallinks-monorepo' },

  // Cookie and storage prefixes
  { from: /ffl_token/g, to: 'fl_token' },
  { from: /ffl_refresh_token/g, to: 'fl_refresh_token' },
  { from: /ffl_session/g, to: 'fl_session' },
  { from: /ffl_favorites/g, to: 'fl_favorites' },
  { from: /ffl_recent_searches/g, to: 'fl_recent_searches' },
  { from: /ffl_theme/g, to: 'fl_theme' },
  { from: /\bffl_/g, to: 'fl_' },
  { from: /\bffl-/g, to: 'fl-' },

  // Brand Name exact matches
  { from: /FindFunLinks/g, to: 'FinalLinks' },
  { from: /FINDFUNLINKS/g, to: 'FINALLINKS' },
  { from: /Find Fun Links/g, to: 'FinalLinks' },
  { from: /FindFun Links/g, to: 'FinalLinks' },
  { from: /find-fun-links/g, to: 'finallinks' },
  { from: /find_fun_links/g, to: 'finallinks' },
  { from: /findfunlinks\.com/g, to: 'finallinks.com' },
  { from: /findfunlinks/g, to: 'finallinks' },
  { from: /findfun/g, to: 'finallinks' },
  { from: /FindFun/g, to: 'Final' },
];

let modifiedCount = 0;

function processFile(filePath) {
  const normPath = filePath.replace(/\\/g, '/');
  if (IGNORE_FILES.has(normPath)) return;

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const r of REPLACEMENTS) {
      content = content.replace(r.from, r.to);
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedCount++;
      console.log(`Updated: ${normPath}`);
    }
  } catch (err) {
    // binary files
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile()) {
      processFile(fullPath);
    }
  }
}

walk('.');
console.log(`\nRebrand replacement complete! Total modified files: ${modifiedCount}`);
