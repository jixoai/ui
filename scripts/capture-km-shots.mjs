#!/usr/bin/env node
// Vision-lane capture (katex-mermaid, 2026-09-07): serves apps/www/dist
// on a loopback OS-assigned port, opens the three new docs pages in
// light + dark, and saves full-page PNGs for the vision subagent.
// Read-only for the repo — screenshots land in .agents/images/.
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'apps/www/dist');
const outDir = join(root, '.agents/images/2026-09-07-katex-mermaid');
existsSync(outDir) || mkdirSync(outDir, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };
const server = createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p.endsWith('/')) p += 'index.html';
  const file = join(dist, p);
  if (!file.startsWith(dist) || !existsSync(file) || !statSync(file).isFile()) { res.statusCode = 404; res.end('nope'); return; }
  res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

function findChrome() {
  const cache = join(homedir(), 'Library/Caches/ms-playwright');
  if (existsSync(cache)) {
    const versions = readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().reverse();
    for (const v of versions) for (const n of ['Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium']) {
      const p = join(cache, v, n);
      if (existsSync(p)) return p;
    }
  }
  return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}

const browser = await chromium.launch({ executablePath: findChrome() });
// TALL viewport, not fullPage: the scaffold scrolls inside its own
// main container, so Playwright's fullPage expansion captures only the
// first screenful — a 1440x9000 stage makes the whole page one shot
const page = await browser.newPage({ viewport: { width: 1440, height: 9000 } });
const pages = ['math-block', 'math-inline', 'mermaid'];
for (const name of pages) {
  for (const theme of ['light', 'dark']) {
    await page.goto(`${base}/docs/components/${name}.html`, { waitUntil: 'networkidle' });
    await page.evaluate((t) => { document.documentElement.classList.toggle('dark', t === 'dark'); }, theme);
    if (name === 'mermaid') await page.waitForTimeout(1800); // the auto re-render after the flip
    await page.screenshot({ path: join(outDir, `${name}-${theme}.png`) });
    console.log('shot', `${name}-${theme}.png`);
  }
}
await browser.close();
server.close();
console.log('DONE →', outDir);
