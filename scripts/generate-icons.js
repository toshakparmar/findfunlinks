const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPng(width, height, drawFn) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines
  const rowStride = 1 + width * 4;
  const rawData = Buffer.alloc(rowStride * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowStride;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Distance from point (px, py) to line segment (x1, y1)-(x2, y2)
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// Chain link icon renderer
function drawChainLink(x, y, w, h) {
  const nx = (x / w) * 100;
  const ny = (y / h) * 100;

  // Blue: #2563EB -> rgb(37, 99, 235)
  const blue = [37, 99, 235];
  const strokeRadius = 4.5;

  // Loop 1 (top-right): center line from (52, 40) to (66, 26), arc to (86, 46), back to (72, 60)
  // Distance to top loop segment 1: (52, 40)-(66, 26)
  const d1 = distToSegment(nx, ny, 52, 40, 66, 26);
  // Cap at (76, 36) with radius ~14
  const loop1Dist = Math.abs(Math.hypot(nx - 76, ny - 36) - 14.14);
  const isTopLoopArc = nx + ny > 102 && nx - ny < 60 && nx - ny > 20;

  // Loop 2 (bottom-left):
  const d2 = distToSegment(nx, ny, 48, 60, 34, 74);
  const loop2Dist = Math.abs(Math.hypot(nx - 24, ny - 64) - 14.14);
  const isBottomLoopArc = nx + ny < 98 && nx - ny < -20 && nx - ny > -60;

  // Center line: (39, 61) to (61, 39)
  const dBridge = distToSegment(nx, ny, 39, 61, 61, 39);

  let minDist = Math.min(d1, d2, dBridge);
  if (isTopLoopArc) minDist = Math.min(minDist, loop1Dist);
  if (isBottomLoopArc) minDist = Math.min(minDist, loop2Dist);

  // Anti-aliased stroke
  const edgeDist = strokeRadius - minDist;
  if (edgeDist < -1) {
    return [0, 0, 0, 0]; // Transparent
  }
  const alpha = Math.max(0, Math.min(1, edgeDist + 0.5));
  return [blue[0], blue[1], blue[2], Math.round(alpha * 255)];
}

function createIco(pngBuffers) {
  // ICONDIR header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(pngBuffers.length, 4); // count

  let offset = 6 + pngBuffers.length * 16;
  const entries = [];
  for (const { width, height, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map((p) => p.buffer)]);
}

function main() {
  const logoDir = path.join(__dirname, '../packages/ui/assets/logo');
  if (!fs.existsSync(logoDir)) {
    fs.mkdirSync(logoDir, { recursive: true });
  }

  const sizes = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];

  for (const { name, size } of sizes) {
    const png = createPng(size, size, drawChainLink);
    fs.writeFileSync(path.join(logoDir, name), png);
    console.log(`Generated ${name} (${size}x${size})`);
  }

  // Favicon sizes (16, 32, 48)
  const icoPngs = [16, 32, 48].map((size) => ({
    width: size,
    height: size,
    buffer: createPng(size, size, drawChainLink),
  }));

  const ico = createIco(icoPngs);
  fs.writeFileSync(path.join(logoDir, 'favicon.ico'), ico);
  console.log('Generated favicon.ico (16, 32, 48)');

  // Copy to apps/web/public and apps/admin/public
  const targets = [
    path.join(__dirname, '../apps/web/public'),
    path.join(__dirname, '../apps/admin/public'),
  ];

  for (const target of targets) {
    if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
    fs.writeFileSync(path.join(target, 'favicon.ico'), ico);
    for (const { name, size } of sizes) {
      fs.writeFileSync(path.join(target, name), createPng(size, size, drawChainLink));
    }
    console.log(`Copied icons to ${target}`);
  }
}

main();
