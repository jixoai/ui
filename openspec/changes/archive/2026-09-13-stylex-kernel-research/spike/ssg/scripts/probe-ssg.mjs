#!/usr/bin/env node
// probe-ssg.mjs — spike/ssg fixtures: D1-04 (prerendered class
// constants == built CSS), D1-05 (JS-on computed + link bytes),
// D1-06 (hydration console hygiene + data-style-src, dev AND prod),
// D1-07 (no-JS stylesheet-only render), D1-03 prod (render-blocking
// link responseEnd ≤ FCP), D1-08 prod (/dynamic runtime values),
// D1-09 prod parity, D1-10 dev (root .dark + density toggles on the
// DEV server — the runtimeInjection dev path), plus the per-page CSS
// bytes table. Assumes `npm run build` produced build/.
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { serveDir } from './serve.mjs';
import { launchEngine } from './browser.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const BUILD = `${ROOT}build`;
const PORT = Number(process.env.PORT || 5295);
const DEVPORT = Number(process.env.DEVPORT || 5296);
const ENGINE = process.env.ENGINE || 'chromium';

const results = [];
const record = (id, verdict, detail) => {
  results.push({ id, verdict });
  console.log(` ${verdict.padEnd(9)} ${id} — ${detail}`);
};

const browser = await launchEngine(ENGINE);
let exitCode = 0;
let devServer = null;
let devPid = 0;
try {
  if (!existsSync(BUILD)) throw new Error('missing build/ — run npm run build first');

  // ── D1-04: class attr in prerendered HTML == compiled constant ──
  {
    const html = readFileSync(`${BUILD}/index.html`, 'utf8');
    const cssFiles = readdirSync(`${BUILD}/_app/immutable/assets`).filter((f) => f.endsWith('.css'));
    const css = cssFiles.map((f) => readFileSync(`${BUILD}/_app/immutable/assets/${f}`, 'utf8')).join('\n');
    const m = /\.([a-z0-9]+)[^{]*\{[^}]*background-color:\s*#123456/.exec(css);
    const probeDiv = /<div class="([^"]*)" data-style-src[^>]* data-ssg="probe"/.exec(html);
    const htmlClasses = probeDiv ? probeDiv[1].split(/\s+/) : [];
    const ok = !!(m && probeDiv && htmlClasses.includes(m[1]) && htmlClasses.length > 0);
    record('D1-04', ok ? 'PASS' : 'FAIL',
      `built CSS rule class=${m ? m[1] : null}; prerendered class attr="${probeDiv ? probeDiv[1] : null}" (string-equal member check=${ok}); css assets=${JSON.stringify(cssFiles)}`);
  }

  const served = await serveDir(BUILD, PORT);
  {
    // D1-03 prod: fresh navigation, resource timing
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' });
    const m = await page.evaluate(async () => {
      const nav = performance.getEntriesByType('navigation')[0];
      const paints = performance.getEntriesByType('paint');
      const fcp = paints.find((p) => p.name === 'first-contentful-paint')?.startTime ?? null;
      const links = [...document.head.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href);
      const res = performance.getEntriesByType('resource').filter((r) => links.includes(r.name));
      const probe = document.querySelector('[data-ssg="probe"]');
      return {
        fcp,
        paints: paints.map((p) => `${p.name}@${p.startTime.toFixed(1)}`),
        styleReady: res.length ? Math.max(...res.map((r) => r.responseEnd)) : null,
        linkEnds: res.map((r) => `${r.name.split('/').pop()}=${r.responseEnd.toFixed(1)}`),
        navStart: nav?.startTime ?? null,
        probeBg: probe ? getComputedStyle(probe).backgroundColor : null,
        probeClass: probe ? probe.className : null,
      };
    });
    if (m.styleReady == null || m.fcp == null) {
      const noPaints = m.paints.length === 0;
      record('D1-03(prod)', noPaints ? 'LIMITATION' : 'FAIL', `style_ready=${m.styleReady} fcp=${m.fcp} paints=[${m.paints.join(',')}]`);
    } else {
      const gap = m.styleReady - m.fcp;
      const verdict = m.styleReady <= m.fcp ? 'PASS' : gap <= 100 ? 'SOFT-FAIL' : 'FAIL';
      record('D1-03(prod)', verdict, `style_ready(max responseEnd)=${m.styleReady.toFixed(1)}ms FCP_start=${m.fcp.toFixed(1)}ms gap=${gap.toFixed(1)}ms; links=[${m.linkEnds.join(', ')}]; navStart=${m.navStart}`);
    }

    // D1-05: computed == authored ∧ link bytes contain the class rule
    const classInBytes = await page.evaluate(async () => {
      const probe = document.querySelector('[data-ssg="probe"]');
      const cls = (probe.className || '').split(/\s+/).filter((c) => /^x/.test(c));
      const links = [...document.head.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href);
      const hits = [];
      for (const href of links) {
        const css = await (await fetch(href)).text();
        for (const c of cls) if (css.includes(`.${c}`)) hits.push(c);
      }
      return { hits, cls };
    });
    record('D1-05',
      m.probeBg === 'rgb(18, 52, 86)' && classInBytes.hits.length > 0 ? 'PASS' : 'FAIL',
      `computed=${m.probeBg} (expected rgb(18, 52, 86)); link bytes contain ${classInBytes.hits.length}/${classInBytes.cls.length} atomic classes (${JSON.stringify(classInBytes.hits)})`);

    // D1-09 prod parity (hover + keyframes on /)
    const hoverBase = await page.evaluate(() => getComputedStyle(document.querySelector('[data-ssg="hover"]')).backgroundColor);
    await page.hover('[data-ssg="hover"]');
    await page.waitForTimeout(250);
    const hoverOn = await page.evaluate(() => getComputedStyle(document.querySelector('[data-ssg="hover"]')).backgroundColor);
    const anim = await page.evaluate(() => {
      const el = document.querySelector('[data-ssg="keyframes"]');
      const a = el.getAnimations()[0];
      return { name: getComputedStyle(el).animationName, t1: a ? a.currentTime : null };
    });
    await page.waitForTimeout(120);
    const t2 = await page.evaluate(() => document.querySelector('[data-ssg="keyframes"]').getAnimations()[0]?.currentTime ?? null);
    const advances = anim.t1 != null && t2 != null && Number(t2) > Number(anim.t1);
    record('D1-09(prod)',
      hoverOn === 'rgb(255, 204, 0)' && hoverBase !== hoverOn && anim.name && anim.name !== 'none' && advances ? 'PASS' : 'FAIL',
      `:hover ${hoverBase}→${hoverOn}; animationName=${anim.name}; currentTime ${anim.t1?.toFixed?.(1)}→${t2?.toFixed?.(1)} (advances=${advances})`);
    await page.close();

    // D1-06 prod: hydration console + data-style-src
    const page6 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const msgs = [];
    const errs = [];
    page6.on('console', (msg) => msgs.push(`[${msg.type()}] ${msg.text()}`));
    page6.on('pageerror', (e) => errs.push(String(e)));
    await page6.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' });
    await page6.waitForTimeout(600);
    const attr = await page6.evaluate(() => document.querySelector('[data-ssg="probe"]')?.getAttribute('data-style-src') ?? null);
    const bad = msgs.filter((t) => /hydrat|mismatch/i.test(t));
    record('D1-06(prod)',
      bad.length === 0 && attr != null && errs.length === 0 ? 'PASS' : 'FAIL',
      `console=${JSON.stringify(msgs)} pageErrors=${JSON.stringify(errs)} data-style-src(after hydrate)=${JSON.stringify(attr)} (debug:true pinned both modes)`);
    await page6.close();

    // D1-07: no-JS
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
    const page7 = await ctx.newPage();
    await page7.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' });
    await page7.waitForTimeout(300);
    const bg = await page7.evaluate(() => {
      const el = document.querySelector('[data-ssg="probe"]');
      return el ? getComputedStyle(el).backgroundColor : null;
    });
    record('D1-07', bg === 'rgb(18, 52, 86)' ? 'PASS' : 'FAIL', `javascriptEnabled:false computed=${bg} (expected rgb(18, 52, 86) — stylesheet-only render)`);
    await ctx.close();

    // D1-08 prod: /dynamic runtime values
    const page8 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const dmsgs = [];
    page8.on('pageerror', (e) => dmsgs.push(String(e)));
    await page8.goto(`http://127.0.0.1:${PORT}/dynamic`, { waitUntil: 'load' });
    await page8.waitForSelector('[data-ssg="dyn-box"]', { timeout: 10_000 });
    const w1 = await page8.evaluate(() => getComputedStyle(document.querySelector('[data-ssg="dyn-box"]')).width);
    const s1 = await page8.evaluate(() => document.querySelector('[data-ssg="dyn-box"]').getAttribute('style'));
    await page8.evaluate(() => {
      const input = document.querySelectorAll('input[type="range"]')[0];
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, '320');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page8.waitForTimeout(250);
    const w2 = await page8.evaluate(() => getComputedStyle(document.querySelector('[data-ssg="dyn-box"]')).width);
    const s2 = await page8.evaluate(() => document.querySelector('[data-ssg="dyn-box"]').getAttribute('style'));
    record('D1-08(prod)',
      w1 === '160px' && w2 === '320px' && dmsgs.length === 0 ? 'PASS' : 'FAIL',
      `/dynamic width ${w1}→${w2}; mechanism=${s2 ? 'inline custom property (style attr ' + JSON.stringify(s2) + ')' : 'class swap'}; style before=${JSON.stringify(s1)}; pageErrors=${dmsgs.length}`);
    await page8.close();

    // ── per-page CSS bytes table ─────────────────────────────────
    console.log('\n── per-page CSS delivery table (prod build) ──');
    for (const route of ['/', '/dynamic']) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      const seen = [];
      page.on('response', async (res) => {
        const url = res.url();
        if (url.endsWith('.css') || url.endsWith('.html') || /\.js$/.test(url)) {
          try { seen.push({ file: url.replace(`http://127.0.0.1:${PORT}/`, ''), bytes: (await res.body()).length }); } catch {}
        }
      });
      await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: 'load' });
      await page.waitForTimeout(300);
      const css = seen.filter((s) => s.file.endsWith('.css'));
      const js = seen.filter((s) => s.file.endsWith('.js'));
      const cssTotal = css.reduce((a, b) => a + b.bytes, 0);
      console.log(` ${route.padEnd(9)} css=${cssTotal}B (${css.map((c) => `${c.file.split('/').pop()}:${c.bytes}B`).join(', ') || 'none'}) js=${js.reduce((a, b) => a + b.bytes, 0)}B (${js.length} files)`);
      await page.close();
    }
  }
  await served.close();

  // ── dev server: D1-06(dev) + D1-10(dev) ────────────────────────
  devServer = spawn('npx', ['vite', 'dev', '--port', String(DEVPORT), '--strictPort'], {
    cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], detached: true,
  });
  devPid = devServer.pid;
  let devLog = '';
  devServer.stdout.on('data', (d) => (devLog += d));
  devServer.stderr.on('data', (d) => (devLog += d));
  {
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline && !devLog.includes(`localhost:${DEVPORT}`)) await new Promise((r) => setTimeout(r, 250));

    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const msgs = [];
    const errs = [];
    page.on('console', (msg) => msgs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', (e) => errs.push(String(e)));
    await page.goto(`http://localhost:${DEVPORT}/`, { waitUntil: 'load' });
    await page.waitForFunction(
      () => getComputedStyle(document.querySelector('[data-ssg="probe"]')).backgroundColor === 'rgb(18, 52, 86)',
      { timeout: 20_000 },
    );
    await page.waitForTimeout(500);
    const attr = await page.evaluate(() => document.querySelector('[data-ssg="probe"]')?.getAttribute('data-style-src') ?? null);
    const bad = msgs.filter((t) => /hydrat|mismatch/i.test(t));
    record('D1-06(dev)',
      bad.length === 0 && attr != null && errs.length === 0 ? 'PASS' : 'FAIL',
      `console=${JSON.stringify(msgs.slice(0, 6))} pageErrors=${JSON.stringify(errs)} data-style-src=${JSON.stringify(attr)}`);

    // D1-10 dev: root .dark + data-density toggles, same-frame batch
    const flip = await page.evaluate(async () => {
      const k = document.querySelector('[data-ssg="k"]');
      const read = () => ({
        color: getComputedStyle(k).backgroundColor,
        pad: `${getComputedStyle(k).paddingTop} ${getComputedStyle(k).paddingLeft}`,
      });
      const before = read();
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-density', 'lg');
      const after = await new Promise((resolve) => requestAnimationFrame(() => resolve(read())));
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-density', 'default');
      const restored = await new Promise((resolve) => requestAnimationFrame(() => resolve(read())));
      return { before, after, restored };
    });
    const changed = flip.before.color !== flip.after.color && flip.before.pad !== flip.after.pad;
    const restores = flip.before.color === flip.restored.color && flip.before.pad === flip.restored.pad;
    record('D1-10(dev)',
      changed && restores ? 'PASS' : 'FAIL',
      `same-frame batch: color ${flip.before.color}→${flip.after.color}, padding ${flip.before.pad}→${flip.after.pad} (changed=${changed}); restore-equal=${restores} [ssg dev = runtimeInjection: stylex rules UNLAYERED in dev]`);
    await page.close();
  }
} catch (err) {
  console.error('[probe-ssg] fatal:', err);
  exitCode = 1;
} finally {
  await browser.close().catch(() => {});
  if (devServer) {
    try { process.kill(-devPid, 'SIGTERM'); } catch { try { devServer.kill('SIGTERM'); } catch {} }
    await new Promise((r) => setTimeout(r, 800));
    let alive = false, groupAlive = false;
    try { process.kill(devPid, 0); alive = true; } catch {}
    try { process.kill(-devPid, 0); groupAlive = true; } catch {}
    if (alive || groupAlive) { try { process.kill(-devPid, 'SIGKILL'); } catch {} try { devServer.kill('SIGKILL'); } catch {} }
    console.log(`[probe-ssg] dev server pid=${devPid} recycled (alive after SIGTERM: ${alive}, group: ${groupAlive}${alive || groupAlive ? ' → SIGKILL sent' : ''})`);
  }
}

const fails = results.filter((r) => r.verdict === 'FAIL' || r.verdict === 'SOFT-FAIL');
console.log(`\n[probe-ssg:${ENGINE}] ${results.length - fails.length}/${results.length} green`);
process.exit(fails.length ? 1 : exitCode);
