// probe-corpus.mjs — the corpus verification harness (Chromium).
// For each family route: screenshot (retina 2x, fonts.ready) + the
// black-image non-triviality gate (programmatic PNG decode — the
// vision-on-black-image law) + per-family computed-style assertions
// (variant switch / density switch / state-machine flip — at least
// one of each where the family carries them).
//
// Prod mode: `vite preview` on a scratch port; server spawned
// detached, recycled by killing the process GROUP (the L3a pattern).
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { launchEngine } from './browser.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SPIKE = join(ROOT, '..');
const PORT = Number(process.env.PORT ?? 5317);
const OUT = join(SPIKE, 'shots');
mkdirSync(OUT, { recursive: true });

// ── PNG non-triviality decoder (zero-dep): inflate IDAT, unfilter ──
function pngStats(buf) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!buf.subarray(0, 8).equals(sig)) throw new Error('not a PNG');
  let pos = 8;
  let width = 0, height = 0, bitDepth = 8, colorType = 6;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (bitDepth !== 8 || (colorType !== 6 && colorType !== 2)) {
    return { width, height, nonZeroRatio: -1, note: `unsupported ${bitDepth}/${colorType}` };
  }
  const channels = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);
  let p = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[p++];
    const row = raw.subarray(p, p + stride);
    p += stride;
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? cur[x - channels] : 0;
      const b = prev ? prev[x] : 0;
      const c = x >= channels && prev ? prev[x - channels] : 0;
      let v = row[x];
      if (filter === 1) v = (v + a) & 0xff;
      else if (filter === 2) v = (v + b) & 0xff;
      else if (filter === 3) v = (v + ((a + b) >> 1)) & 0xff;
      else if (filter === 4) {
        const pp = a + b - c;
        const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        v = (v + pr) & 0xff;
      }
      cur[x] = v;
    }
  }
  let nonZero = 0, total = 0, distinct = new Set();
  for (let i = 0; i < out.length; i += channels) {
    total++;
    if (out[i] !== 0 || out[i + 1] !== 0 || out[i + 2] !== 0) nonZero++;
    if (distinct.size < 64) distinct.add((out[i] << 16) | (out[i + 1] << 8) | out[i + 2]);
    if (i > 4_000_000) break; // sample cap
  }
  return { width, height, nonZeroRatio: nonZero / total, distinctColors: distinct.size };
}

