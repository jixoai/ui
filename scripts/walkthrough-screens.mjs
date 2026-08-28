#!/usr/bin/env node
// walkthrough-screens.mjs — 分段截图走查工具
// 打开文档页，滚动 .jx-shell-body 到每个 h2/h3 区块，逐段截视口图。
// 用法: node scripts/walkthrough-screens.mjs input range checkbox [...]
// 产物: /tmp/jx-walkthrough/<page>-<n>-<slug>.png
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const port = process.env.WALK_PORT ?? 5201;
const pages = process.argv.slice(2);
if (!pages.length) {
  console.error('usage: node walkthrough-screens.mjs <page> [<page>...]');
  process.exit(1);
}
const outDir = '/tmp/jx-walkthrough';
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-proxy-server'],
});

for (const page of pages) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const pg = await ctx.newPage();
  await pg.goto(`http://localhost:${port}/docs/components/${page}.html`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await pg.waitForTimeout(1800); // 等 shiki 高亮与水合

  const stops = await pg.evaluate(() => {
    const sc = document.querySelector('.jx-shell-body');
    if (!sc) return [];
    return [...sc.querySelectorAll('h2, h3')].map((h) => ({
      slug: h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40),
      y: Math.round(h.getBoundingClientRect().top + sc.scrollTop),
    }));
  });
  let i = 0;
  for (const stop of stops) {
    await pg.evaluate((y) => {
      document.querySelector('.jx-shell-body').scrollTo({ top: y - 90 });
    }, stop.y);
    await pg.waitForTimeout(500);
    const file = `${outDir}/${page}-${String(i).padStart(2, '0')}-${stop.slug}.png`;
    await pg.screenshot({ path: file });
    console.log(file);
    i++;
  }
  await ctx.close();
}
await browser.close();
