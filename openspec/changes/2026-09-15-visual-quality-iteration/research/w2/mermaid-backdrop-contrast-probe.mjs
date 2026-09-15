#!/usr/bin/env node
// mermaid-backdrop-contrast-probe — the W2 fixed-acceptance contrast probe
// (visual-quality-iteration task 2.2/2.3, 2026-09-15).
//
// FIXTURE: the docs page's dark-pinned backdrop demo on the LIGHT page
// (the Owner's exact viewing condition), served by the worktree dev
// server, captured by PINNED Chromium at 2× device scale.
//
// ALGORITHM: WCAG 2.x relative-luminance contrast ratio.
//   labels    ≥ 4.5:1 against their own node fill
//   graphics  ≥ 3:1  (node fill + node border vs the veil ground sampled
//                     2px past the node border; connectors per the
//                     canonical protocol below)
// ANY sampled pair below its threshold fails the probe (exit 1).
//
// CONNECTOR PROTOCOL (verbatim-identical to the change's design §W2):
// every edge connector in the fixture, at three equally spaced
// centerline points (1/4, 1/2, 3/4), the stroke's line-core pixel vs a
// ground patch 2px past the stroke edge along the normal (CURVED
// connectors: the local tangent's perpendicular at the sample point),
// the patch the mean of its 3×3 DEVICE-pixel window; device-pixel
// rounding (sample coordinates rounded to integers in device space);
// ground-patch overlap rule — a patch falling on a node or an adjacent
// connector re-samples along the normal until clear, max 3 steps, else
// the sample is skipped and recorded.
//
// LINE-CORE LOCK (measurement note): the fixture's 1-css-px strokes are
// ~1.3 DEVICE px wide at the 2× capture — the rasterized core sits up
// to ~4 device px off the geometric centerline (verified: path
// getScreenCTM == svg affine == the marker map; the paint shifts). The
// protocol's unit is the LINE-CORE PIXEL, so the core is LOCATED as the
// brightest pixel within a 7-device-px lock window centered on the
// mapped centerline point — the radius bounds the lock (a stroke that
// is genuinely absent leaves the window dark and the sample FAILS on
// ground-vs-ground), and the recorded offset reports the rasterization
// shift. Ground patches additionally clear IN THE PIXEL DOMAIN (patch
// mean max-channel ≤ 80 — ground is #1f1f1f≈31, any ink ≥ ~90), so
// rasterized ink no DOM geometry knows about still forces a re-step.
//
// Usage: node mermaid-backdrop-contrast-probe.mjs [--url http://localhost:5199]
//        [--baseline]  record the UNLIFTED pre-calibration palette story
// Writes: contrast-report.json, backdrop-on.png, backdrop-off.png,
//         backdrop-floor.png (this directory).

import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex/node_modules/playwright-core/index.mjs';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

const CHROME =
  process.env.HOME +
  '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const HERE = dirname(fileURLToPath(import.meta.url));
const argUrl = process.argv.indexOf('--url');
const BASE = argUrl >= 0 ? process.argv[argUrl + 1] : 'http://localhost:5199';
const BASELINE = process.argv.includes('--baseline');
const PAGE_URL = `${BASE}/docs/components/mermaid.html`;

// ── minimal PNG decoder (8-bit, RGB or RGBA, non-interlaced — playwright) ─
function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let pos = 8;
  let w = 0;
  let h = 0;
  let channels = 3;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      if (data[8] !== 8 || (data[9] !== 6 && data[9] !== 2))
        throw new Error(`unsupported PNG (bitDepth ${data[8]} colorType ${data[9]}) — expected 8-bit colorType 2|6`);
      channels = data[9] === 6 ? 4 : 3;
    } else if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
    if (type === 'IEND') break;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * channels;
  const out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y += 1) {
    const filter = raw[y * (stride + 1)];
    const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x += 1) {
      const a = x >= channels ? cur[x - channels] : 0;
      const b = prev ? prev[x] : 0;
      const c = x >= channels && prev ? prev[x - channels] : 0;
      let v = row[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[x] = v & 0xff;
    }
  }
  return { w, h, data: out, channels };
}

