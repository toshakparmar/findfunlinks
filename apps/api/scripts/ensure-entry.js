const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const srcMain = path.join(distDir, 'src', 'main.js');
const rootMain = path.join(distDir, 'main.js');

if (fs.existsSync(srcMain) && !fs.existsSync(rootMain)) {
  fs.writeFileSync(rootMain, "require('./src/main.js');\n");
  console.log('[ensure-entry] Created dist/main.js entry bridge -> dist/src/main.js');
}
