#!/usr/bin/env node
// verify-print — the print-pipeline probe (print-pipeline,
// 2026-08-30; rewritten from the paged-doc-family probe). verify-
// press's playwright-core pattern: a REAL Chromium against the built
// site (self-served from apps/www/dist when nothing answers on PORT).
//
// Locks in, per the change's verification contract:
//
//   bundle      SSR/prerender zero-pagedjs: no page emitted by the
//               build references a chunk carrying the pagedjs
//               runtime — the kernel stays a lazy client-only chunk
//               (dynamic import reached only when a print exit runs)
//   smoke       sim on → the output sibling carries paged pages →
//               margin boxes present with counter content → the ToC
//               page's entries carry REAL kernel-computed page
//               numbers (read from the kernel's inserted
//               target-counter rules) → sim off → container gone,
//               contexts rebound (density re-derived)
//   stamps      the preparatory signal precedes everything
//               (data-jx-print-sim + data-density=sm visible after
//               prepare); afterprint removes only a transaction-OWNED
//               stamp — the r6 fixture set:
//               sim→direct-print→afterprint→sim (stamp survives,
//               artifact stays) and screen→direct-print→afterprint
//               (stamp removed, artifact disposed)
//   animation   the CSS per-slot frame transfer on the dual-slot
//               fixture (one element, two named animations, non-zero
//               original delays, distinct currentTimes): each slot's
//               computed animation-delay equals the design formula
//               delay′ = (c<d)?(d−c):−((c−d) mod D) with the REAL
//               captured c, play-state paused, and the clone's
//               computed phase equals the source's; pre-paused stays
//               paused with its currentTime undisturbed;
//               WAAPI/ALTERNATE/FINISHED ride structured diagnostic
//               rows — no throw
//   roots       the measurability assertion fails loud on a
//               display:none output root (no zero-size pages) and a
//               failure retry succeeds; post-preview cancellation
//               leaves no residue
//   residue     three exit scenarios (consecutive sims, sim→print,
//               failure retry): no output root, no inserted head
//               styles, no active html stamp, no orphan pages
//   whitelist   the audited three-utility duel INSIDE the rendered
//               pages (after rendered — the kernel's rule-disable
//               window distorts during rendering)
//   real print  under print emulation with an active pipeline: the
//               app root hides, the page container stays visible
//               (emulateMedia — no real paper)
//
// Run: node scripts/verify-print.mjs   (PORT=… to retarget)
import { chromium } from '/Users/kzf/Dev/GitHub/jixoai-labs/ui/node_modules/playwright-core/index.mjs';
import { homedir } from 'node:os';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = process.env.PORT ?? '4173';
const CHROME =
  homedir() +
  '/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

// ── self-serve: when nothing answers on PORT, spawn a static server over
// the built dist and take it down after the probe. ──
import { spawn } from 'node:child_process';
import net from 'node:net';

const portOpen = () =>
  new Promise((yes) => {
    const s = net.connect({ port: Number(PORT), host: '127.0.0.1' });
    s.on('connect', () => { s.destroy(); yes(true); });
    s.on('error', () => yes(false));
  });
let serverProc = null;
if (!(await portOpen())) {
  const dist = join(root, 'apps/www/dist');
  if (!existsSync(dist)) {
    console.error('FAIL  no server on :' + PORT + ' and no apps/www/dist to self-serve — build first');
    process.exit(1);
  }
  serverProc = spawn('python3', ['-m', 'http.server', PORT, '--bind', '127.0.0.1', '--directory', dist], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) {
    if (await portOpen()) break;
    await new Promise((r) => setTimeout(r, 200));
  }
}
process.on('exit', () => serverProc?.kill());

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

// ═══════════════════════════════════════════════════════════════════
// 1. the bundle gate: SSR/prerender pages reference zero pagedjs
// ═══════════════════════════════════════════════════════════════════
{
  const dist = join(root, 'apps/www/dist');
  // the runtime markers ONLY: 'pagedjs_pages' alone is a false
  // positive — the kernel stylesheet (imported ?raw into the layout
  // chunk) legitimately carries .pagedjs_pages SELECTORS since r7's
  // one-line head rules; the pagebox class + the inserted-styles
  // attribute exist only in pagedjs runtime code
  const pagedjsSignature = /data-pagedjs-inserted-styles|pagedjs_pagebox/;
  const pages = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, name.name);
      if (name.isDirectory()) walk(full);
      else if (name.name.endsWith('.html')) pages.push(full);
    }
  };
  if (existsSync(dist)) walk(dist);

  const offenders = [];
  let scanned = 0;
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    // the eager chunk set = script srcs + modulepreload links (the
    // built pages hydrate through inline scripts + preloads)
    const refs = [
      ...[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]),
      ...[...html.matchAll(/<link[^>]+href="([^"]+)"[^>]+rel="modulepreload"/g)].map((m) => m[1]),
      ...[...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g)].map((m) => m[1]),
    ];
    for (const ref of refs) {
      const chunk = resolve(dist, '.' + new URL(ref, 'http://x/').pathname);
      if (!existsSync(chunk)) continue;
      scanned++;
      if (pagedjsSignature.test(readFileSync(chunk, 'utf8'))) offenders.push(`${page}: ${ref}`);
    }
    // inline module scripts must not carry the kernel either
    for (const match of html.matchAll(/<script[^>]*type="module"[^>]*>([\s\S]*?)<\/script>/g)) {
      if (pagedjsSignature.test(match[1])) offenders.push(`${page}: <inline module>`);
    }
  }
  check(
    'bundle: prerendered pages reference zero pagedjs (lazy client-only chunk)',
    offenders.length === 0,
    offenders.length ? offenders.slice(0, 3).join(' | ') : `${pages.length} pages, ${scanned} chunks clean`,
  );
}

// ═══════════════════════════════════════════════════════════════════
// 2. the live pipeline (real Chromium)
// ═══════════════════════════════════════════════════════════════════
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1280, height: 1080 } });
// stub the dialog BEFORE hydration: this probe never opens real paper
await page.addInitScript(() => {
  window.print = () => {};
});
await page.goto(`http://localhost:${PORT}/docs/paged.html`);
await page.waitForLoadState('domcontentloaded');
// readiness = the print layer hydrated (its controls exist)
await page.waitForSelector('[data-jx-print-controls]', { timeout: 30000 });
await page.waitForTimeout(400);

const meta = () =>
  page.evaluate(() => {
    const root = document.querySelector('[data-print-output]');
    if (!root?.dataset.jxPrintMeta) return null;
    return JSON.parse(root.dataset.jxPrintMeta);
  });
const waitForMeta = async () => {
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-print-output]');
    return Boolean(root?.dataset.jxPrintMeta);
  }, null, { timeout: 30000 });
  return meta();
};
const residue = () =>
  page.evaluate(() => ({
    output: Boolean(document.querySelector('[data-print-output]')),
    pages: document.querySelectorAll('.pagedjs_page').length,
    insertedStyles: [...document.head.querySelectorAll('style[data-pagedjs-inserted-styles]')].length,
    active: document.documentElement.hasAttribute('data-jx-print-active'),
  }));
const mediumText = () => page.textContent('[data-jx-print-medium]');

