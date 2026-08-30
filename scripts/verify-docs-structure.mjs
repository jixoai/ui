#!/usr/bin/env node
// verify-docs-structure — the docs page skeleton lint (site-polish F10).
//
// Every /docs/components/<name>.html must keep the lintable skeleton:
//   - exactly ONE `Usage` H2, spelled `Usage` (the toc page's lowercase
//     `usage` section was the case-drift seed)
//   - a PLAYGROUND section whenever the page mounts a component canvas
//     (an interactive demo without its controls pane is a gutted page —
//     the dialog/sheet class of drift)
//   - no literal `undefined`/`null` text nodes (F4: an empty demo value
//     renders the em dash, never a JS literal)
//   - a page `<title>` that exists and is Title-Case (first glyph
//     uppercase — catches the `code-card · jixoai-ui` class of drift)
//   - NO real h1–h3 inside the canvas's demo-content scope: the
//     `data-doc-demo-content` wrapper ComponentCanvas renders around
//     consumer-authored demo markup. The wrapper — not the whole demo
//     region — is the lint target, so the canvas's OWN structural
//     chrome (its h2 title, the h3 Playground) stays exempt.
//
// Source of truth is the BUILT page (the SSR output is where component
// titles become real heading elements — SectionCard `title="…"` props
// are only resolvable after render). `apps/www/dist` is scanned when
// present; otherwise the pre-adapter `.svelte-kit/output/prerendered`
// pages are. With neither, the script fails with instructions — it
// never lints .svelte sources, which would need a component-semantics
// parser to be honest.
//
//   node scripts/verify-docs-structure.mjs            # lint the build
//   node scripts/verify-docs-structure.mjs --selftest # fixtures only
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---- pure lint core (the fixtures ride this) -------------------------------

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
const decode = (s) => s.replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m]);
const stripTags = (s) => decode(s.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();

/** heading texts {level, text} in document order; flags:
 *  - `chrome`: a component-owned structural title — the design system
 *    stamps every heading it owns with a `data-jx-*-title` marker
 *    (canvas-title, canvas-playground-title, dialog-title, sheet-title,
 *    result-title, adlg-title) — chrome like the canvas's own, exempt
 *    from the demo-scope rule
 *  - `demoData`: carries data-doc-demo-heading — the heading IS the demo's
 *    functional data (a component under test derives its outline from it),
 *    an explicit, greppable opt-out from the demo-scope rule */
export function headings(html) {
  const out = [];
  const re = /<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[2];
    out.push({
      level: Number(m[1]),
      text: stripTags(m[3]),
      chrome: /\bdata-jx-[a-z-]+-title\b/.test(attrs),
      demoData: /\bdata-doc-demo-heading\b/.test(attrs),
    });
  }
  return out;
}

/** the h1–h3 texts inside every data-doc-demo-content wrapper, minus the
 *  exemptions: component-owned titles (data-jx-*-title), functional demo
 *  data (data-doc-demo-heading), and whole subtrees the consumer marked
 *  `data-doc-demo-scope="headings-ok"` — for demos whose COMPONENT UNDER
 *  TEST exists to render headings (SectionCard itself) */