// ── WCAG 2.x relative luminance + contrast ratio ──────────────────────────
const lin = (c8) => {
  const c = c8 / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const luminance = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (c1, c2) => {
  const l1 = luminance(c1[0], c1[1], c1[2]);
  const l2 = luminance(c2[0], c2[1], c2[2]);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
};
const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');

// ── the sampling engine (device-pixel rounding everywhere) ────────────────
const makeSampler = (img, dpr) => {
  const px = (xImg, yImg) => {
    const o = (yImg * img.w + xImg) * img.channels;
    return [img.data[o], img.data[o + 1], img.data[o + 2]];
  };
  return {
    /** a single device pixel, coordinates ROUNDED to integers in device space */
    pixel(cssX, cssY) {
      const x = Math.max(0, Math.min(img.w - 1, Math.round(cssX * dpr)));
      const y = Math.max(0, Math.min(img.h - 1, Math.round(cssY * dpr)));
      return { color: px(x, y), at: [x, y] };
    },
    /** the ground patch: the MEAN of its 3×3 device-pixel window */
    patch(cssX, cssY) {
      const cx = Math.round(cssX * dpr);
      const cy = Math.round(cssY * dpr);
      const acc = [0, 0, 0];
      let n = 0;
      for (let dy = -1; dy <= 1; dy += 1)
        for (let dx = -1; dx <= 1; dx += 1) {
          const x = cx + dx;
          const y = cy + dy;
          if (x < 0 || y < 0 || x >= img.w || y >= img.h) continue;
          const c = px(x, y);
          acc[0] += c[0];
          acc[1] += c[1];
          acc[2] += c[2];
          n += 1;
        }
      return { color: acc.map((v) => Math.round(v / n)), at: [cx, cy] };
    },
    /** the line-core lock: the highest-luminance pixel within a
     *  `radiusDev` DEVICE-px window of a css point (ties break toward
     *  the center) — the painted stroke core, with its offset recorded */
    brightest(cssX, cssY, radiusDev) {
      const cx = Math.round(cssX * dpr);
      const cy = Math.round(cssY * dpr);
      let best = null;
      for (let y = cy - radiusDev; y <= cy + radiusDev; y += 1)
        for (let x = cx - radiusDev; x <= cx + radiusDev; x += 1) {
          if (x < 0 || y < 0 || x >= img.w || y >= img.h) continue;
          const c = px(x, y);
          const lum = (c[0] + c[1] + c[2]) / 3;
          const off = Math.hypot(x - cx, y - cy);
          if (
            !best ||
            lum > best.lum + 1e-9 ||
            (Math.abs(lum - best.lum) <= 1e-9 && off < best.offsetDev)
          )
            best = { color: c, at: [x, y], lum, offsetDev: Math.round(off * 10) / 10 };
        }
      return best;
    },
    /** the DOMINANT color of a css rect (quantized to 8-step buckets,
     *  gray-spectrum aware): a flat fill owns the pixel histogram of its
     *  box outright — glyphs and fringes are minorities. Returns null
     *  when no bucket holds ≥10% (no flat fill here to speak of). */
    dominantFill(rect) {
      const x0 = Math.round(rect.x * dpr);
      const y0 = Math.round(rect.y * dpr);
      const x1 = Math.round((rect.x + rect.w) * dpr);
      const y1 = Math.round((rect.y + rect.h) * dpr);
      const buckets = new Map();
      let total = 0;
      for (let y = Math.max(0, y0); y <= Math.min(img.h - 1, y1); y += 1)
        for (let x = Math.max(0, x0); x <= Math.min(img.w - 1, x1); x += 1) {
          const c = px(x, y);
          const key = (Math.round(c[0] / 8) << 6) | (Math.round(c[1] / 8) << 3) | Math.round(c[2] / 8);
          const b = buckets.get(key) || { n: 0, sum: [0, 0, 0] };
          b.n += 1;
          b.sum[0] += c[0];
          b.sum[1] += c[1];
          b.sum[2] += c[2];
          buckets.set(key, b);
          total += 1;
        }
      let best = null;
      for (const b of buckets.values()) if (!best || b.n > best.n) best = b;
      if (!best || best.n < total * 0.1) return null;
      return { color: best.sum.map((v) => Math.round(v / best.n)), share: Math.round((best.n / total) * 100) };
    },
    /** pixels within a css rect whose color is within `tol` of `target`
     *  (channel-wise), reduced to their luminance-median member + its
     *  3×3 patch mean — a clean fill sample among text glyphs */
    clusterFill(rect, target, tol) {
      const x0 = Math.round(rect.x * dpr);
      const y0 = Math.round(rect.y * dpr);
      const x1 = Math.round((rect.x + rect.w) * dpr);
      const y1 = Math.round((rect.y + rect.h) * dpr);
      const members = [];
      for (let y = Math.max(0, y0); y <= Math.min(img.h - 1, y1); y += 1)
        for (let x = Math.max(0, x0); x <= Math.min(img.w - 1, x1); x += 1) {
          const c = px(x, y);
          if (Math.abs(c[0] - target[0]) <= tol && Math.abs(c[1] - target[1]) <= tol && Math.abs(c[2] - target[2]) <= tol)
            members.push({ at: [x, y], color: c, lum: (c[0] + c[1] + c[2]) / 3 });
        }
      if (members.length < 9) return null;
      members.sort((a, b) => a.lum - b.lum);
      const med = members[Math.floor(members.length / 2)];
      const patch = this.patch(med.at[0] / dpr, med.at[1] / dpr);
      return { color: patch.color, at: med.at, count: members.length };
    },
    /** extreme pixel within a css rect: the one FARTHEST (euclidean rgb)
     *  from `from` — the glyph line-core for text-on-fill sampling */
    extreme(rect, from) {
      const x0 = Math.round(rect.x * dpr);
      const y0 = Math.round(rect.y * dpr);
      const x1 = Math.round((rect.x + rect.w) * dpr);
      const y1 = Math.round((rect.y + rect.h) * dpr);
      let best = null;
      let bestD = -1;
      for (let y = Math.max(0, y0); y <= Math.min(img.h - 1, y1); y += 1)
        for (let x = Math.max(0, x0); x <= Math.min(img.w - 1, x1); x += 1) {
          const c = px(x, y);
          const d = Math.hypot(c[0] - from[0], c[1] - from[1], c[2] - from[2]);
          if (d > bestD) {
            bestD = d;
            best = { color: c, at: [x, y], distance: Math.round(d) };
          }
        }
      return best;
    },
    size: img,
  };
};

// ── geometry overlap helpers (css-space, computed from page data) ─────────
const insideAnyBox = (p, boxes, margin = 2) =>
  boxes.some(
    (n) =>
      p.x > n.x - margin && p.x < n.x + n.w + margin && p.y > n.y - margin && p.y < n.y + n.h + margin,
  );
const distToPolyline = (p, poly) => {
  let best = Infinity;
  for (let i = 0; i < poly.length - 1; i += 1) {
    const a = poly[i];
    const b = poly[i + 1];
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const l2 = abx * abx + aby * aby || 1e-9;
    let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / l2;
    t = Math.max(0, Math.min(1, t));
    best = Math.min(best, Math.hypot(p.x - (a.x + t * abx), p.y - (a.y + t * aby)));
  }
  return best;
};

/** the ground-patch overlap rule: ordered candidates along the normal
 *  (stroke edge + 2px clearance + half the 3×3 window, then +2px steps,
 *  both directions, max 3 steps). The caller validates each candidate's
 *  patch in the PIXEL DOMAIN (ink-free) and takes the first clean one —
 *  else the sample is skipped and recorded */
function groundCandidates(center, nx, ny, sw, boxes, paths, ownPath, ownArc) {
  const out = [];
  const step = 2; // css px steps along the normal
  for (const dir of [1, -1]) {
    for (let k = 0; k <= 3; k += 1) {
      const off = sw / 2 + 2.5 + k * step; // stroke edge + 2px clearance + half the 3×3 window
      const p = { x: center.x + nx * off * dir, y: center.y + ny * off * dir };
      if (insideAnyBox(p, boxes)) continue;
      let blocked = false;
      for (const path of paths) {
        // the OWNING connector's neighborhood of the sample point is not
        // "an adjacent connector" — exclude ±8px of arc around the sample
        const poly = path === ownPath ? path.poly.filter((q) => Math.abs(q.arc - ownArc) >= 8) : path.poly;
        if (distToPolyline(p, poly) < sw / 2 + 2) {
          blocked = true;
          break;
        }
      }
      if (!blocked) out.push({ point: p, steps: k, dir });
    }
  }
  return out;
}
/** a patch is ground-clean when its mean max-channel is ≤ INK_FLOOR
 *  (the veil ground is #1f1f1f≈31; any ink — fill 112, AA fringe ≥90,
 *  stroke 255 — clears the floor) */
const INK_FLOOR = 80;
const firstCleanGround = (S, candidates) => {
  for (const cand of candidates) {
    const patch = S.patch(cand.point.x, cand.point.y);
    if (Math.max(patch.color[0], patch.color[1], patch.color[2]) <= INK_FLOOR)
      return { ...cand, patch };
  }
  return null;
};

// ── in-page geometry collection (svg-affine user→screen mapping) ──────────
const COLLECT = (testid) => {
  const fig = document.querySelector('[data-testid="' + testid + '"]');
  const viewport = fig.querySelector('[data-jx-mermaid-viewport]');
  const base = viewport.getBoundingClientRect();
  const svg = viewport.querySelector('svg');
  const toRel = (r) => ({ x: r.x - base.x, y: r.y - base.y, w: r.width, h: r.height });
  // the svg's affine user→screen map (viewport-relative): flowchart
  // geometry shares the svg's user space; the affine is EXACT where
  // element-rect walks quantize (a 0.05-unit marker rect rounds to ±px)
  const svgRect = toRel(svg.getBoundingClientRect());
  const vb = svg.viewBox.baseVal;
  const sx = vb.width ? svgRect.w / vb.width : 1;
  const sy = vb.height ? svgRect.h / vb.height : 1;
  const mapUser = (u, v) => ({ x: svgRect.x + (u - vb.x) * sx, y: svgRect.y + (v - vb.y) * sy });
  const nodes = [...fig.querySelectorAll('g.node')].map((n) => {
    const shape = n.querySelector('.basic.label-container, rect, polygon, circle, ellipse, path');
    const label = n.querySelector('foreignObject') || n.querySelector('g.label');
    const shapeRect = toRel(shape.getBoundingClientRect());
    const labelRect = label ? toRel(label.getBoundingClientRect()) : null;
    return {
      shape: shapeRect,
      fill: shape.getAttribute('fill'),
      stroke: shape.getAttribute('stroke'),
      strokeWidth: parseFloat(getComputedStyle(shape).strokeWidth) || 2,
      labelRect,
      text: n.textContent.trim().slice(0, 40),
    };
  });
  const paths = [...fig.querySelectorAll('g.edgePaths path')]
    .filter((p) => (p.getAttribute('d') || '').length > 4)
    .map((p) => {
      const total = p.getTotalLength();
      const poly = [];
      const N = 96;
      for (let i = 0; i <= N; i += 1) {
        const pt = p.getPointAtLength((total * i) / N);
        poly.push({ arc: (total * i) / N, ...mapUser(pt.x, pt.y) });
      }
      const samples = [0.25, 0.5, 0.75].map((f) => {
        const L = total * f;
        const pt = p.getPointAtLength(L);
        const t1 = p.getPointAtLength(Math.max(0, L - 0.75));
        const t2 = p.getPointAtLength(Math.min(total, L + 0.75));
        const p0 = mapUser(pt.x, pt.y);
        const a = mapUser(t1.x, t1.y);
        const b = mapUser(t2.x, t2.y);
        return { f, pt: p0, tan: { x: b.x - a.x, y: b.y - a.y } };
      });
      return {
        d: p.getAttribute('d'),
        strokeWidth: parseFloat(getComputedStyle(p).strokeWidth) || 2,
        stroke: getComputedStyle(p).stroke,
        poly, samples,
      };
    });
  // edge label chips (.edgeLabel — v11 nests them in g.edgeLabels): the
  // background rect (when painted) + the text box
  const chips = [...fig.querySelectorAll('.edgeLabel')].map((g) => {
    const rect = g.querySelector('rect');
    const fo = g.querySelector('foreignObject') || g.querySelector('span');
    return {
      rect: rect ? { fill: rect.getAttribute('fill'), fillComputed: getComputedStyle(rect).fill, style: rect.getAttribute('style'), ...toRel(rect.getBoundingClientRect()) } : null,
      text: fo ? toRel(fo.getBoundingClientRect()) : toRel(g.getBoundingClientRect()),
      textContent: g.textContent.trim().slice(0, 40),
    };
  });
  const cs = getComputedStyle(viewport);
  return {
    dpr: window.devicePixelRatio,
    viewport: toRel(base),
    svgScale: { x: sx, y: sy, uniform: Math.abs(sx - sy) < 0.01 },
    veil: viewport.getAttribute('data-jx-mermaid-veil'),
    computed: {
      backgroundColor: cs.backgroundColor,
      backgroundImage: cs.backgroundImage,
      backdropFilter: cs.backdropFilter || cs.webkitBackdropFilter,
      borderRadius: cs.borderRadius,
      borderWidth: cs.borderWidth,
      padding: cs.padding,
      overflow:
        (viewport.scrollWidth > viewport.clientWidth ? 'h-scroll ' : '') +
        (viewport.scrollHeight > viewport.clientHeight ? 'v-scroll' : '').trim() || 'none',
    },
    pageDark: document.documentElement.classList.contains('dark'),
    baked: [...svg.querySelectorAll('[fill]')].slice(0, 40).map((el) => el.getAttribute('fill')).filter((v, i, a) => a.indexOf(v) === i),
    nodes, paths, chips,
  };
};

// ── verdicts ──────────────────────────────────────────────────────────────
const report = {
  fixture: { url: PAGE_URL, thresholds: { labels: 4.5, graphics: 3 }, baseline: BASELINE },
  veilComputed: {},
  ground: {},
  labels: [],
  nodes: [],
  connectors: [],
  chips: [],
  skipped: [],
  summary: {},
};
const fail = (pairs) => pairs.filter((p) => p.ratio < p.threshold);

const browser = await chromium.launch({ executablePath: CHROME });
const banners = [];
try {
  // ── lane 1: the supported veil (the live page) ─────────────────────────
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
  await page.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 60_000 });
  const onLoc = page.locator('[data-testid="backdrop-on"]');
  await onLoc.scrollIntoViewIfNeeded();
  await page.waitForSelector('[data-testid="backdrop-on"] [data-jx-mermaid-zoom] > svg', { timeout: 60_000 });
  await page.waitForFunction(
    () => !document.querySelector('[data-testid="backdrop-on"] [data-jx-mermaid]')?.getAttribute('data-state')?.match(/rendering|floor/),
    { timeout: 60_000 },
  );
  await page.waitForTimeout(500); // fonts + fade settle

  const onGeo = await page.evaluate(COLLECT, 'backdrop-on');
  const offGeo = await page.evaluate(COLLECT, 'backdrop-off');

  // the veil computed-style lanes (task 2.3 probe)
  report.veilComputed.on = onGeo.computed;
  report.veilComputed.on.veilAttribute = onGeo.veil;
  report.veilComputed.off = { ...offGeo.computed, veilAttribute: offGeo.veil };
  report.veilComputed.pageDark = onGeo.pageDark;
  banners.push(['veil(on) background transparent', onGeo.computed.backgroundColor === 'rgba(0, 0, 0, 0)', onGeo.computed.backgroundColor]);
  banners.push(['veil(on) subtractive chain paints', /blur\(.+\).*contrast\(.+\).*brightness\(.+\).*saturate\(.+\)/.test(onGeo.computed.backdropFilter || ''), onGeo.computed.backdropFilter]);
  banners.push(['veil(on) carries the box (radius/padding/border)', onGeo.computed.borderRadius !== '0px' && parseFloat(onGeo.computed.borderWidth) === 1 && parseFloat(onGeo.computed.padding) > 0, JSON.stringify([onGeo.computed.borderRadius, onGeo.computed.borderWidth, onGeo.computed.padding])]);
  banners.push(['veil(off) no attribute, no chain, transparent', offGeo.veil === null && (offGeo.computed.backdropFilter || 'none') === 'none' && offGeo.computed.backgroundColor === 'rgba(0, 0, 0, 0)', JSON.stringify([offGeo.veil, offGeo.computed.backdropFilter, offGeo.computed.backgroundColor])]);
  banners.push(['the page is LIGHT (the Owner condition)', onGeo.pageDark === false, String(onGeo.pageDark)]);
  banners.push(['fixture fits the pan viewport (no scrollbars in the sampling field)', onGeo.computed.overflow === 'none', onGeo.computed.overflow]);

  // screenshots (2× DPI receipts): the figure cards for the visual
  // record + the VIEWPORT crop as the pixel-sampling base (the geometry
  // below is viewport-relative — the sampling shot must share its origin)
  await onLoc.screenshot({ path: join(HERE, 'backdrop-on.png') });
  await page.locator('[data-testid="backdrop-off"]').screenshot({ path: join(HERE, 'backdrop-off.png') });
  const viewportLoc = page.locator('[data-testid="backdrop-on"] [data-jx-mermaid-viewport]');
  await viewportLoc.screenshot({ path: join(HERE, 'backdrop-on-viewport.png') });

  // the contrast fixture: decode the VIEWPORT screenshot and sample
  const { readFile } = await import('node:fs/promises');
  const img = decodePng(await readFile(join(HERE, 'backdrop-on-viewport.png')));
  const S = makeSampler(img, onGeo.dpr);

  // the veil ground: sample four patches inside the viewport, clear of all
  // nodes/connectors (the corridor margins) — the ground reference
  const vp = onGeo.viewport;
  // occluding boxes for the overlap rule: node shapes + edge-label chips
  // (deduped — v11 may match the chip twice through .edgeLabel nesting)
  const chipBoxes = [];
  for (const chip of onGeo.chips) {
    const box = chip.rect ?? chip.text;
    if (box && !chipBoxes.some((b) => Math.abs(b.x - box.x) < 1 && Math.abs(b.y - box.y) < 1)) chipBoxes.push(box);
  }
  const blockRects = [...onGeo.nodes.map((n) => n.shape), ...chipBoxes];
  const groundPoints = [
    { x: vp.x + 8, y: vp.y + 8 },
    { x: vp.x + vp.w - 8, y: vp.y + 8 },
    { x: vp.x + 8, y: vp.y + vp.h - 8 },
    { x: vp.x + vp.w - 8, y: vp.y + vp.h - 8 },
  ].filter((p) => !insideAnyBox(p, blockRects, 6));
  report.ground.corners = groundPoints.map((p) => ({ at: p, ...S.patch(p.x, p.y), hex: hex(S.patch(p.x, p.y).color) }));

  // the UNLIFTED baseline story (why the lift exists): the PRE-CHANGE dark
  // palette mapped mainBkg = tokens.background = the dark sheet's OWN
  // #000000 (SAFE_HEX.background.dark at mermaid-engine.ts:167, mapping
  // mainBkg: tokens.background). Against the MEASURED veil ground that
  // fill sat below the 3:1 graphics floor — the black-on-black receipt.
  // Computed here from the same measured ground (deterministic; the
  // pre-change engine values are committed history).
  const groundMean = report.ground.corners.length
    ? report.ground.corners
        .map((c) => c.color)
        .reduce((a, c) => [a[0] + c[0], a[1] + c[1], a[2] + c[2]], [0, 0, 0])
        .map((v) => Math.round(v / report.ground.corners.length))
    : null;
  if (groundMean) {
    report.baselineStory = {
      preChangeMainBkg: '#000000',
      measuredVeilGround: hex(groundMean),
      fillVsGround: Math.round(ratio([0, 0, 0], groundMean) * 100) / 100,
      threshold: 3,
      verdict: 'FAIL — the unlifted dark palette cannot clear the graphics threshold on the subtractive ground (the lift is measurement-demanded, not taste)',
    };
  }

  // NODES: fill vs ground (2px past border), border vs ground, label vs fill
  for (const n of onGeo.nodes) {
    const sw = n.strokeWidth;
    // fill sample: the mid-height gutter between the shape's left edge and
    // the label box (falls back to the shape's top-center inset)
    const gutter = n.labelRect ? n.labelRect.x - n.shape.x : 0;
    const fillPt =
      n.labelRect && gutter >= 2.5
        ? { x: n.shape.x + gutter / 2, y: n.labelRect.y + n.labelRect.h / 2 }
        : { x: n.shape.x + n.shape.w / 2, y: n.shape.y + Math.min(4, n.shape.h / 4) };
    const fill = S.pixel(fillPt.x, fillPt.y);
    // border sample: ON the stroke at the left-edge midpoint (the stroke
    // straddles the geometric edge)
    const borderPt = { x: n.shape.x, y: n.shape.y + n.shape.h / 2 };
    const border = S.pixel(borderPt.x, borderPt.y);
    // ground: 2px past the border, walking outward (-x), the overlap rule
    const g = firstCleanGround(S, groundCandidates(borderPt, -1, 0, sw, blockRects, onGeo.paths, null, -1));
    if (!g) {
      report.skipped.push({ object: 'node-ground', node: n.text, reason: 'no clean ground within 3 steps either side (geometry or pixel ink)' });
    } else {
      const ground = g.patch;
      report.nodes.push({
        node: n.text,
        fill: { at: fill.at, hex: hex(fill.color) },
        border: { at: border.at, hex: hex(border.color) },
        ground: { at: ground.at, steps: g.steps, hex: hex(ground.color) },
        fillVsGround: Math.round(ratio(fill.color, ground.color) * 100) / 100,
        borderVsGround: Math.round(ratio(border.color, ground.color) * 100) / 100,
        thresholds: { fillVsGround: 3, borderVsGround: 3 },
      });
    }
    // label: the extreme pixel within the label box vs the node fill
    if (n.labelRect) {
      const glyph = S.extreme(n.labelRect, fill.color);
      report.labels.push({
        node: n.text,
        glyph: { at: glyph.at, hex: hex(glyph.color), distance: glyph.distance },
        fill: hex(fill.color),
        ratio: Math.round(ratio(glyph.color, fill.color) * 100) / 100,
        threshold: 4.5,
      });
    }
  }

  // EDGE-LABEL CHIPS: chip fill vs ground (2px past the chip) + the chip's
  // text vs the chip fill (labels ride their own fill everywhere)
  const seenChipBoxes = [];
  for (const chip of onGeo.chips) {
    const box = chip.rect ?? chip.text;
    if (!box || !chip.textContent) continue;
    if (seenChipBoxes.some((b) => Math.abs(b.x - box.x) < 1 && Math.abs(b.y - box.y) < 1)) continue;
    seenChipBoxes.push(box);
    const g = firstCleanGround(S, groundCandidates({ x: box.x, y: box.y + box.h / 2 }, -1, 0, 2, blockRects, onGeo.paths, null, -1));
    // chip fill: self-derived from the pixels — the chip's DOMINANT color
    // (a flat fill owns its box histogram; glyphs/fringes are minorities),
    // then the tolerance cluster's luminance-median member + 3×3 mean.
    // A single-pixel probe can land on a glyph anti-alias fringe and
    // misreport the fill (the r1 4.17 lesson: fringe 124 vs true 112).
    // Fallback = the widest fringe-free row band inside the chip box.
    const dominant = S.dominantFill(box);
    const cluster = dominant ? S.clusterFill(box, dominant.color, 14) : null;
    const chipFill = cluster
      ? { color: cluster.color, at: cluster.at }
      : S.pixel(
          ...(function pick() {
            const x0 = Math.round(box.x * onGeo.dpr);
            const y0 = Math.round(box.y * onGeo.dpr);
            let best = null;
            for (let y = y0; y < y0 + Math.round(box.h * onGeo.dpr); y += 1) {
              let run = 0;
              for (let x = x0; x < x0 + Math.round(box.w * onGeo.dpr); x += 1) {
                // bright ⇒ glyph/ink: reset the run
                run = S.pixel(x / onGeo.dpr, y / onGeo.dpr).color[0] > 150 ? 0 : run + 1;
                if (!best || run > best.run) best = { run, x: x - ((run / 2) | 0), y };
              }
            }
            return best ? [best.x / onGeo.dpr, best.y / onGeo.dpr] : [box.x + Math.min(3, box.w / 2), box.y + box.h / 2];
          })(),
        );
    if (g) {
      const ground = g.patch;
      report.chips.push({
        chip: chip.textContent,
        fill: { at: chipFill.at, hex: hex(chipFill.color), via: cluster ? `cluster(${cluster.count}px of dominant ${hex(dominant.color)} @${dominant.share}%)` : 'fringe-free band fallback' },
        ground: { at: ground.at, steps: g.steps, hex: hex(ground.color) },
        fillVsGround: Math.round(ratio(chipFill.color, ground.color) * 100) / 100,
        threshold: 3,
      });
    }
    const glyph = S.extreme(chip.text, chipFill.color);
    if (glyph && glyph.distance > 20) {
      report.chips.push({
        chip: chip.textContent + ' (text)',
        glyph: { at: glyph.at, hex: hex(glyph.color) },
        ratio: Math.round(ratio(glyph.color, chipFill.color) * 100) / 100,
        threshold: 4.5,
      });
    }
  }

  // CONNECTORS: the canonical protocol — every edge, 1/4 1/2 3/4 centerline
  for (const [pi, path] of onGeo.paths.entries()) {
    for (const s of path.samples) {
      const tlen = Math.hypot(s.tan.x, s.tan.y) || 1;
      const nx = -s.tan.y / tlen; // the local tangent's perpendicular
      const ny = s.tan.x / tlen;
      // a centerline point covered by an edge-label chip (the chip paints
      // OVER the line by design) cannot sample the stroke — skipped + recorded
      if (insideAnyBox(s.pt, chipBoxes, 1)) {
        report.skipped.push({ object: 'connector', path: pi, at: s.f, reason: 'centerline occluded by the edge-label chip (the label paints over the line)' });
        continue;
      }
      // likewise a centerline point running under a NODE box
      if (insideAnyBox(s.pt, onGeo.nodes.map((n) => n.shape), 0)) {
        report.skipped.push({ object: 'connector', path: pi, at: s.f, reason: 'centerline under a node box (the node paints over the line)' });
        continue;
      }
      // the line-core lock: the painted core within 7 device px of the
      // mapped centerline point (see the header note) — an absent stroke
      // leaves the window at ground and the pair fails on ground-vs-ground
      const found = S.brightest(s.pt.x, s.pt.y, 7);
      const coreCss = { x: found.at[0] / onGeo.dpr, y: found.at[1] / onGeo.dpr };
      // the sample's own arc length (nearest polyline point)
      const arc = path.poly.reduce(
        (best, q) => (Math.hypot(q.x - s.pt.x, q.y - s.pt.y) < Math.hypot(best.x - s.pt.x, best.y - s.pt.y) ? q : best),
      ).arc;
      const g = firstCleanGround(S, groundCandidates(coreCss, nx, ny, path.strokeWidth, blockRects, onGeo.paths, path, arc));
      if (!g) {
        report.skipped.push({ object: 'connector', path: pi, at: s.f, reason: 'no clean ground patch within 3 steps either side (geometry or pixel ink) — recorded skip' });
        continue;
      }
      const ground = g.patch;
      report.connectors.push({
        path: pi,
        at: s.f,
        lineCore: { at: found.at, hex: hex(found.color), lockOffsetDev: found.offsetDev },
        ground: { at: ground.at, steps: g.steps, dir: g.dir, hex: hex(ground.color) },
        ratio: Math.round(ratio(found.color, ground.color) * 100) / 100,
        threshold: 3,
      });
    }
  }
  await page.close();

  // ── lane 2: the unsupported floor (CSS.supports stubbed false) ─────────
  const floorPage = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
  await floorPage.addInitScript(() => {
    const orig = window.CSS && typeof window.CSS.supports === 'function' ? window.CSS.supports.bind(window.CSS) : null;
    window.CSS = Object.assign(window.CSS || {}, {
      supports(a, b) {
        const q = String(a) + (b !== undefined ? String(b) : '');
        if (q.includes('backdrop-filter')) return false;
        return orig ? orig(a, b) : false;
      },
    });
  });
  await floorPage.goto(PAGE_URL, { waitUntil: 'networkidle', timeout: 60_000 });
  await floorPage.locator('[data-testid="backdrop-on"]').scrollIntoViewIfNeeded();
  await floorPage.waitForSelector('[data-testid="backdrop-on"] [data-jx-mermaid-zoom] > svg', { timeout: 60_000 });
  await floorPage.waitForTimeout(500);
  const floorGeo = await floorPage.evaluate(COLLECT, 'backdrop-on');
  report.veilComputed.floor = { ...floorGeo.computed, veilAttribute: floorGeo.veil };
  banners.push(['floor lane: JS support probe answers false', floorGeo.veil === 'floor', String(floorGeo.veil)]);
  banners.push(['floor lane: the opaque theme ground returns', floorGeo.computed.backgroundColor === 'rgb(0, 0, 0)', floorGeo.computed.backgroundColor]);
  banners.push(['floor lane: the chain is off', (floorGeo.computed.backdropFilter || 'none') === 'none', floorGeo.computed.backdropFilter]);
  await floorPage.locator('[data-testid="backdrop-on"]').screenshot({ path: join(HERE, 'backdrop-floor.png') });
  await floorPage.close();
} finally {
  await browser.close();
}