// ---- 2a. sim on → pages + margin boxes + real ToC numbers ---------------
await page.click('[data-print-source] [data-jx-print-sim-toggle]');
const simMeta = await waitForMeta();
// THE POST-READY MEND: relocate.ts's tail sweep can mend the layout
// after the flight publishes ready (pagedjs's re-chunk tail re-slots
// split halves late) — every read below must see the RESTED artifact,
// so poll the metadata stamp until it goes quiet before asserting
await page.waitForFunction(
  () => {
    const root = document.querySelector('[data-print-output]');
    if (!root?.dataset.jxPrintMeta) return false;
    const meta = JSON.parse(root.dataset.jxPrintMeta);
    const stamp = `${meta.renderId}/${meta.keepRelocated}/${meta.keepRejoined}`;
    if (window.__jxPrintMetaStamp === stamp) {
      window.__jxPrintMetaStable = (window.__jxPrintMetaStable ?? 0) + 1;
    } else {
      window.__jxPrintMetaStamp = stamp;
      window.__jxPrintMetaStable = 0;
    }
    return window.__jxPrintMetaStable >= 12;
  },
  null,
  { timeout: 15000, polling: 100 },
);

const pagesCount = await page.evaluate(
  () => document.querySelectorAll('[data-print-output] .pagedjs_page').length,
);
check(
  'sim: the output sibling carries paged pages (2+, real chunking)',
  pagesCount >= 2 && simMeta.pages === pagesCount,
  `pages=${pagesCount} meta.pages=${simMeta?.pages}`,
);

// the running grammar (Owner r5): the industry-standard furniture —
// icon + docTitle left, the running sectionTitle right (string-set
// persistence), the folio pair ONE centered content "X / Y". The
// first page is the injected ToC — its doc title has not been
// string-set yet, so the top-left may legitimately read empty there
// (the icon still rides it as the brand mark); every content page
// carries the SAME doc title and its own section
// (the stamped icons load asynchronously — settle them before reading)
await page
  .waitForFunction(
    () => [...document.querySelectorAll('.jx-print-header-icon')].every((img) => img.complete),
    null,
    { timeout: 8000 },
  )
  .catch(() => {});
const marginGrammar = await page.evaluate(() => {
  const out = document.querySelector('[data-print-output]');
  const read = (sel) =>
    [...(out ? out.querySelectorAll(sel) : [])].map((box) => getComputedStyle(box, ':after').content);
  const icons = out ? [...out.querySelectorAll('.pagedjs_margin-top-left .jx-print-header-icon')] : [];
  return {
    pages: out ? out.querySelectorAll('.pagedjs_page').length : 0,
    bl: read('.pagedjs_margin-bottom-left .pagedjs_margin-content'),
    br: read('.pagedjs_margin-bottom-right .pagedjs_margin-content'),
    bc: read('.pagedjs_margin-bottom-center .pagedjs_margin-content'),
    tl: read('.pagedjs_margin-top-left .pagedjs_margin-content'),
    tr: read('.pagedjs_margin-top-right .pagedjs_margin-content'),
    iconCount: icons.length,
    iconLoaded: icons.every((img) => img.naturalWidth > 0),
  };
});
const strip = (c) => c.replace(/^"|"$/g, '');
const docTitles = [...new Set(marginGrammar.tl.map(strip).filter((t) => t.length > 0))];
const sections = marginGrammar.tr.map(strip).filter((t) => t.length > 0);
check(
  'margin grammar (Owner r5): icon+docTitle running left, sectionTitle right, the folio pair ONE centered content',
  marginGrammar.bc.length === pagesCount &&
    marginGrammar.bc.every((c) => /counter\(page\)/.test(c) && /counter\(pages\)/.test(c)) &&
    marginGrammar.tl.length >= pagesCount - 1 &&
    docTitles.length === 1 && /paged print/.test(docTitles[0]) &&
    sections.length >= pagesCount - 2 &&
    marginGrammar.iconCount === marginGrammar.pages && marginGrammar.iconLoaded &&
    // the retired corners hold NO content (the boxes may exist, empty)
    marginGrammar.bl.every((c) => c === 'none') && marginGrammar.br.every((c) => c === 'none'),
  JSON.stringify({
    pages: marginGrammar.pages,
    bc: marginGrammar.bc[0],
    tl: marginGrammar.tl,
    tr: sections,
    iconCount: marginGrammar.iconCount,
  }),
);

// ── the r7 one-line head + bar law: the icon and the doc title share
//    ONE line (pagedjs's injected display:block stacking is
//    out-ranked), and the glass bar carries the ready stage with the
//    print button enabled (the pending stage is jsdom-locked)
const headLine = await page.evaluate(() => {
  const out = document.querySelector('[data-print-output]');
  const boxes = out ? [...out.querySelectorAll('.pagedjs_margin-top-left .pagedjs_margin-content')] : [];
  const oneLine = boxes.filter((box) => {
    const icon = box.querySelector('.jx-print-header-icon');
    if (!icon) return true; // the ToC page legitimately rides the icon alone
    const ir = icon.getBoundingClientRect();
    const br = box.getBoundingClientRect();
    // same line: vertical centers within half the icon height
    return Math.abs((ir.top + ir.bottom) / 2 - (br.top + br.bottom) / 2) < ir.height / 2 + 1;
  }).length;
  const bar = out?.querySelector('[data-jx-print-sim-bar]') ?? null;
  const status = bar?.querySelector('[data-jx-print-bar-status]') ?? null;
  const printBtn = bar?.querySelector('[data-jx-print-bar-print]') ?? null;
  const barCs = bar ? getComputedStyle(bar) : null;
  return {
    boxes: boxes.length,
    oneLine,
    bar: Boolean(bar),
    statusText: status?.textContent ?? null,
    printEnabled: printBtn ? !printBtn.disabled : false,
    backdrop: barCs?.backdropFilter ?? null,
    shadow: barCs ? Boolean(barCs.boxShadow && barCs.boxShadow !== 'none') : false,
  };
});
check(
  'head + bar (r7): icon and title share ONE line; the glass bar shows the ready stage with the print button enabled',
  headLine.boxes >= 1 &&
    headLine.oneLine === headLine.boxes &&
    headLine.bar &&
    /pages/.test(headLine.statusText ?? '') &&
    headLine.printEnabled &&
    /blur/.test(headLine.backdrop ?? '') &&
    headLine.shadow,
  JSON.stringify(headLine),
);

const tocNumbers = await page.evaluate(() => {
  // the folios are BACKFILLED (data-jx-folio) once the layout has
  // placed every section — attr(), not target-counter: pagedjs's own
  // resolver loses targets moved by keep-with-next (the moved clone
  // sheds its id); [data-id] survives every id-shedding path
  const anchors = [...document.querySelectorAll('[data-print-output] nav[data-jx-print-toc] a')];
  return {
    hrefs: anchors.map((a) => a.getAttribute('href').slice(1)),
    numbers: anchors.map((a) => {
      const folio = a.getAttribute('data-jx-folio');
      return folio === null ? null : Number(folio);
    }),
  };
});
check(
  'sim: the injected ToC page carries real kernel-computed page numbers',
  tocNumbers.hrefs.length >= 5 &&
    tocNumbers.numbers.every((n) => Number.isInteger(n) && n >= 1) &&
    tocNumbers.numbers.every((n, i) => i === 0 || n >= tocNumbers.numbers[i - 1]) &&
    Math.max(...tocNumbers.numbers) <= pagesCount,
  `hrefs=${JSON.stringify(tocNumbers.hrefs)} numbers=${JSON.stringify(tocNumbers.numbers)}`,
);

// the ToC page is FIRST (the nav owns its page before the content)
const tocFirst = await page.evaluate(() => {
  const first = document.querySelector('[data-print-output] .pagedjs_page');
  return Boolean(first?.querySelector('nav[data-jx-print-toc]'));
});
check('sim: the ToC page opens the artifact (break-after: page)', tocFirst, '');

