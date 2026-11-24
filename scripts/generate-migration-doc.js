const fs = require('fs');
const scan = JSON.parse(fs.readFileSync('migration_scan.json', 'utf8'));

const groups = {
  'Package & Workspace Config': [],
  'apps/web (Public Portal)': [],
  'apps/admin (Admin Panel)': [],
  'apps/owner (Owner Panel)': [],
  'apps/api (Backend NestJS)': [],
  'packages/contracts': [],
  'packages/api-client': [],
  'packages/ui': [],
  'packages/config': [],
  'Tests & E2E': [],
  'Documentation & Specs': [],
  'Infrastructure & Others': [],
};

for (const [file, occurrences] of Object.entries(scan)) {
  let group = 'Infrastructure & Others';
  if (file.startsWith('apps/web/')) group = 'apps/web (Public Portal)';
  else if (file.startsWith('apps/admin/')) group = 'apps/admin (Admin Panel)';
  else if (file.startsWith('apps/owner/')) group = 'apps/owner (Owner Panel)';
  else if (file.startsWith('apps/api/')) group = 'apps/api (Backend NestJS)';
  else if (file.startsWith('packages/contracts/')) group = 'packages/contracts';
  else if (file.startsWith('packages/api-client/')) group = 'packages/api-client';
  else if (file.startsWith('packages/ui/')) group = 'packages/ui';
  else if (file.startsWith('packages/config/')) group = 'packages/config';
  else if (file.startsWith('tests/')) group = 'Tests & E2E';
  else if (file.startsWith('docs/')) group = 'Documentation & Specs';
  else if (
    file.includes('package.json') ||
    file.includes('workspace') ||
    file.includes('turbo') ||
    file.includes('tsconfig')
  )
    group = 'Package & Workspace Config';

  groups[group].push({ file, count: occurrences.length, occurrences });
}

let md = '# FinalLinks — Brand Migration Audit Report\n\n';
md +=
  'This document catalogues every reference to the previous brand name (`FindFunLinks`, `findfunlinks`, `find-fun-links`, `find_fun_links`, `ffl`) grouped by codebase area before Phase 1 replacements.\n\n';
md += `**Total affected files:** ${Object.keys(scan).length}\n\n`;

for (const [groupName, files] of Object.entries(groups)) {
  if (files.length === 0) continue;
  md += `## ${groupName} (${files.length} files)\n\n`;
  for (const f of files) {
    md += `- **\`${f.file}\`** (${f.count} hits)\n`;
    for (const occ of f.occurrences.slice(0, 5)) {
      md += `  - L${occ.line}: \`${occ.text.replace(/`/g, "'")}\`\n`;
    }
    if (f.occurrences.length > 5) {
      md += `  - *(and ${f.occurrences.length - 5} more lines)*\n`;
    }
  }
  md += '\n';
}

fs.writeFileSync('docs/BRAND_MIGRATION.md', md);
console.log('Generated docs/BRAND_MIGRATION.md successfully');