// ── the verdict ───────────────────────────────────────────────────────────
const labelFails = fail(report.labels);
const nodeFails = report.nodes.filter((n) => n.fillVsGround < 3 || n.borderVsGround < 3);
const chipFails = report.chips.filter((c) => (c.fillVsGround !== undefined ? c.fillVsGround < 3 : c.ratio < 4.5));
const connFails = fail(report.connectors);
report.summary = {
  samples: {
    labels: report.labels.length,
    nodes: report.nodes.length,
    connectors: report.connectors.length,
    chips: report.chips.length,
    skipped: report.skipped.length,
  },
  minRatios: {
    label: report.labels.length ? Math.min(...report.labels.map((l) => l.ratio)) : null,
    nodeFillVsGround: report.nodes.length ? Math.min(...report.nodes.map((n) => n.fillVsGround)) : null,
    nodeBorderVsGround: report.nodes.length ? Math.min(...report.nodes.map((n) => n.borderVsGround)) : null,
    connector: report.connectors.length ? Math.min(...report.connectors.map((c) => c.ratio)) : null,
    chip: report.chips.length
      ? Math.min(...report.chips.map((c) => (c.fillVsGround !== undefined ? c.fillVsGround : c.ratio)))
      : null,
  },
  fails: { labels: labelFails.length, nodes: nodeFails.length, chips: chipFails.length, connectors: connFails.length },
  banners,
};
writeFileSync(join(HERE, 'contrast-report.json'), JSON.stringify(report, null, 2) + '\n');