// the restyled ToC (Owner walkthrough r2): every entry carries its
// auto-collected summary as a sub line + the dot-leader structure
const tocStyle = await page.evaluate(() => {
  const out = document.querySelector('[data-print-output]');
  const subs = [...out.querySelectorAll('nav[data-jx-print-toc] [data-jx-print-toc-sub]')];
  const leaders = out.querySelectorAll('nav[data-jx-print-toc] [data-jx-print-toc-leader]').length;
  const entries = out.querySelectorAll('nav[data-jx-print-toc] a').length;
  return { subs: subs.length, nonEmpty: subs.filter((s) => ((s.textContent ?? '').trim().length > 10)).length, leaders, entries };
});
check(
  'toc style: auto-collected subtitle sub lines + the dot-leader stretch on every entry',
  tocStyle.entries >= 5 && tocStyle.leaders === tocStyle.entries && tocStyle.subs >= 4 && tocStyle.nonEmpty === tocStyle.subs,
  JSON.stringify(tocStyle),
);

// the borderless paper projection (Owner walkthrough r2): the default
// print variant — the card's closed box dissolves (NO side borders),
// the block-end separator is solid unless a split dash takes the edge
// (continuation halves legitimately carry the dashed rule). The dash
// is INNERMOST-only AND the whole edge is dash-ALONE: the pipeline's
// normalization quiets the rebuilt ancestor chain and the kernel
// suppresses the outer layers' own borders at the cut (one cut, one
// dash, nothing else draws there — no stacked band). Keep-with-next
// covers headings, a section card's header block, and a code card's
// head strip (a FIGCAPTION — the CodeBlock meta rides CodeCard's
// header snippet; vision r4's stranded "→ the layer, assembled").
const paperProjection = await page.evaluate(() => {
  const out = document.querySelector('[data-print-output]');
  const cards = [...out.querySelectorAll('section.bg-card')];
  // purely typographic (2026-09-03): sides always gone; top may be a
  // continuation dash; the section's own end hairline is RETIRED —
  // bottom reads none, or a cut dash on a split half
  const noClosedBox = (el) => {
    const cs = getComputedStyle(el);
    if (cs.borderLeftStyle !== 'none' || cs.borderRightStyle !== 'none') return false;
    const topOk = cs.borderTopStyle === 'none' ||
      (cs.borderTopStyle === 'dashed' && el.hasAttribute('data-split-from'));
    const bottomOk = cs.borderBottomStyle === 'none' ||
      (cs.borderBottomStyle === 'dashed' && el.hasAttribute('data-split-to'));
    return topOk && bottomOk;
  };
  const borderless = cards.filter((c) => noClosedBox(c)).length;
  // the section's dividing line is the COMPONENT'S structural
  // <Separator> (2026-09-03, standard componentization — the Dialog
  // row-ruler pattern): the clone carries the real element, every
  // stamped header zone must sit flush above one (width checks, not
  // style: tw preflight defaults border-style to solid at width 0)
  const headers = [...out.querySelectorAll("section.bg-card > div[data-break-after='avoid']")];
  const headersBorderless = headers.filter(
    (h) => getComputedStyle(h).borderBottomWidth === '0px',
  ).length;
  const seps = [...out.querySelectorAll('section.bg-card > [data-jx-section-sep]')];
  const separatorTracks = seps.filter((s) => {
    const cs = getComputedStyle(s);
    return cs.display !== 'none' && cs.height === '1px' && /contrast/.test(cs.backdropFilter);
  }).length;
  // the dash is a BLOCK judgment (2026-09-03): only stamped block
  // halves ([data-jx-split-dash] — boxed card cuts) may draw, and
  // every stamp must actually dash its cut sides
  const blockDashEls = [...out.querySelectorAll('[data-jx-split-dash]')];
  const blockDashes = blockDashEls.length;
  const blockDashed = blockDashEls.filter((el) => {
    const cs = getComputedStyle(el);
    if (el.hasAttribute('data-split-to') && cs.borderBottomStyle !== 'dashed') return false;
    if (el.hasAttribute('data-split-from') && cs.borderTopStyle !== 'dashed') return false;
    return true;
  }).length;
  // a cut-chain element dashing WITHOUT the stamp is the old
  // per-element innermost rule shipping noise (the Owner's report)
  const strayDashed = [...out.querySelectorAll('[data-split-to],[data-split-from]')]
    .filter((el) => {
      const cs = getComputedStyle(el);
      const bottomDashed = el.hasAttribute('data-split-to') && cs.borderBottomStyle === 'dashed';
      const topDashed = el.hasAttribute('data-split-from') && cs.borderTopStyle === 'dashed';
      return (bottomDashed || topDashed) && !el.hasAttribute('data-jx-split-dash');
    }).length;
  // the outer chain is quiet on its CUT side — not just non-dashed:
  // the suppression is `none` (an authored hairline at a cut edge
  // would stack 1px from the owner's dash — vision r4's double
  // line). A STAMPED block half ([data-jx-split-dash]) is the OWNER:
  // its dash replaces the quieted edge by design
  const outerQuiet = [...out.querySelectorAll('[data-jx-split-outer]')].filter((el) => {
    if (el.hasAttribute('data-jx-split-dash')) return true;
    const cs = getComputedStyle(el);
    const topOk = !el.hasAttribute('data-split-from') || cs.borderTopStyle === 'none';
    const bottomOk = !el.hasAttribute('data-split-to') || cs.borderBottomStyle === 'none';
    return topOk && bottomOk;
  }).length;
  const outerTotal = out.querySelectorAll('[data-jx-split-outer]').length;
  const splitTotal = out.querySelectorAll('[data-split-from]').length;
  // keep-with-next: pagedjs CONSUMES the break-after/before declaration
  // and re-materializes it as data-break-* on the element (the same
  // hijack shape as its counters) — the orphan guards ride there
  const stamped = (sel, attr) => {
    const els = [...out.querySelectorAll(sel)];
    return { total: els.length, kept: els.filter((el) => el.getAttribute(attr) === 'avoid').length };
  };
  const h2 = stamped('.pagedjs_page h2', 'data-break-after');
  const cardHead = stamped('.pagedjs_page section.bg-card > div:first-child', 'data-break-after');
  const codeHead = stamped('.pagedjs_page .jx-code-card > figcaption', 'data-break-after');
  const codeFoot = stamped('.pagedjs_page [data-jx-code-card-foot]', 'data-break-before');
  // pagedjs's chunking REBUILDS split sections — a continuation half's
  // first child is body content that never saw the parse-time stamp;
  // the stamped count must equal the SOURCE's real header count
  const source = document.querySelector('[data-print-source]');
  const cardHeadSource = source ? source.querySelectorAll('section.bg-card > div:first-child').length : 0;
  // GEOMETRY: at a cut edge exactly one line may draw — every same-y
  // (±3px) x-overlapping pair where BOTH sides are systemic (a split
  // marker or the card hairline) is a doubled cut; a dash adjacent to
  // an authored separator of UNMARKED content is reported, not gated
  const pageNo = (el) => el.closest('.pagedjs_page')?.getAttribute('data-page-number') ?? '?';
  const lines = [];
  for (const el of out.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width < 8) continue;
    for (const side of ['top', 'bottom']) {
      if (parseFloat(cs[`border-${side}-width`]) === 0) continue;
      const st = cs[`border-${side}-style`];
      if (st === 'none' || st === 'hidden') continue;
      lines.push({
        page: pageNo(el), y: Math.round(side === 'top' ? r.top : r.bottom),
        x0: Math.round(r.left), x1: Math.round(r.right), style: st,
        systemic: el.hasAttribute('data-split-to') || el.hasAttribute('data-split-from') || el.matches('section.bg-card'),
        el: el.tagName.toLowerCase(),
      });
    }
  }
  const byPage = {};
  for (const ln of lines) (byPage[ln.page] ??= []).push(ln);
  let doubledCuts = 0;
  const authoredNearCut = [];
  for (const lns of Object.values(byPage)) {
    lns.sort((a, b) => a.y - b.y);
    let group = [lns[0]];
    const flush = () => {
      for (let i = 1; i < group.length; i++) {
        const a = group[i - 1], b = group[i];
        if (Math.abs(a.y - b.y) > 3) continue;
        if (!(a.x0 < b.x1 - 2 && b.x0 < a.x1 - 2)) continue;
        if (a.systemic && b.systemic) doubledCuts++;
        else if (a.style === 'dashed' || b.style === 'dashed')
          authoredNearCut.push({ page: a.page, y: a.y, a: a.el + ':' + a.style, b: b.el + ':' + b.style });
      }
    };
    for (let i = 1; i < lns.length; i++) {
      if (lns[i].y - group[group.length - 1].y <= 3) group.push(lns[i]);
      else { flush(); group = [lns[i]]; }
    }
    flush();
  }
  // STRANDS + REJOINS (mirrors lib/print/relocate.ts): a stamped
  // keep carrier still ending its page — relocated into its nearest
  // split-continuation ancestor when uncut, REJOINED with its pair
  // when itself cut — the pipeline's enforcement pass must leave
  // zero of either wherever the target page has room (pagedjs's own
  // avoid backwalk misses these)
  const pagesArr = [...out.querySelectorAll('.pagedjs_page')];
  const strands = [];
  const rejoinGaps = [];
  const leafBottomOf = (area) => {
    let bottom = -Infinity;
    for (const el of area.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.height <= 1) continue;
      let leaf = true;
      for (const child of el.children) {
        if (child.getBoundingClientRect().height > 1) { leaf = false; break; }
      }
      if (leaf && r.bottom > bottom) bottom = r.bottom;
    }
    return bottom;
  };
  pagesArr.forEach((p, i) => {
    if (i === pagesArr.length - 1) return;
    const content = p.querySelector('.pagedjs_page_content');
    if (!content) return;
    let deepest = null;
    let deepestBottom = -Infinity;
    for (const el of content.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.height <= 1) continue;
      let leaf = true;
      for (const child of el.children) {
        if (child.getBoundingClientRect().height > 1) { leaf = false; break; }
      }
      if (leaf && r.bottom > deepestBottom) { deepestBottom = r.bottom; deepest = el; }
    }
    if (!deepest) return;
    const carriers = [];
    for (let el = deepest; el && el !== content; el = el.parentElement) {
      if (el.getAttribute('data-break-after') === 'avoid') carriers.push(el);
    }
    const carrier = carriers.reverse().find((el) => (el.parentElement?.getAttribute('data-ref') ?? '') !== '');
    if (!carrier || !carrier.parentElement) return;
    // cut-aware, BOUNDED AT THE CARRIER (mirrors the pass): a cut
    // marker strictly below an uncut carrier would tear — the r5
    // law; the scan stops at the carrier on purpose
    let cutBelowCarrier = false;
    for (let el = deepest; el && el !== carrier; el = el.parentElement) {
      if (el.hasAttribute('data-split-to')) { cutBelowCarrier = true; break; }
    }
    if (cutBelowCarrier) return;
    // FIT exemption (mirrors the pass): a keep whose block + follower
    // exceed every page's remainder is UNSATISFIABLE — pagedjs's cut
    // between them is the least-bad break, not a shippable orphan.
    // LEAF-only bottom: pagedjs's rebuilt wrappers inherit the
    // area's height and touch its bottom on every page — an
    // any-element scan reads available = 0 always and exempts every
    // candidate, making this gate vacuous (codex r6 + ZCode probe)
    const fitsOn = (pageEl, need) => {
      const area = pageEl?.querySelector('.pagedjs_page_content');
      if (!area) return false;
      return need <= area.getBoundingClientRect().bottom - leafBottomOf(area) + 1;
    };
    if (carrier.hasAttribute('data-split-to')) {
      // REJOIN gap: the cut avoid block's pair waits on a later page
      // with room — the pass must have reunited them
      const ref = carrier.getAttribute('data-ref');
      const pair = ref
        ? pagesArr.slice(i + 1).map((q) => q.querySelector(`[data-ref="${CSS.escape(ref)}"][data-split-from]`)).find(Boolean)
        : null;
      if (!pair) return;
      if (fitsOn(pair.closest('.pagedjs_page'), carrier.getBoundingClientRect().height)) {
        rejoinGaps.push({ page: p.getAttribute('data-page-number'), ref: String(ref).slice(0, 8) });
      }
      return;
    }
    // STRAND: the nearest split-continuation ancestor half (the
    // carrier's own parent when it split — the classic mend; else
    // the deepest ancestor that did — the ended-whole shape)
    let target = null;
    for (let el = carrier.parentElement; el && el !== content; el = el.parentElement) {
      const ref = el.getAttribute('data-ref');
      if (!ref) continue;
      const half = pagesArr.slice(i + 1).map((q) => q.querySelector(`[data-ref="${CSS.escape(ref)}"][data-split-from]`)).find(Boolean);
      if (half) { target = half; break; }
    }
    if (!target) return;
    if (fitsOn(target.closest('.pagedjs_page'), carrier.getBoundingClientRect().height)) {
      strands.push({ page: p.getAttribute('data-page-number'), ref: String(target.getAttribute('data-ref')).slice(0, 8) });
    }
  });
  return {
    cards: cards.length, borderless, blockDashes, blockDashed, strayDashed,
    headersTotal: headers.length, headersBorderless, separatorTracks, sepsTotal: seps.length,
    outerQuiet, outerTotal, splitTotal, doubledCuts, authoredNearCut, strands, rejoinGaps,
    keepRelocated: JSON.parse(out.dataset.jxPrintMeta ?? '{}').keepRelocated ?? null,
    keepRejoined: JSON.parse(out.dataset.jxPrintMeta ?? '{}').keepRejoined ?? null,
    h2, cardHead, cardHeadSource, codeHead, codeFoot,
  };
});
check(
  'paper projection: cards borderless; the dash is a BLOCK judgment (stamped card cuts only, zero stray); no stranded or un-rejoined keeps on any page',
  paperProjection.cards >= 5 && paperProjection.borderless === paperProjection.cards &&
    // the separator as a STANDARD COMPONENT (2026-09-03): every
    // section's structural <Separator> rides the clone and dashes
    // its contrast ghost; every stamped header sits flush above one
    // (zero authored border width)
    paperProjection.headersTotal >= 5 &&
    paperProjection.headersBorderless === paperProjection.headersTotal &&
    paperProjection.sepsTotal >= 5 &&
    paperProjection.separatorTracks === paperProjection.sepsTotal &&
    paperProjection.splitTotal >= 1 &&
    // the dash law, NON-vacuously: the pilot's tall code card
    // fragments across pages 7-9, so block cuts with real dashes
    // exist; every stamp dashes its cut sides, and NO unstamped
    // cut-chain element draws (the old innermost rule dashed plain
    // flow at nearly every page turn — the Owner's noise report)
    paperProjection.blockDashes >= 2 && paperProjection.blockDashed === paperProjection.blockDashes &&
    paperProjection.strayDashed === 0 &&
    (paperProjection.outerTotal === 0 || paperProjection.outerQuiet === paperProjection.outerTotal) &&
    paperProjection.doubledCuts === 0 &&
    // zero strands AND zero rejoin gaps is the law, NON-vacuously:
    // the detector exempts only genuinely unsatisfiable keeps
    // (leaf-measured room < carrier). And the passes must be LIVE on
    // this document: the pilot carries both shapes (the stranded
    // figcaption with room on its continuation page, and the
    // eyebrow-only cut header whose pair has room), so
    // keepRelocated >= 1 AND keepRejoined >= 1 hold — the historical
    // failure modes (the whole-chain cut guard, the any-element fit
    // scan reading available=0 forever) pinned the counters at 0
    // while shipping orphans
    paperProjection.keepRelocated >= 1 && paperProjection.keepRejoined >= 1 &&
    paperProjection.strands.length === 0 && paperProjection.rejoinGaps.length === 0 &&
    paperProjection.h2.total >= 3 && paperProjection.h2.kept === paperProjection.h2.total &&
    paperProjection.cardHeadSource >= 3 && paperProjection.cardHead.kept >= 1 &&
    paperProjection.codeHead.total >= 1 && paperProjection.codeHead.kept === paperProjection.codeHead.total &&
    (paperProjection.codeFoot.total === 0 || paperProjection.codeFoot.kept === paperProjection.codeFoot.total),
  JSON.stringify(paperProjection),
);