export function demoScopeHeadings(html) {
  const leaked = [];
  const openRe = /<div\b[^>]*\bdata-doc-demo-content\b[^>]*>/g;
  let open;
  while ((open = openRe.exec(html))) {
    // div-balance walk from the wrapper open to ITS closing tag
    const depthRe = /<div\b[^>]*>|<\/div>/g;
    depthRe.lastIndex = openRe.lastIndex;
    let depth = 1;
    let end = -1;
    let t;
    while ((t = depthRe.exec(html))) {
      depth += t[0].startsWith('</') ? -1 : 1;
      if (depth === 0) {
        end = depthRe.lastIndex;
        break;
      }
    }
    const scopeStart = openRe.lastIndex;
    const scope = end === -1 ? html.slice(scopeStart) : html.slice(scopeStart, end - 6);

    // collect the headings-ok subtree ranges inside this scope
    const okRanges = [];
    const okRe = /<div\b[^>]*\bdata-doc-demo-scope=["']?headings-ok["']?[^>]*>/g;
    let ok;
    while ((ok = okRe.exec(scope))) {
      const dRe = /<div\b[^>]*>|<\/div>/g;
      dRe.lastIndex = okRe.lastIndex;
      let d = 1;
      let okEnd = scope.length;
      let dt;
      while ((dt = dRe.exec(scope))) {
        d += dt[0].startsWith('</') ? -1 : 1;
        if (d === 0) {
          okEnd = dRe.lastIndex;
          break;
        }
      }
      okRanges.push([ok.index, okEnd]);
      okRe.lastIndex = ok.index + 1; // continue past this open tag
    }
    const inOkRange = (idx) => okRanges.some(([a, b]) => idx >= a && idx < b);

    const hRe = /<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;
    let h;
    while ((h = hRe.exec(scope))) {
      const level = Number(h[1]);
      const attrs = h[2];
      if (level > 3) continue;
      // component-owned titles and functional demo data are exempt
      if (/\bdata-jx-[a-z-]+-title\b/.test(attrs)) continue;
      if (/\bdata-doc-demo-heading\b/.test(attrs)) continue;
      if (inOkRange(h.index)) continue;
      leaked.push(stripTags(h[3]));
    }
  }
  return leaked;
}

/** @returns {string[]} failures, empty = page passes */
export function lintDocsPage(html, name = '(page)') {
  const failures = [];

  // title: present, suffixed, Title-Case, no JS literals
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  if (title === undefined || title.trim() === '') {
    failures.push('missing <title>');
  } else {
    const text = stripTags(title);
    if (!text.includes('jixoai-ui')) failures.push(`<title> "${text}" lacks the site suffix`);
    const display = text.split('·')[0].trim();
    if (display && !/^[A-Z0-9]/.test(display)) failures.push(`<title> "${display}" is not Title-Case`);
    if (/undefined|null/i.test(text)) failures.push(`<title> carries a JS literal: "${text}"`);
  }

  // exactly one Usage H2, exact spelling — page sections only: component
  // chrome and functional demo-data headings are not page sections
  const usage = headings(html).filter(
    (h) => h.level === 2 && !h.chrome && !h.demoData && h.text.toLowerCase() === 'usage',
  );
  if (usage.length === 0) failures.push('no `Usage` H2 section');
  if (usage.length > 1) failures.push(`${usage.length} \`Usage\` H2 sections (exactly one allowed)`);

  // interactive pages keep their PLAYGROUND pane
  if (html.includes('data-jx-canvas-stage') && !html.includes('data-jx-canvas-playground-title')) {
    failures.push('component canvas present but no PLAYGROUND section');
  }

  // no JS literal text nodes (F4)
  if (/>undefined</.test(html)) failures.push('renders a literal `undefined` text node');
  if (/>null</.test(html)) failures.push('renders a literal `null` text node');

  // demo copy is never a real heading (scoped to the wrapper)
  for (const text of demoScopeHeadings(html)) {
    failures.push(`demo content renders a real heading: h1-h3 "${text}" inside data-doc-demo-content`);
  }

  return failures.length ? failures.map((f) => `${name}: ${f}`) : [];
}

// ---- fixtures (spec: canvas chrome passes, wrapper heading fails) ----------

export function selftest() {
  const CHROME = `
    <h2 class="jx-canvas-title">toast</h2>
    <div data-jx-canvas-stage data-stage="fill" class="jx-canvas-stage">
      <div data-doc-demo-content="" class="contents">
        <p class="font-nav text-sm uppercase">Deployed</p>
        <button type="button">push</button>
      </div>
    </div>
    <h3 data-jx-canvas-playground-title class="jx-canvas-pane-title">Playground</h3>
    <h2>Usage</h2><p>…</p>`;
  const passPage = `<!doctype html><html><head><title>Toast · jixoai-ui</title></head><body>${CHROME}</body></html>`;
  const expect = (condition, message) => {
    if (!condition) {
      console.error(`  fixture FAILED: ${message}`);
      process.exitCode = 1;
    }
  };

  expect(lintDocsPage(passPage, 'chrome').length === 0, 'canvas chrome + clean demo must PASS');
  expect(
    lintDocsPage(
      passPage.replace('<button type="button">push</button>', '<h2 data-jx-dialog-title="="">Deploy queued</h2>'),
      'dlgtitle',
    ).length === 0,
    'the dialog family title heading inside the wrapper is component chrome — must PASS',
  );
  expect(
    lintDocsPage(
      passPage.replace('<button type="button">push</button>', '<h3 data-doc-demo-heading="="">section one</h3>'),
      'demodata',
    ).length === 0,
    'an explicit data-doc-demo-heading functional heading must PASS',
  );
  expect(
    lintDocsPage(passPage.replace('<p class="font-nav text-sm uppercase">Deployed</p>', '<h2>Deployed</h2>'), 'leak')
      .join(' ')
      .includes('demo content renders a real heading'),
    'consumer h2 inside the wrapper must FAIL',
  );
  expect(
    lintDocsPage(passPage.replace('</body>', '<h2>Usage</h2></body>'), 'dup').join(' ').includes('2 `Usage`'),
    'a second Usage section must FAIL',
  );
  expect(
    lintDocsPage(passPage.replace('<title>Toast', '<title>toast'), 'case').join(' ').includes('Title-Case'),
    'lowercase title must FAIL',
  );
  expect(
    lintDocsPage(passPage.replace('<button type="button">push</button>', '<code>undefined</code>'), 'lit')
      .join(' ')
      .includes('`undefined`'),
    'a literal undefined text node must FAIL',
  );
  expect(
    lintDocsPage(passPage.replace('data-jx-canvas-playground-title', 'data-x'), 'noplay').join(' ').includes('PLAYGROUND'),
    'canvas without Playground must FAIL',
  );
  console.error(process.exitCode ? '✗ docs-structure fixtures FAILED' : '✓ docs-structure fixtures pass');
  return process.exitCode ?? 0;
}

// ---- CLI --------------------------------------------------------------------

if (process.argv[1] && import.meta.url === new URL(`file://${resolve(process.argv[1])}`).href) {
  if (process.argv[2] === '--selftest') process.exit(selftest());

  const candidates = [
    resolve(root, 'apps/www/dist/docs/components'),
    resolve(root, 'apps/www/.svelte-kit/output/prerendered/pages/docs/components'),
  ];
  const pagesDir = candidates.find((dir) => existsSync(dir));
  if (!pagesDir) {
    console.error(
      '[verify-docs-structure] no built pages found — run the site build first (dist/ or .svelte-kit/output/prerendered)',
    );
    process.exit(1);
  }

  const pages = readdirSync(pagesDir).filter((f) => f.endsWith('.html'));
  const failures = [];
  for (const page of pages) {
    const html = readFileSync(resolve(pagesDir, page), 'utf8');
    failures.push(...lintDocsPage(html, page.replace(/\.html$/, '')));
  }
  console.log(`[verify-docs-structure] ${pages.length} docs pages linted from ${pagesDir}`);
  if (failures.length) {
    console.error(`[verify-docs-structure] FAILED — ${failures.length} problem(s):`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log('[verify-docs-structure] ✓ all docs pages pass the skeleton lint');
}