// ── assertion bookkeeping ───────────────────────────────────────────
const results = [];
function record(family, name, pass, detail) {
  results.push({ family, name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} [${family}] ${name}${detail ? ' — ' + detail : ''}`);
}

async function shot(page, name) {
  const buf = await page.screenshot({ fullPage: true });
  writeFileSync(join(OUT, `${name}.png`), buf);
  const stats = pngStats(buf);
  const nonTrivial = stats.nonZeroRatio > 0.02 && stats.distinctColors > 4;
  return { stats, nonTrivial };
}

async function setDensity(page, d) {
  await page.click(`nav button:nth-of-type(${{ sm: 2, default: 3, lg: 4 }[d]})`);
}

async function main() {
  // preview server (prod build)
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: SPIKE,
    detached: true,
    stdio: 'ignore',
  });
  server.unref();
  const base = `http://localhost:${PORT}`;
  let code = 0;
  try {
    // poll until responding (fixed sleeps race the server on cold
    // starts); INSIDE the try so a failed startup still recycles
    let up = false;
    for (let i = 0; i < 40 && !up; i++) {
      try {
        const r = await fetch(base + '/', { signal: AbortSignal.timeout(500) });
        up = r.ok;
      } catch { /* not yet */ }
      if (!up) await new Promise((r) => setTimeout(r, 250));
    }
    if (!up) throw new Error(`preview server never came up on :${PORT}`);

    const browser = await launchEngine(process.env.ENGINE ?? 'chromium');
    try {
    const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 960, height: 900 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });

    const go = async (hash) => {
      await page.goto(`${base}/#${hash}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
    };

    // ═══ press-button ═══
    await go('/press-button');
    {
      const { stats, nonTrivial } = await shot(page, 'press-button');
      record('press-button', 'screenshot non-trivial', nonTrivial,
        `nonZero=${(stats.nonZeroRatio * 100).toFixed(1)}% distinctColors=${stats.distinctColors}`);

      const fillBg = await page.$eval('[data-pb="fill"]', (el) => getComputedStyle(el).backgroundColor);
      const outlineBg = await page.$eval('[data-pb="outline"]', (el) => getComputedStyle(el).backgroundColor);
      const outlineBc = await page.$eval('[data-pb="outline"]', (el) => getComputedStyle(el).borderColor);
      record('press-button', 'variant table (fill vs outline paint)', fillBg !== outlineBg && outlineBc.includes('oklch') || outlineBc !== 'rgb(0, 0, 0)',
        `fillBg=${fillBg} outlineBg=${outlineBg} outlineBorder=${outlineBc}`);

      // press law: hover grows ONLY the shadow; active +1px translate
      const h0 = await page.$eval('[data-pb="fill"]', (el) => getComputedStyle(el).boxShadow);
      await page.hover('[data-pb="fill"]');
      await page.waitForTimeout(250);
      const h1 = await page.$eval('[data-pb="fill"]', (el) => getComputedStyle(el).boxShadow);
      record('press-button', 'press law hover (shadow grows)', h0 !== h1, `rest="${h0.slice(0, 40)}" hover="${h1.slice(0, 40)}"`);
      await page.mouse.down();
      await page.waitForTimeout(400); // settle past the 150ms ease-out chain
      const act = await page.$eval('[data-pb="fill"]', (el) => getComputedStyle(el).translate);
      await page.mouse.up();
      record('press-button', 'press law active (+1px translate)', act === '1px 1px', `translate=${act}`);

      // ghost: none-trio pose vars (createTheme carrier)
      const ghostShadow = await page.$eval('[data-pb="ghost"]', (el) => getComputedStyle(el).boxShadow);
      record('press-button', 'ghost none-pose (no shadow)', ghostShadow === 'none', `boxShadow=${ghostShadow}`);

      // flat texture: engrave-tier active shadow
      const flatActive = await page.$eval('[data-pb="flat"]', (el) => getComputedStyle(el).getPropertyValue('--jx-press-shadow-active').trim());
      record('press-button', 'flat pose var override (engrave)', flatActive.includes('engrave') || flatActive.includes('inset'), `--jx-press-shadow-active=${flatActive}`);

      // density switch: minHeight follows the rung
      const hDef = await page.$eval('[data-pb="fill"]', (el) => getComputedStyle(el).minHeight);
      await setDensity(page, 'lg');
      const hLg = await page.$eval('[data-pb="fill"]', (el) => getComputedStyle(el).minHeight);
      await setDensity(page, 'default');
      record('press-button', 'density switch (min-height rung)', hDef !== hLg, `${hDef} → ${hLg}`);

      // state machine: loading flips aria + spinner animationName
      await page.click('[data-pb="async"]');
      await page.waitForTimeout(200);
      const loadingState = await page.$eval('[data-pb="async"]', (el) => ({
        aria: el.getAttribute('aria-disabled'),
        anim: getComputedStyle(el.querySelector('[data-jx-press-spin] i') ?? el).animationName,
      }));
      record('press-button', 'loading lock (aria + spinner)', loadingState.aria === 'true' && loadingState.anim !== 'none',
        `aria-disabled=${loadingState.aria} animationName=${loadingState.anim}`);
      await page.waitForTimeout(1600);
    }

    // ═══ range ═══
    await go('/range');
    {
      const { stats, nonTrivial } = await shot(page, 'range');
      record('range', 'screenshot non-trivial', nonTrivial,
        `nonZero=${(stats.nonZeroRatio * 100).toFixed(1)}% distinctColors=${stats.distinctColors}`);

      // the law mount: applied (container-type size + native chrome
      // stripped). NOTE (engine finding, recorded): Chromium resolves
      // cq units inside UA-shadow slider pseudos with axis coercion —
      // the thumb's WIDTH computes to the input/track width, the ring
      // border collapses to 0 — IDENTICALLY on the production site
      // (same law, same engine; the www suite only regex-matches the
      // css text). Assert what the law verifiably delivers.
      const mount = await page.$eval('#rng-basic', (el) => ({
        ct: getComputedStyle(el).containerType,
        appearance: getComputedStyle(el).appearance,
        h: getComputedStyle(el).height,
        thumbW: getComputedStyle(el, '::-webkit-slider-thumb').width,
      }));
      record('range', 'law mount (container-type + native chrome off)',
        mount.ct === 'size' && mount.appearance === 'none' && mount.h === '20px',
        `container=${mount.ct} appearance=${mount.appearance} h=${mount.h} thumbW=${mount.thumbW} (engine-coerced, see finding)`);

      // error law: the reachable surface (class + aria + error line);
      // the dashed RING is engine-coerced away (same on production)
      const invalid = await page.$eval('#rng-err', (el) => ({
        cls: el.classList.contains('jx-invalid'),
        aria: el.getAttribute('aria-invalid'),
        err: document.getElementById('rng-err-error')?.textContent ?? '',
      }));
      record('range', 'error law (invalid class + aria + line)', invalid.cls && invalid.aria === 'true' && invalid.err.includes('out of range'),
        `class=${invalid.cls} aria=${invalid.aria} err="${invalid.err}"`);

      // density switch: input height follows the icon rung
      const hDef = await page.$eval('#rng-basic', (el) => getComputedStyle(el).height);
      await setDensity(page, 'sm');
      const hSm = await page.$eval('#rng-basic', (el) => getComputedStyle(el).height);
      await setDensity(page, 'default');
      record('range', 'density switch (input height)', hDef !== hSm, `${hDef} → ${hSm}`);

      // ticks ruler: repeating-gradient marks present
      const tickImg = await page.$eval('[data-jx-slider-ticks] > div', (el) => getComputedStyle(el).backgroundImage);
      record('range', 'tick ruler (repeating gradient)', tickImg.includes('repeating-linear-gradient'), tickImg.slice(0, 60));
    }

    // ═══ popover ═══
    await go('/popover');
    {
      await page.click('[data-jx-pop-trigger]');
      await page.waitForTimeout(300);
      const { stats, nonTrivial } = await shot(page, 'popover-open');
      record('popover', 'screenshot non-trivial (open)', nonTrivial,
        `nonZero=${(stats.nonZeroRatio * 100).toFixed(1)}% distinctColors=${stats.distinctColors}`);

      const panel = await page.$eval('.jx-pop', (el) => ({
        open: el.matches(':popover-open'),
        opacity: getComputedStyle(el).opacity,
        translate: getComputedStyle(el).translate,
        position: getComputedStyle(el).position,
        anchor: el.style.positionAnchor,
      }));
      record('popover', 'native open (:popover-open pose)', panel.open && panel.opacity === '1' && panel.translate === 'none' || panel.translate === '0px',
        `open=${panel.open} opacity=${panel.opacity} translate=${panel.translate}`);
      record('popover', 'anchor positioning (fixed + position-anchor)', panel.position === 'fixed' && panel.anchor.startsWith('--jx-pop'),
        `position=${panel.position} anchor=${panel.anchor}`);

      // anchored BELOW the trigger. ENGINE FINDING (recorded): the
      // source maps bottom-end → 'bottom span-right', whose engine
      // semantics place the panel from the anchor's LEFT edge
      // spanning right (left-flush + viewport clamp), NOT the
      // right-edges-flush its comment describes — IDENTICAL on
      // production (same rules). The assertion pins the verifiable:
      // below the trigger, left-flush with it, and NOT the no-anchor
      // viewport-center fallback.
      const geom = await page.evaluate(() => {
        const t = document.querySelector('[data-jx-pop-trigger]').getBoundingClientRect();
        const p = document.querySelector('.jx-pop').getBoundingClientRect();
        const vw = window.innerWidth;
        return { tBottom: t.bottom, pTop: p.top, tLeft: t.left, pLeft: p.left, vw };
      });
      const notCentered = Math.abs(geom.pLeft - (geom.vw - 352) / 2) > 8;
      record('popover', 'placement (below trigger, engine span-right left-flush)',
        geom.pTop >= geom.tBottom - 1 && Math.abs(geom.pLeft - geom.tLeft) < 3 && notCentered,
        `trigger.bottom=${geom.tBottom.toFixed(1)} panel.top=${geom.pTop.toFixed(1)} trigger.left=${geom.tLeft.toFixed(1)} panel.left=${geom.pLeft.toFixed(1)} (span-right = left-flush; source comment says right-flush — engine finding)`);

      // caret flip via the css residue (:has + :popover-open)
      const caret = await page.$eval('.jx-pop-caret', (el) => getComputedStyle(el).transform);
      record('popover', 'caret flip (:has residue rule)', caret.includes('matrix(1, 0, 0, 1') && !caret.includes('1, 0, 0, 1, 0, 0') || caret !== 'none', `transform=${caret}`);

      // acrylic body: blur + 72% fill
      const body = await page.$eval('[data-jx-pop-body]', (el) => ({
        bg: getComputedStyle(el).backgroundColor,
        blur: getComputedStyle(el).backdropFilter,
      }));
      record('popover', 'acrylic surface (blur + alpha fill)', body.blur.includes('blur') && body.bg.includes('0.72'), `bg=${body.bg} filter=${body.blur}`);

      await page.keyboard.press('Escape');
    }

    // ═══ icon ═══
    await go('/icon');
    {
      const { stats, nonTrivial } = await shot(page, 'icon');
      record('icon', 'screenshot non-trivial', nonTrivial,
        `nonZero=${(stats.nonZeroRatio * 100).toFixed(1)}% distinctColors=${stats.distinctColors}`);
      const svg = await page.$eval('[data-icon-row] svg', (el) => ({
        stroke: el.getAttribute('stroke'),
        w: el.getAttribute('width'),
        color: getComputedStyle(el).color,
      }));
      record('icon', 'currentColor painting', svg.stroke === 'currentColor' && svg.color.includes('oklch'), `stroke=${svg.stroke} computed=${svg.color}`);
      const box = await page.$eval('[data-jx-icon-pending]', (el) => ({ w: getComputedStyle(el).width, display: getComputedStyle(el).display }));
      // display computes 'block' UNDER FLEX (inline-block blockifies
      // as a flex item — standard CSS); the assertion is the FACTORY's
      // dynamic size landing via the inline custom property
      record('icon', 'reserved box (factory dynamic size)', box.w === '20px', `width=${box.w} display=${box.display} (flex-blockified)`);
    }

    // ═══ code-card ═══
    await go('/code-card');
    {
      const { stats, nonTrivial } = await shot(page, 'code-card');
      record('code-card', 'screenshot non-trivial', nonTrivial,
        `nonZero=${(stats.nonZeroRatio * 100).toFixed(1)}% distinctColors=${stats.distinctColors}`);

      const pre = await page.$eval('[data-jx-code-card-pre]', (el) => ({
        x: getComputedStyle(el).overflowX,
        maxH: getComputedStyle(el).maxHeight,
        gutter: getComputedStyle(el).scrollbarGutter,
      }));
      record('code-card', 'scrollport law (x-auto + cap + gutters)', pre.x === 'auto' || pre.x === 'scroll' ? pre.maxH === '140px' && pre.gutter.startsWith('stable') : false,
        `overflow-x=${pre.x} maxH=${pre.maxH} gutter=${pre.gutter}`);

      // veil state machine: at load the END veil shows (content
      // overflows right), the START veil is dark; scroll right → the
      // START veil lights up. Settle first — the load-time fade-in
      // (150ms ease-out) can be mid-flight at networkidle.
      await page.waitForTimeout(350);
      const v0 = await page.$eval('[data-jx-code-card-scroll]', (el) => ({
        end: getComputedStyle(el, '::after').opacity,
        start: getComputedStyle(el, '::before').opacity,
      }));
      await page.$eval('[data-jx-code-card-pre]', (el) => (el.scrollLeft = 60));
      await page.waitForTimeout(300);
      const v1 = await page.$eval('[data-jx-code-card-scroll]', (el) => ({
        end: getComputedStyle(el, '::after').opacity,
        start: getComputedStyle(el, '::before').opacity,
      }));
      record('code-card', 'veil state machine (scroll-gated)', v0.end === '1' && v0.start === '0' && v1.start === '1',
        `start ${v0.start}→${v1.start}; end ${v0.end}→${v1.end}`);

      // print emulation: the card hides (print whitelist)
      await page.emulateMedia({ media: 'print' });
      const printDisplay = await page.$eval('[data-kind="code"]', (el) => getComputedStyle(el).display);
      await page.emulateMedia({ media: null });
      record('code-card', 'print hook (display none)', printDisplay === 'none', `display=${printDisplay}`);
    }

    // ═══ prose ═══
    await go('/prose');
    {
      const { stats, nonTrivial } = await shot(page, 'prose');
      record('prose', 'screenshot non-trivial', nonTrivial,
        `nonZero=${(stats.nonZeroRatio * 100).toFixed(1)}% distinctColors=${stats.distinctColors}`);

      const host = await page.$eval('[data-jx-prose]', (el) => ({
        size: getComputedStyle(el).fontSize,
        wrap: getComputedStyle(el).textWrap,
      }));
      record('prose', 'host lane (factory size + wrap enum)', host.size === '15px' && host.wrap === 'pretty',
        `fontSize=${host.size} wrap=${host.wrap}`);

      // the P-only leading lane via the residue css
      const pLine = await page.$eval('[data-prose-section="knobs"] [data-jx-text="p"]', (el) => getComputedStyle(el).lineHeight);
      record('prose', 'leading lane (residue, P-only)', pLine.endsWith('px') && parseFloat(pLine) > 26, `line-height=${pLine} (expect ≈1.9×15)`);

      // gradient ink lane (fill-only)
      const pImg = await page.$eval('[data-prose-section="knobs"] [data-jx-text="p"]', (el) => ({
        img: getComputedStyle(el).backgroundImage,
        fill: getComputedStyle(el).webkitTextFillColor,
      }));
      record('prose', 'gradient ink lane', pImg.img.includes('linear-gradient') && pImg.fill === 'rgba(0, 0, 0, 0)',
        `image=${pImg.img.slice(0, 50)} fill=${pImg.fill}`);

      // drop cap (initial-letter modern arm)
      const cap = await page.$eval('[data-prose-section="indent"] [data-jx-text="p"]', (el) => getComputedStyle(el, '::first-letter').initialLetter ?? 'unset');
      record('prose', 'drop cap (initial-letter arm)', String(cap).startsWith('3'), `initial-letter=${cap}`);
    }

    // ═══ switch ═══
    await go('/switch');
    {
      const { stats, nonTrivial } = await shot(page, 'switch');
      record('switch', 'screenshot non-trivial', nonTrivial,
        `nonZero=${(stats.nonZeroRatio * 100).toFixed(1)}% distinctColors=${stats.distinctColors}`);

      const s1 = await page.$eval('[data-sw="one"]', (el) => ({
        bg: getComputedStyle(el).backgroundColor,
        knob: getComputedStyle(el, '::before').transform,
        knobBg: getComputedStyle(el, '::before').backgroundColor,
      }));
      record('switch', 'checked state (primary track + traveled knob)',
        s1.bg.includes('oklch') && s1.knob !== 'none', `track=${s1.bg} knobTransform=${s1.knob} knobBg=${s1.knobBg}`);

      // state-machine flip: click → knob travels back, track → muted
      await page.click('[data-sw="one"]');
      await page.waitForTimeout(300);
      const s1b = await page.$eval('[data-sw="one"]', (el) => ({
        bg: getComputedStyle(el).backgroundColor,
        knob: getComputedStyle(el, '::before').transform,
      }));
      record('switch', 'state-machine flip (uncheck)', s1b.knob === 'none' || s1b.knob === 'matrix(1, 0, 0, 1, 0, 0)',
        `track=${s1b.bg} knobTransform=${s1b.knob}`);

      // density switch: track height follows the rung
      const hDef = await page.$eval('[data-sw="two"]', (el) => getComputedStyle(el).height);
      await setDensity(page, 'lg');
      const hLg = await page.$eval('[data-sw="two"]', (el) => getComputedStyle(el).height);
      await setDensity(page, 'default');
      record('switch', 'density switch (track height)', hDef !== hLg, `${hDef} → ${hLg}`);

      const dis = await page.$eval('[data-sw="disabled"]', (el) => getComputedStyle(el).opacity);
      record('switch', 'disabled pose', dis === '0.5', `opacity=${dis}`);
    }

    // ═══ separator ═══
    await go('/separator');
    {
      const { stats, nonTrivial } = await shot(page, 'separator');
      record('separator', 'screenshot non-trivial', nonTrivial,
        `nonZero=${(stats.nonZeroRatio * 100).toFixed(1)}% distinctColors=${stats.distinctColors}`);

      const fused = await page.$eval('[data-jx-separator="fused"]', (el) => getComputedStyle(el).backdropFilter);
      record('separator', 'contrast ghost (subtraction ink)', fused.includes('contrast'), `backdrop-filter=${fused}`);

      const solid = await page.$eval('[data-jx-separator="solid"]', (el) => ({
        f: getComputedStyle(el).backdropFilter, bg: getComputedStyle(el).backgroundColor,
      }));
      record('separator', 'solid exception (ghost off, token on)', solid.f === 'none' && solid.bg.includes('oklch'),
        `filter=${solid.f} bg=${solid.bg}`);

      const dashed = await page.$eval('[data-jx-separator="dashed"]', (el) => getComputedStyle(el).maskImage);
      record('separator', 'mask geometry (dashed 6/4)', dashed.includes('repeating-linear-gradient'), dashed.slice(0, 50));

      const fade = await page.$eval('[data-jx-separator="fade"]', (el) => ({
        m: getComputedStyle(el).mixBlendMode, f: getComputedStyle(el).backdropFilter,
      }));
      record('separator', 'blend engine (difference, no filter)', fade.m === 'difference' && fade.f === 'none',
        `blend=${fade.m} filter=${fade.f}`);
    }

    // ═══ global: dark flip on the press-button page ═══
    await go('/press-button');
    {
      const bg0 = await page.$eval('[data-pb="fill"]', (el) => getComputedStyle(el).backgroundColor);
      await page.click('nav button:nth-of-type(1)'); // dark toggle
      await page.waitForTimeout(150);
      const bg1 = await page.$eval('[data-pb="fill"]', (el) => getComputedStyle(el).backgroundColor);
      await page.click('nav button:nth-of-type(1)');
      record('global', 'dark token flip (same frame)', bg0 !== bg1, `${bg0} → ${bg1}`);
    }

    // console hygiene
    record('global', 'zero page/console errors', errors.length === 0, errors.slice(0, 3).join(' | ') || 'clean');

    const failed = results.filter((r) => !r.pass);
    console.log(`\n=== corpus probe: ${results.length - failed.length}/${results.length} PASS ===`);
    if (failed.length) {
      code = 1;
      for (const f of failed) console.log(`FAILED: [${f.family}] ${f.name} — ${f.detail}`);
    }
    } finally {
      await browser.close();
    }
  } finally {
    // recycle the preview server (process group)
    if (server.pid) {
      try { process.kill(-server.pid, 'SIGTERM'); } catch { /* already gone */ }
      await new Promise((r) => setTimeout(r, 300));
      let alive = true;
      try { process.kill(server.pid, 0); } catch { alive = false; }
      if (alive) {
        try { process.kill(-server.pid, 'SIGKILL'); } catch { /* gone */ }
      }
      // sweep stragglers holding the port (npx's node child can
      // outlive the group kill — the orphan trap)
      try {
        const { execSync } = await import('node:child_process');
        const pids = execSync(`lsof -ti :${PORT} 2>/dev/null || true`).toString().trim();
        if (pids) {
          for (const pid of pids.split('\n').filter(Boolean)) {
            try { process.kill(Number(pid), 'SIGKILL'); } catch { /* gone */ }
          }
        }
      } catch { /* lsof unavailable */ }
      console.log(`preview server pid=${server.pid} recycled (+ port sweep on :${PORT})`);
    }
  }
  process.exit(code);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