// ---- 2b. stamp timing: the preparatory signal precedes everything -------
const stamps = await page.evaluate(() => {
  const source = document.querySelector('[data-print-source]');
  return {
    sim: source?.hasAttribute('data-jx-print-sim') ?? false,
    density: source?.getAttribute('data-density'),
    medium: document.querySelector('[data-jx-print-medium]')?.textContent,
  };
});
check(
  'stamps: prepare left the sim stamp + the density intervention (medium reads sim)',
  stamps.sim && stamps.density === 'sm' && /sim/.test(stamps.medium ?? ''),
  JSON.stringify(stamps),
);

// ---- 2b′. the hue pin (the root layout's plugin chain, live) ------------
// The ROOT layout provides the print plugins BEFORE createHueContext —
// the hue pipeline's captured chain. The medium gate opening must pin
// the projection to the def default: the documentElement stamp stops
// tracking the wall clock and reads 0. (The clock itself only sits at
// 0 in the midnight 4-minute window — in that window pin and clock
// are indistinguishable and the pair is skipped, not lied about.)
const huePinned = await page.evaluate(() => {
  const pinned = document.documentElement.style.getPropertyValue('--brand-hue');
  const now = new Date();
  const secs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  return { pinned, clockAtZero: Math.round((secs / 86400) * 360) === 0 };
});
check(
  'hue: the open gate pins --brand-hue to the def default (the layout-level chain, live)',
  huePinned.clockAtZero || huePinned.pinned === '0',
  huePinned.clockAtZero
    ? 'skipped — the wall clock itself sits at hue 0 (midnight window)'
    : `--brand-hue=${huePinned.pinned}`,
);