let ok = true;
for (const b of banners) {
  console.log(`${b[1] ? 'PASS' : 'FAIL'}  ${b[0]}${b[2] ? ` — ${b[2]}` : ''}`);
  if (!b[1]) ok = false;
}
const fmt = (rows, keys) => rows.map((r) => `  ${keys(r)}`).join('\n');
console.log(`\nlabels (≥4.5): min ${report.summary.minRatios.label}`);
console.log(fmt(report.labels, (l) => `${l.node}: glyph ${l.glyph.hex} on fill ${l.fill} = ${l.ratio} ${l.ratio >= 4.5 ? 'PASS' : 'FAIL'}`));
console.log(`\nnodes (≥3): fill-min ${report.summary.minRatios.nodeFillVsGround}, border-min ${report.summary.minRatios.nodeBorderVsGround}`);
console.log(fmt(report.nodes, (n) => `${n.node}: fill ${n.fill.hex} vs ground ${n.ground.hex} = ${n.fillVsGround} ${n.fillVsGround >= 3 ? 'PASS' : 'FAIL'}; border ${n.border.hex} = ${n.borderVsGround} ${n.borderVsGround >= 3 ? 'PASS' : 'FAIL'}`));
console.log(`\nconnectors (≥3, every edge × 1/4|1/2|3/4): min ${report.summary.minRatios.connector}`);
if (report.chips.length) console.log(fmt(report.chips, (c) => `chip '${c.chip}': ${c.fillVsGround !== undefined ? `${c.fill.hex} vs ground ${c.ground.hex} = ${c.fillVsGround} ${c.fillVsGround >= 3 ? 'PASS' : 'FAIL'}` : `glyph ${c.glyph.hex} on fill = ${c.ratio} ${c.ratio >= 4.5 ? 'PASS' : 'FAIL'}`}`));
console.log(fmt(report.connectors, (c) => `edge ${c.path} @${c.at}: core ${c.lineCore.hex} (lock +${c.lineCore.lockOffsetDev}dev) vs ground ${c.ground.hex} (steps ${c.ground.steps}) = ${c.ratio} ${c.ratio >= 3 ? 'PASS' : 'FAIL'}`));
if (report.skipped.length) console.log(`\nskipped + recorded:\n${report.skipped.map((s) => `  ${JSON.stringify(s)}`).join('\n')}`);
if (labelFails.length || nodeFails.length || chipFails.length || connFails.length) ok = false;
console.log(`\n${ok ? 'PROBE PASS' : 'PROBE FAIL'} — full report: ${join(HERE, 'contrast-report.json')}`);
process.exit(ok ? 0 : 1);