// ---- 2c. the CSS per-slot frame transfer (the dual-slot fixture) --------
const phaseReport = await page.evaluate(() => {
  const source = document.querySelector('[data-jx-print-fx="dual"]');
  const clone = document.querySelector('[data-print-output] [data-jx-print-fx="dual"]');
  if (!source || !clone) return { ok: false, why: 'fixture missing' };
  const metaEl = document.querySelector('[data-print-output]');
  const meta = JSON.parse(metaEl.dataset.jxPrintMeta ?? '{}');
  const srcCs = getComputedStyle(source);
  const cloneCs = getComputedStyle(clone);
  const toMs = (list) =>
    list.split(',').map((piece) => {
      const m = /(-?[\d.]+)(ms|s)/.exec(piece.trim());
      if (!m) return 0;
      return m[2] === 'ms' ? Number(m[1]) : Number(m[1]) * 1000;
    });
  const names = srcCs.animationName.split(',').map((s) => s.trim());
  const srcDelays = toMs(srcCs.animationDelay);
  const durations = toMs(srcCs.animationDuration);
  const cloneDelays = toMs(cloneCs.animationDelay);
  const anims = source.getAnimations({ subtree: false }).filter((a) => a instanceof window.CSSAnimation);
  const byName = new Map(anims.map((a) => [a.animationName, a]));
  const slots = names.map((name, i) => {
    // the write record for this slot (path + slot index match)
    const record = (meta.transfer?.writes ?? []).find((w) => w.animationName === name && w.slot === i);
    const anim = byName.get(name);
    const cNow = anim ? anim.currentTime : null;
    return {
      name,
      d: srcDelays[i],
      D: durations[i],
      recordedC: record?.c,
      delayPrime: record?.delayPrime,
      cloneDelay: cloneDelays[i],
      playState: cloneCs.animationPlayState,
      phaseSource: anim ? (((cNow - srcDelays[i]) % durations[i]) + durations[i]) % durations[i] : null,
      phaseClone: (((-cloneDelays[i]) % durations[i]) + durations[i]) % durations[i],
    };
  });
  return { ok: true, slots, applied: meta.transfer?.applied, writes: (meta.transfer?.writes ?? []).length };
});
{
  const ok =
    phaseReport.ok &&
    (phaseReport.writes ?? 0) >= 2 &&
    phaseReport.slots.every((slot) => {
      if (slot.delayPrime === null || slot.delayPrime === undefined) return false;
      // the design formula against the REAL captured c
      const expected = slot.recordedC < slot.d ? slot.d - slot.recordedC : -((slot.recordedC - slot.d) % slot.D);
      // the clone's phase at t=0 equals the SOURCE's phase at capture:
      // ((recordedC − d) mod D) === (−delay′ mod D) — exact by the formula
      const phaseAtCapture = (((slot.recordedC - slot.d) % slot.D) + slot.D) % slot.D;
      // the live source kept RUNNING past capture — its phase may have
      // wrapped any number of eras; the wrap-aware advance must be
      // strictly positive (it genuinely ticked past the capture — a
      // bare `>= 0` is a tautology under the mod, subagent pre-review)
      const advance =
        (((slot.phaseSource - phaseAtCapture) % slot.D) + slot.D) % slot.D;
      return (
        Math.abs(slot.delayPrime - expected) < 1 && // the record matches the formula
        Math.abs(slot.cloneDelay - slot.delayPrime) < 1 && // the clone carries it
        slot.playState === 'paused' &&
        Math.abs(phaseAtCapture - slot.phaseClone) < 1.5 && // the frozen phase transferred
        advance > 0 // the live source resumed (wrap-aware, genuinely ticked)
      );
    });
  check(
    'animation: per-slot frame transfer — delay′ formula, paused, phase equal to source',
    ok,
    JSON.stringify(phaseReport.slots ?? phaseReport),
  );
  const distinct = new Set(phaseReport.slots?.map((s) => s.delayPrime) ?? []).size;
  check(
    'animation: the two slots carry DISTINCT transferred phases (distinct currentTimes honored)',
    phaseReport.ok && distinct === 2 && new Set(phaseReport.slots.map((s) => s.d)).size === 2,
    `delays=${JSON.stringify(phaseReport.slots?.map((s) => s.delayPrime))}`,
  );
}

// pre-paused: neither started nor disturbed
const prePaused = await page.evaluate(() => {
  const dot = document.querySelector('[data-jx-print-fx="prepaused"] [data-jx-print-fx-dot]');
  if (!dot) return { ok: false };
  const anim = dot.getAnimations()[0];
  return {
    ok: true,
    state: anim?.playState,
    time: anim?.currentTime,
    computedState: getComputedStyle(dot).animationPlayState,
  };
});
check(
  'animation: the pre-paused slot stays paused with its currentTime undisturbed (0)',
  prePaused.ok &&
    prePaused.state === 'paused' &&
    prePaused.computedState === 'paused' &&
    (prePaused.time ?? 0) === 0,
  JSON.stringify(prePaused),
);

// diagnostics: WAAPI / ALTERNATE / FINISHED ride rows, nothing threw
const diagnostics = await page.evaluate(() =>
  [...document.querySelectorAll('[data-jx-print-diagnostic]')].map((row) => row.dataset.code),
);
check(
  'animation: WAAPI/ALTERNATE/FINISHED ride structured diagnostic rows (continue, no throw)',
  ['WAAPI', 'ALTERNATE', 'FINISHED'].every((code) => diagnostics.includes(code)) &&
    (simMeta.diagnostics ?? []).length >= 3,
  `rows=${JSON.stringify(diagnostics)}`,
);

// ---- 2d. the whitelist duel INSIDE the rendered pages -------------------
await page.waitForTimeout(150); // comfortably past the rendered gate
const whitelist = await page.evaluate(() => {
  const STRIP = {
    hide: '[data-jx-print-probe-item="hide"]',
    flatten: '[data-jx-print-probe-item="flatten"]',
    canvasScroll: '[data-jx-print-probe-item="canvas-scroll"]',
    codeCardPre: '[data-jx-print-probe-item="code-card-pre"]',
    propsTableScroll: '[data-jx-print-probe-item="props-table-scroll"]',
  };
  const out = {};
  for (const [key, selector] of Object.entries(STRIP)) {
    const node = document.querySelector(`[data-print-output] ${selector}`);
    if (!node) {
      out[key] = { missing: true };
      continue;
    }
    const cs = getComputedStyle(node);
    out[key] = { display: cs.display, overflowX: cs.overflowX, maxBlockSize: cs.maxBlockSize };
  }
  return out;
});
check(
  'whitelist (in pages): hide → display:none; the rest → overflow visible + max-block-size none',
  whitelist.hide.display === 'none' &&
    ['flatten', 'canvasScroll', 'codeCardPre', 'propsTableScroll'].every(
      (key) =>
        !whitelist[key].missing &&
        whitelist[key].overflowX === 'visible' &&
        whitelist[key].maxBlockSize === 'none',
    ),
  JSON.stringify(whitelist),
);

// the code gutter (r9: the gutter is a real table COLUMN — each line
// a row, the number a cell; wrapped code stays right of the column).
// The gutter
// is ATTR-numbered (data-line, set by the clone transform): pagedjs's
// Counters handler strips author counter rules and re-derives them as
// per-element negative increments — with multiple pres the gutter
// counted from −N (walkthrough fix, 2026-08-31). Assertions: every
// block opens at ≥1, the rendered ::before carries the attr/number,
// and ZERO jx-print-line counter rules exist anywhere (no hijack left).
const gutter = await page.evaluate(() => {
  const lines = [...document.querySelectorAll('[data-print-output] pre .jx-print-line')];
  if (lines.length === 0) return { ok: false };
  const firsts = [...document.querySelectorAll('[data-print-output] pre')].map(
    (pre) => pre.querySelector('.jx-print-line')?.getAttribute('data-line'),
  );
  let counterHijack = 0;
  for (const sheet of document.styleSheets) {
    let cssRules;
    try {
      cssRules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of cssRules) {
      const css = rule.cssText ?? '';
      if (css.includes('jx-print-line') && /counter-(reset|increment)/.test(css)) counterHijack++;
    }
  }
  const cs = getComputedStyle(lines[0]);
  // ── the r7 airy-line law: ZERO separator text nodes may survive in
  //    a marked-up pre (shiki's "\n" between span.line renders an
  //    anonymous blank line box under pre-wrap — the doubled leading
  //    the Owner measured; splitPreLines strips them)
  const separatorNodes = [...document.querySelectorAll('[data-print-output] pre code')]
    .filter((code) => code.querySelector(':scope > .jx-print-line') !== null)
    .reduce(
      (n, code) =>
        n +
        [...code.childNodes].filter(
          (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '') !== '',
        ).length,
      0,
    );
  // ── the r7 parity law: consecutive code lines sit ONE line-height
  //    apart (the authored 1.6 — the screen value rides verbatim now);
  //    a surviving separator doubles the delta. The SAMPLE is the
  //    first pre holding a real run of lines — the first pre in
  //    document order can be a single-line snippet, and layout
  //    shifts legitimately reorder which pre leads the document
  const pres = [...document.querySelectorAll('[data-print-output] pre')].filter(
    (p) => p.querySelectorAll('.jx-print-line').length >= 4,
  );
  const sample = pres[0] ?? lines[0].closest('pre');
  const sampleLines = sample ? [...sample.querySelectorAll('.jx-print-line')] : [];
  const deltas = [];
  for (let i = 1; i < Math.min(sampleLines.length, 12); i++) {
    deltas.push(
      sampleLines[i].getBoundingClientRect().top - sampleLines[i - 1].getBoundingClientRect().top,
    );
  }
  const preCs = sample ? getComputedStyle(sample) : null;
  // the browser resolves a numeric line-height to its USED pixel
  // value ('20px') — only a 'normal' needs the fontSize × ratio fall
  const expectedStep = preCs
    ? preCs.lineHeight.endsWith('px')
      ? parseFloat(preCs.lineHeight)
      : parseFloat(preCs.fontSize) * (parseFloat(preCs.lineHeight) || 1.6)
    : null;
  return {
    ok: true,
    count: lines.length,
    whiteSpace: cs.whiteSpace,
    display: cs.display,
    firsts,
    before: getComputedStyle(lines[0], ':before').content,
    counterHijackRules: counterHijack,
    separatorNodes,
    stepMin: deltas.length ? Math.min(...deltas) : null,
    stepMax: deltas.length ? Math.max(...deltas) : null,
    expectedStep,
  };
});
check(
  'gutter (in pages): lines wrap (pre-wrap), attr-numbered per block, zero counter hijack',
  gutter.ok &&
    /pre-wrap/.test(gutter.whiteSpace) &&
    gutter.display === 'block' &&
    gutter.count > 40 &&
    gutter.firsts[0] === '1' &&
    gutter.firsts.every((f) => f !== undefined && Number(f) >= 1) &&
    gutter.counterHijackRules === 0 &&
    /attr\(data-line\)|^"?\d+"?$/.test(gutter.before),
  JSON.stringify(gutter),
);
check(
  'code leading (r7): zero separator text nodes; consecutive lines sit one authored line-height apart',
  gutter.ok &&
    gutter.separatorNodes === 0 &&
    gutter.expectedStep !== null &&
    gutter.stepMin !== null &&
    Math.abs(gutter.stepMin - gutter.expectedStep) < 2 &&
    Math.abs(gutter.stepMax - gutter.expectedStep) < 2,
  `separators=${gutter.separatorNodes} step=[${gutter.stepMin?.toFixed(1)}..${gutter.stepMax?.toFixed(1)}] expected=${gutter.expectedStep?.toFixed(1)}`,
);

// ── the r7 anti-swallow gate: the tall CodeBlock (a card taller than
//    one page) must fragment — every source line lands inside some
//    page's area box, none swallowed behind the sheet clip (the flex
//    figure monolith clipped the tail before the kernel returned the
//    card to block flow)
const tallCard = await page.evaluate(() => {
  const source = document.querySelector('[data-print-source]');
  const sourceCard = [...(source?.querySelectorAll('figure.jx-code-card') ?? [])].find((f) =>
    (f.textContent ?? '').includes('fragmentability fixture') ||
    (f.querySelector('[data-jx-code-card-file]')?.textContent ?? '').includes('tall card'),
  );
  if (!sourceCard) return { ok: false, why: 'tall fixture missing from the source' };
  const sourceLines = sourceCard.querySelectorAll('pre .line, pre .jx-print-line').length;
  const out = document.querySelector('[data-print-output]');
  // the chunks ride successive <pre> siblings; pagedjs's split rebuild
  // distributes them across SEPARATE figure fragments (only the first
  // keeps the head strip) — count by the tall sample's own line shapes
  const printedLines = [...out.querySelectorAll('.jx-print-line')].filter((l) =>
    /^(function shard\d+\(|const page\d+ = await|\/\/ line \d+: the fragment)/.test((l.textContent ?? '').trim()),
  );
  let outside = 0;
  const pagesWithLines = new Set();
  for (const line of printedLines) {
    const page = line.closest('.pagedjs_page');
    const area = page?.querySelector('.pagedjs_page_content');
    if (!page || !area) continue;
    pagesWithLines.add(page.getAttribute('data-page-number'));
    const lr = line.getBoundingClientRect();
    const ar = area.getBoundingClientRect();
    if (lr.bottom > ar.bottom + 2 || lr.top < ar.top - 2) outside++;
  }
  // the BLINDNESS law: pagedjs's UndisplayedFilter marks every
  // [style] element data-undisplayed and the chunker cannot break
  // inside it — the freeze moves Shiki's token colors to classes, so
  // ZERO style-bearing (or marked) elements may remain inside pres.
  // EXEMPT pagedjs's own width pins: layout.js's overflow check
  // stamps resolved column widths as inline styles on the sibling
  // chain ("make them attributes so removal of overflow doesn't do
  // strange things") — engine bookkeeping that can land on any
  // element including a pre, not an authored style surviving the
  // freeze (the user's very first pages sample carried these pins
  // on sections/divs long before any of this week's changes)
  const styledInPres = [...out.querySelectorAll('pre [style]')].filter(
    (el) => (el.getAttribute('style') ?? '').replace(/width:\s*[\d.]+px;?/g, '').trim() !== '',
  ).length;
  const undisplayedInPres = out.querySelectorAll('pre [data-undisplayed]').length;
  return {
    ok: true,
    sourceLines,
    printedLines: printedLines.length,
    outside,
    styledInPres,
    undisplayedInPres,
    pagesWithLines: [...pagesWithLines],
  };
});
check(
  'tall card (r7): a card taller than one page fragments — every line lands inside a page area (nothing swallowed)',
  tallCard.ok &&
    tallCard.sourceLines >= 100 &&
    tallCard.printedLines === tallCard.sourceLines &&
    tallCard.outside === 0 &&
    tallCard.styledInPres === 0 &&
    tallCard.undisplayedInPres === 0 &&
    tallCard.pagesWithLines.length >= 2,
  JSON.stringify(tallCard),
);

// ---- 2e. the r7 mounted-artifact print: sim survives, ZERO rebuild -----
const beforeDirect = await residue();
// a counting stub: the bar's print must call window.print ONCE and
// reuse the mounted artifact — no second preview pass (the metadata's
// renderId is the rebuild counter)
await page.evaluate(() => {
  window.__jxBarPrintCalls = 0;
  const original = window.print;
  window.print = () => {
    window.__jxBarPrintCalls = (window.__jxBarPrintCalls ?? 0) + 1;
    original?.call(window);
  };
});
await page.click('[data-jx-print-bar-print]');
await page.waitForFunction(
  () => (window.__jxBarPrintCalls ?? 0) >= 1,
  null,
  { timeout: 30000 },
);
const printMeta = await meta();
await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
await page.waitForTimeout(250);
const afterDirect = await page.evaluate(() => ({
  residue: {
    output: Boolean(document.querySelector('[data-print-output]')),
    pages: document.querySelectorAll('.pagedjs_page').length,
  },
  sim: document.querySelector('[data-print-source]')?.hasAttribute('data-jx-print-sim'),
  density: document.querySelector('[data-print-source]')?.getAttribute('data-density'),
  medium: document.querySelector('[data-jx-print-medium]')?.textContent,
}));
check(
  'stamp ownership: an existing sim survives a direct print (afterprint removes nothing, the artifact stays)',
  beforeDirect.pages >= 2 &&
    printMeta.createdStamp === false &&
    afterDirect.sim === true &&
    afterDirect.residue.output === true &&
    afterDirect.residue.pages >= 2 &&
    /sim/.test(afterDirect.medium ?? ''),
  JSON.stringify({ createdStamp: printMeta.createdStamp, afterDirect }),
);
// the r7 ZERO-REBUILD law: the bar's print exit reuses the mounted
// artifact — renderId (the monotonic rebuild counter) HOLDS, as do the
// pages and the @page hash. The pre-r7 behavior re-ran the whole
// prepareSnapshot + preview (a live animation's phase moved the
// snapshot hash, the overlay tore down and rebuilt page by page —
// the "collapses into chaos, then recovers" the Owner watched)
check(
  'same artifact (r7): the bar print reuses the mounted sim — renderId/pages/@page hash all hold, window.print called once',
  printMeta.renderId === simMeta.renderId &&
    printMeta.pages === simMeta.pages &&
    printMeta.stylesheetHash === simMeta.stylesheetHash,
  `sim(renderId=${simMeta.renderId}, pages=${simMeta.pages}) print(renderId=${printMeta.renderId}, pages=${printMeta.pages})`,
);

// ---- 2f. sim off → cleanup + rebound contexts ---------------------------
await page.click('[data-jx-print-bar-toggle]');
await page.waitForTimeout(300);
const afterSimOff = await page.evaluate(() => ({
  residue: {
    output: Boolean(document.querySelector('[data-print-output]')),
    pages: document.querySelectorAll('.pagedjs_page').length,
    insertedStyles: [...document.head.querySelectorAll('style[data-pagedjs-inserted-styles]')].length,
    active: document.documentElement.hasAttribute('data-jx-print-active'),
  },
  sim: document.querySelector('[data-print-source]')?.hasAttribute('data-jx-print-sim'),
  density: document.querySelector('[data-print-source]')?.getAttribute('data-density'),
  medium: document.querySelector('[data-jx-print-medium]')?.textContent,
  hue: document.documentElement.style.getPropertyValue('--brand-hue'),
  clockAtZero: (() => {
    const now = new Date();
    const secs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    return Math.round((secs / 86400) * 360) === 0;
  })(),
}));
check(
  'sim off: container + head styles + active stamp gone; density/medium rebound to raw',
  !afterSimOff.residue.output &&
    afterSimOff.residue.pages === 0 &&
    afterSimOff.residue.insertedStyles === 0 &&
    !afterSimOff.residue.active &&
    afterSimOff.sim === false &&
    afterSimOff.density !== 'sm' &&
    /screen/.test(afterSimOff.medium ?? ''),
  JSON.stringify(afterSimOff),
);
check(
  'hue: the closed gate re-derives the clock (the pin released with the medium)',
  afterSimOff.clockAtZero || afterSimOff.hue !== '0',
  afterSimOff.clockAtZero
    ? 'skipped — the wall clock itself sits at hue 0 (midnight window)'
    : `--brand-hue=${afterSimOff.hue}`,
);

// ---- 2g. screen → direct print: self-stamp + afterprint disposal --------
await page.click('[data-print-source] [data-jx-print-direct]');
const screenPrintMeta = await waitForMeta();
const standby = await page.evaluate(() => {
  const out = document.querySelector('[data-print-output]');
  const rect = out.getBoundingClientRect();
  return { standby: out.hasAttribute('data-print-standby'), left: rect.left, width: out.offsetWidth };
});
check(
  'direct print from screen: standby root is offscreen but MEASURABLE',
  screenPrintMeta.createdStamp === true && standby.standby && standby.left < 0 && standby.width > 0,
  JSON.stringify({ createdStamp: screenPrintMeta.createdStamp, standby }),
);
await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
await page.waitForTimeout(300);
const afterScreenPrint = await page.evaluate(() => ({
  output: Boolean(document.querySelector('[data-print-output]')),
  sim: document.querySelector('[data-print-source]')?.hasAttribute('data-jx-print-sim'),
  density: document.querySelector('[data-print-source]')?.getAttribute('data-density'),
  active: document.documentElement.hasAttribute('data-jx-print-active'),
}));
check(
  'direct print exit: afterprint removes the self-stamp and disposes the artifact (medium → screen)',
  !afterScreenPrint.output && !afterScreenPrint.sim && !afterScreenPrint.active && afterScreenPrint.density !== 'sm',
  JSON.stringify(afterScreenPrint),
);

// ---- 2h. measurability failure → fail loud, retry clean ------------------
const hideTag = await page.addStyleTag({ content: '[data-print-output] { display: none !important; }' });
await page.click('[data-print-source] [data-jx-print-sim-toggle]');
await page.waitForFunction(() => {
  const status = document.querySelector('[data-jx-print-status]')?.textContent ?? '';
  return status.includes('error');
}, null, { timeout: 30000 });
const failureState = await page.evaluate(() => ({
  status: document.querySelector('[data-jx-print-status]')?.textContent,
  output: Boolean(document.querySelector('[data-print-output]')),
  pages: document.querySelectorAll('.pagedjs_pages').length,
  simStamp: document.querySelector('[data-print-source]')?.hasAttribute('data-jx-print-sim'),
}));
check(
  'measurability: a display:none output root fails loud (no zero-size pages, no residue)',
  /not measurable/.test(failureState.status ?? '') && !failureState.output && failureState.pages === 0,
  JSON.stringify(failureState),
);
// the controls' failure path unstamps; lift the hostile style and retry
await hideTag.evaluate((el) => el.remove());
await page.evaluate(() => document.querySelector('[data-print-source]')?.removeAttribute('data-jx-print-sim'));
await page.click('[data-print-source] [data-jx-print-sim-toggle]');
const retryMeta = await waitForMeta();
check('failure retry: the second sim succeeds (no residue carried over)', (retryMeta.pages ?? 0) >= 2, `pages=${retryMeta.pages}`);

// ---- 2i. post-preview cancellation leaves no residue ---------------------
await page.evaluate(() => {
  document.dispatchEvent(new CustomEvent('jx-print-cancel'));
});
await page.waitForTimeout(400);
const afterCancel = await residue();
check(
  'cancel (post-preview): output root + artifact handle removed, nothing orphaned',
  !afterCancel.output && afterCancel.pages === 0 && afterCancel.insertedStyles === 0 && !afterCancel.active,
  JSON.stringify(afterCancel),
);
// the controls still hold their open state — one click syncs them off
// (the off path unstamps + closeSim, both no-ops after the cancel)
await page.click('[data-print-source] [data-jx-print-sim-toggle]');
await page.waitForTimeout(150);

// ---- 2j. consecutive sims + real-print emulation -------------------------
await page.click('[data-print-source] [data-jx-print-sim-toggle]');
const secondSim = await waitForMeta();
const secondPages = await page.evaluate(() => document.querySelectorAll('[data-print-output] .pagedjs_page').length);
check(
  'consecutive sims: the second run renders fresh pages (no stale .pagedjs_pages)',
  secondSim.pages === secondPages && secondPages >= 2,
  `meta=${secondSim.pages} dom=${secondPages}`,
);

// real print emulation: app root hides, page container stays visible
await page.emulateMedia({ media: 'print' });
await page.waitForTimeout(300);
const printPose = await page.evaluate(() => {
  const shell = document.querySelector('.jx-shell-host');
  const out = document.querySelector('[data-print-output]');
  return {
    shell: shell ? getComputedStyle(shell).display : 'missing',
    out: out ? getComputedStyle(out).display : 'missing',
    outPosition: out ? getComputedStyle(out).position : 'missing',
    pagesVisible: document.querySelectorAll('.pagedjs_page').length,
  };
});
check(
  'real print pose: app root display:none, the paged container flows as the print authority',
  printPose.shell === 'none' && printPose.out !== 'none' && printPose.out !== 'missing' && printPose.pagesVisible >= 2,
  JSON.stringify(printPose),
);
await page.emulateMedia({ media: null });
await page.waitForTimeout(200);

// exit and final residue sweep
await page.click('[data-jx-print-bar-toggle]');
await page.waitForTimeout(300);
const finalResidue = await residue();
const finalStamps = await page.evaluate(() => ({
  sim: document.querySelector('[data-print-source]')?.hasAttribute('data-jx-print-sim'),
  density: document.querySelector('[data-print-source]')?.getAttribute('data-density'),
}));
check(
  'final residue: the three exit scenarios leave nothing behind',
  !finalResidue.output &&
    finalResidue.pages === 0 &&
    finalResidue.insertedStyles === 0 &&
    !finalResidue.active &&
    finalStamps.sim === false &&
    finalStamps.density !== 'sm',
  JSON.stringify({ finalResidue, finalStamps }),
);

// ---- the AMBIENT PRINT ENTRY (Owner directive, 2026-09-01): a print
// the BROWSER initiates (Ctrl/Cmd+P, the menu) auto-initializes the
// pipeline. The events stand in for the dialog: beforeprint opens it,
// afterprint closes it. From a COLD screen (no sim, no prior flight)
// — the pipeline's own listener runs first (registered at creation),
// a test listener behind it reads the pose INSIDE the same dispatch:
// the synchronous half is the law (the dialog can never print the raw
// screen), the async half mounts the pages with the layer's grammar
const ambientPose = await page.evaluate(() => {
  let activeAtDispatch = false;
  window.addEventListener(
    'beforeprint',
    () => {
      activeAtDispatch = document.documentElement.hasAttribute('data-jx-print-active');
    },
    { once: true },
  );
  // a counting stub: the ambient flight must NEVER call window.print
  // (the dialog is already open — a second call would stack another)
  window.__jxAmbientPrintCalls = 0;
  const original = window.print;
  window.print = () => {
    window.__jxAmbientPrintCalls = (window.__jxAmbientPrintCalls ?? 0) + 1;
    original?.call(window);
  };
  window.dispatchEvent(new Event('beforeprint'));
  return activeAtDispatch;
});
const ambientMeta = await waitForMeta();
await page.waitForTimeout(250);
const ambient = await page.evaluate(() => {
  const out = document.querySelector('[data-print-output]');
  const source = document.querySelector('[data-print-source]');
  const margin = out ? out.querySelector('.pagedjs_margin-bottom-center .pagedjs_margin-content') : null;
  return {
    pages: out ? out.querySelectorAll('.pagedjs_page').length : 0,
    standby: out?.hasAttribute('data-print-standby') ?? false,
    selfStamped: source?.hasAttribute('data-jx-print-sim') ?? false,
    // the layer's grammar (docs default r5: the centered folio pair
    // "X / Y") — a cold ambient print must never fall back to a bare
    // default page setup
    grammar: margin
      ? /counter\(page\)/.test(getComputedStyle(margin, ':after').content) &&
        /counter\(pages\)/.test(getComputedStyle(margin, ':after').content)
      : false,
    printCalls: window.__jxAmbientPrintCalls ?? -1,
    metaPurpose: JSON.parse(out?.dataset.jxPrintMeta ?? '{}').purpose,
  };
});
check(
  'ambient print: beforeprint auto-initializes — the pose is synchronous, the pages mount with the layer grammar, window.print is never called',
  ambientPose === true &&
    ambient.pages >= 2 &&
    ambient.standby &&
    ambient.selfStamped &&
    ambient.grammar &&
    ambient.printCalls === 0 &&
    ambient.metaPurpose === 'print',
  JSON.stringify({ ambientPose, ambient }),
);
await page.evaluate(() => {
  window.dispatchEvent(new Event('afterprint'));
});
await page.waitForTimeout(300);
const ambientResidue = await residue();
check(
  'ambient print: afterprint owns the exit — zero residue, the stamp released',
  ambientResidue.output === false &&
    ambientResidue.pages === 0 &&
    ambientResidue.insertedStyles === 0 &&
    ambientResidue.active === false &&
    (await page.evaluate(() => document.querySelector('[data-print-source]')?.hasAttribute('data-jx-print-sim') === false)),
  JSON.stringify(ambientResidue),
);

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
