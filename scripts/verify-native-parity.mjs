#!/usr/bin/env node
// verify-native-parity — the two-renderer structural + computed-style gate
// (native-contract-fusion Phase 6, 2026-08-27; DOM-AST phase 2026-08-28).
//
// The native vocabulary is one law with two renderers: tier0 (bare
// DOM painted by the jx-pure law) and tier1 (the registry
// component). This gate renders both sides of each fixture row on
// /parity.html and, per vocabulary row, FIRST asserts DOM-AST
// isomorphism (element tags, attribute sets minus caller-specific
// values, child order, cardinality — design §11.2's schema twin,
// fail-fast), THEN compares computed styles over each row's
// property whitelist across the state matrix. A one-sided law
// change fails here — the "gate-locked" half of the management
// design.
//
// Usage (site must be running, e.g. `npm run site` on :5199):
//   node scripts/verify-native-parity.mjs            # default :5199
//   node scripts/verify-native-parity.mjs 5200
import { chromium } from 'playwright-core';

const port = process.argv[2] ?? '5199';

// ── the probe registry: one entry per vocabulary row ────────────────
// probe: [tier0Selector, tier1Selector] — tier0 relative to its
// [data-renderer=tier0] root, tier1 relative to the row section.
// states are declarative actions applied by name inside the page
// (functions cannot cross the evaluate boundary):
//   { name, click?: relativeSelector } — clicks that selector under
//   BOTH renderer roots (`.click` is relative to each root).
const ROWS = [
  {
    row: 'input',
    probes: [
      // Part A's single-box posture ⇄ the component's shell (box owner)
      ['input[data-probe="box"]', '[data-renderer=tier1] .jx-control-shell'],
    ],
    // posture-agnostic box props only: the single-box posture carries
    // padding on the control itself, the shell posture on its lane —
    // padding and display are STRUCTURE, not box law, across postures
    properties: [
      'min-height', 'border-top-width', 'border-top-color',
      'background-color', 'border-radius',
    ],
    states: [{ name: 'base' }, { name: 'focused', focus: 'input, input' }],
  },
  {
    row: 'textarea',
    probes: [
      // B4's bare textarea ⇄ the component's shell (the box owner)
      ['textarea[data-probe="box"]', '[data-renderer=tier1] .jx-control-shell'],
    ],
    // min-height excluded: the bare posture owns a 5rem lane, the
    // shell posture sizes from rows — box PAINT is the shared law
    properties: [
      'border-top-width', 'border-top-color',
      'background-color', 'border-radius',
    ],
    states: [{ name: 'base' }],
  },
  {
    row: 'checkbox',
    probes: [
      // the checked glyph box
      ['input[data-probe="check"]', '[data-renderer=tier1] input[type="checkbox"]:checked'],
      // the off box
      ['input[data-probe="check-off"]', '[data-renderer=tier1] input[type="checkbox"]:not(:checked)'],
    ],
    properties: [
      'appearance', 'width', 'height', 'border-top-width', 'border-top-color',
      'border-radius', 'background-color', 'margin-top', 'cursor',
      'transition-duration',
    ],
    states: [{ name: 'base' }],
  },
  {
    row: 'radio',
    probes: [
      ['input[data-probe="dot"]', '[data-renderer=tier1] input[type="radio"]:checked'],
      ['input[data-probe="dot-off"]', '[data-renderer=tier1] input[type="radio"]:not(:checked)'],
    ],
    properties: [
      'appearance', 'width', 'height', 'border-top-width', 'border-top-color',
      'border-radius', 'background-color', 'margin-top', 'cursor',
      'transition-duration',
    ],
    states: [{ name: 'base' }],
  },
  {
    row: 'toggle',
    probes: [
      // V2 ISOMORPHISM: the switch is ONE input on BOTH sides —
      // the same element, the same utility, the same pseudo carrier
      ['input[data-probe="switch"]', '[data-renderer=tier1] input[role=switch]'],
      ['input[data-probe="switch"]::before', '[data-renderer=tier1] input[role=switch]::before', [
        'position', 'inset-block-start', 'inset-inline-start',
        'transform', 'width', 'height', 'border-radius',
        'background-color', 'transition-duration',
      ]],
    ],
    properties: [
      'width', 'height', 'border-radius', 'background-color',
      'box-shadow', 'transition-duration',
    ],
    states: [{ name: 'base' }],
  },
  {
    row: 'toggle-group',    probes: [
      // the segment face (label) — geometry + voice + joined edge
      ['label:nth-child(1)', '[data-renderer=tier1] label:nth-of-type(1)'],
      // the second segment (becomes the active one in the checked state)
      ['label:nth-child(2)', '[data-renderer=tier1] label:nth-of-type(2)'],
      // the disabled segment
      ['label:nth-child(3)', '[data-renderer=tier1] label:nth-of-type(3)'],
      // the container shell
      ['.jx-html-tgroup', '[data-renderer=tier1] .jx-html-tgroup'],
    ],
    properties: [
      'display', 'min-height', 'padding-top', 'padding-inline-start',
      'font-size', 'line-height', 'font-family', 'letter-spacing',
      'text-transform', 'color', 'background-color', 'border-top-width',
      'border-right-width', 'border-top-color', 'cursor', 'opacity',
      'box-shadow',
    ],
    states: [
      { name: 'base' },
      { name: 'second-checked', click: 'label:nth-of-type(2) input, label:nth-child(2) input' },
    ],
  },
  {
    row: 'native-select',
    probes: [
      // the closed control (B4 select box law ⇄ the .jx-select mirror)
      ['select[data-probe]', '[data-renderer=tier1] select'],
    ],
    properties: [
      'appearance', '-webkit-appearance', 'min-height', 'padding-block-start',
      'padding-inline-start', 'padding-inline-end', 'border-top-width',
      'border-top-color', 'background-color', 'color', 'font-size',
      'line-height', 'cursor', 'box-shadow', 'opacity',
    ],
    states: [
      { name: 'base' },
      { name: 'focused', focus: 'select' },
    ],
  },
];

// ── the DOM-AST schema — design §11.2's twin in code ────────────────
// Per vocabulary row, the LAW SUBTREE both renderers are parsed from
// (t0 relative to the [data-renderer=tier0] root, t1 relative to the
// row section — same convention as the probe registry). Postures are
// DISTINCT FIXTURES (§11.2): rows whose tier1 rides the shell posture
// (input/textarea) or a structural group (checkbox/radio lane spans)
// anchor at the NATIVE CONTROL the vocabulary law keys on;
// toggle-group anchors at the segment container (the subtree law).
// `multi` pairs every law element in document order — the fixture's
// law-element cardinality is itself an assertion.
const AST_SPEC = {
  'toggle-group': { t0: '.jx-html-tgroup', t1: '[data-renderer=tier1] .jx-html-tgroup' },
  // §11.2: the switch is ONE input on both sides; its visible label
  // renders OUTSIDE as a sibling <label for> — sanctioned, hence the
  // input anchor, not the renderer root
  toggle: { t0: 'input[role=switch]', t1: '[data-renderer=tier1] input[role=switch]' },
  checkbox: { t0: 'input[type=checkbox]', t1: '[data-renderer=tier1] input.jx-html-checkbox', multi: true },
  radio: { t0: 'input[type=radio]', t1: '[data-renderer=tier1] input.jx-html-radio', multi: true },
  'native-select': { t0: 'select', t1: '[data-renderer=tier1] select' },
  input: { t0: 'input', t1: '[data-renderer=tier1] input' },
  textarea: { t0: 'textarea', t1: '[data-renderer=tier1] textarea' },
};

// KNOWN tier1-only consumption classes OUTSIDE the standard layer —
// tracked debt of the register fusion (each standardizes onto the
// jx-html-* vocabulary or retires; DELETE entries as they migrate, at
// which point the strict scoped-class comparison enforces itself).
// Anything not jx-html-* and not listed here still FAILS the gate.
const AST_LEGACY_CARRIERS = [
  'jx-control', 'jx-control-lane', // Part A postures → jx-html-control/-lane
  'jx-textarea', // → jx-html-textarea
  'jx-tgroup-item', 'jx-tgroup-content', // retire (§11.2: bare label/span)
  'scheme-light', 'dark:scheme-dark', // the select's color-scheme pair
];

const NORMALIZERS = [
  (v) => String(v).trim(),
  (v) => (/^rgba?\(0, 0, 0, 0\)$/.test(String(v).trim()) ? 'transparent' : v),
];
const normalize = (v) => NORMALIZERS.reduce((acc, fn) => fn(acc), v);

// color tolerance: browsers may resolve the same token through
// slightly different interpolation paths (measured: oklab component
// deltas ≤0.003 on identical declarations — sub-visual, ~1/255 per
// channel). Parse color triples and compare with a small tolerance;
// anything else stays exact.
const COLOR_RX = /^(oklab|oklch|lab|lch|rgb|rgba)\(([^)]+)\)$/;
const nearColor = (a, b) => {
  const ma = COLOR_RX.exec(a);
  const mb = COLOR_RX.exec(b);
  if (!ma || !mb || ma[1] !== mb[1]) return false;
  const pa = ma[2].split(/[\s,/]+/).filter((x) => x !== '').map(Number);
  const pb = mb[2].split(/[\s,/]+/).filter((x) => x !== '').map(Number);
  if (pa.length !== pb.length) return false;
  return pa.every((x, i) => Math.abs(x - pb[i]) <= 0.011);
};
const equal = (prop, a, b) => (a === b || nearColor(a, b));

// ── the EXPECTED matrix ────────────────────────────────────────────
// The spec's acceptance shape, declared machine-readably and VALIDATED
// against the fixture before any comparison runs (a missing combination
// fails the gate — no silent under-coverage). `range` is EXCLUDED by
// the design §4 scope ruling (custom pointer-driven slider, not a
// native wrapper).
const EXPECTED = {
  rows: ['toggle-group', 'native-select', 'input', 'textarea', 'checkbox', 'radio', 'toggle'],
  variants: {
    checkbox: ['@xs', '@dark'],
    'native-select': ['@lg'],
  },
  states: ['base'],
  extraStates: {
    'toggle-group': ['second-checked'],
    'native-select': ['focused'],
    input: ['focused'],
  },
  excluded: ['range (design §4: custom slider, not a native wrapper)'],
};

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-proxy-server'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(`http://localhost:${port}/parity.html`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(300);
// hydration readiness: the bind:group radios flip checked at mount —
// a fixed wait raced them (intermittent element-missing flakes)
await page
  .waitForFunction(
    () => document.querySelector('[data-parity="radio"] [data-renderer=tier1] input[type="radio"]')?.checked === true,
    { timeout: 5000 },
  )
  .catch(() => {});
// freeze motion: mid-transition sampling made color comparisons
// non-deterministic (the same declaration sampled at different points
// of the same 150-200ms curve run-to-run). The end state is the law.
await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await page.waitForTimeout(50);

let failures = 0;

// completeness: every declared row/variant section must exist on the
// fixture — under-coverage fails the gate instead of silently passing
{
  const present = await page.evaluate(() => ({
    sections: [...document.querySelectorAll('[data-parity]')].map((s) => s.dataset.parity),
    sectionMarkers: Object.fromEntries(
      [...document.querySelectorAll('[data-parity]')].map((s) => [
        s.dataset.parity,
        {
          density: s.querySelector('[data-renderer=tier0]')?.dataset.density ?? null,
          dark: s.classList.contains('dark'),
        },
      ]),
    ),
  }));
  const have = new Set(present.sections);
  const markers = present.sectionMarkers;
  const missing = [];
  const malformed = [];
  for (const row of EXPECTED.rows) {
    if (!have.has(row)) missing.push(row);
    for (const v of EXPECTED.variants[row] ?? []) {
      const id = row + v;
      if (!have.has(id)) { missing.push(id); continue; }
      // the variant's section must carry its environment marker
      if (v === '@xs' || v === '@lg') {
        if (markers[id]?.density !== v.slice(1)) malformed.push(`${id}: tier0 data-density=${markers[id]?.density} ≠ ${v.slice(1)}`);
      } else if (v === '@dark') {
        if (!markers[id]?.dark) malformed.push(`${id}: section missing the .dark class`);
      }
    }
    // every declared state must be an action the row's spec RUNS
    const spec = ROWS.find((r) => r.row === row);
    const runs = new Set(spec.states.map((s) => s.name));
    for (const s of [EXPECTED.states, EXPECTED.extraStates[row] ?? []].flat()) {
      if (!runs.has(s)) malformed.push(`${row}: declared state "${s}" has no action in the row spec`);
    }
    // every declared row must also carry a DOM-AST anchor — the
    // isomorphism phase may not silently skip a row
    if (!AST_SPEC[row]) malformed.push(`${row}: no DOM-AST anchor in AST_SPEC`);
  }
  if (missing.length || malformed.length) {
    console.error(`✗ [matrix] incomplete: ${[...missing.map((m) => `missing ${m}`), ...malformed].join('; ')}`);
    process.exit(1);
  }
  const stateCount = EXPECTED.rows.reduce((n, row) => n + (EXPECTED.extraStates[row]?.length ?? 0), EXPECTED.rows.length);
  console.log(
    `[matrix] ${have.size} sections / ${stateCount} state actions validated against the declared matrix (excluded: ${EXPECTED.excluded.join('; ')})`,
  );
}

// states are ISOLATED: every non-base state re-loads the fixture so no
// click/focus leaks into a later probe's base (the r1 false-green)
async function runComparisons(activeRow, activeState) {
  const rows = ROWS.map((r) => (r.row === activeRow ? { ...r, states: r.states.filter((s) => s.name === activeState) } : { ...r, states: [] }));
  return await page.evaluate(
    ({ rows, ast, legacy }) => {
    // ── the DOM-AST comparators (design §11.2's gate rule) ──────────
    const legacyClasses = new Set(legacy);
    // the class attribute is compared SCOPED: standard-layer classes
    // (jx-html-*) are the consumption mechanism, not divergence;
    // AST_LEGACY_CARRIERS are the named, tracked pre-fusion residue
    const scopeClass = (v) =>
      v.split(/\s+/).filter((c) => c && !c.startsWith('jx-html') && !legacyClasses.has(c)).sort().join(' ');
    // caller-specific attributes are EXCLUDED per §11.2 (id/data-*/
    // name/value/style). checked/disabled/type are excluded as
    // ATTRIBUTES but compared as PROPERTIES below — hydration flips
    // state (bind:group) without touching the serialization.
    const excludedAttr = (n) =>
      n === 'id' || n === 'style' || n === 'name' || n === 'value' ||
      n.startsWith('data-') || n === 'checked' || n === 'disabled' || n === 'type';
    const parseAST = (root) => {
      const node = {
        tag: root.tagName,
        attrs: Object.fromEntries(
          [...root.attributes]
            .filter(a => !a.name.startsWith('jx-html'))
            .filter(a => !excludedAttr(a.name))
            .map(a => [a.name, a.name === 'class' ? scopeClass(a.value) : a.value])
            // a class attribute that scopes to nothing (absent on the
            // bare side, fully standard-layer on the registry side) is
            // comparison-neutral: drop the key so absent ≡ scoped-empty
            .filter(([k, v]) => k !== 'class' || v !== ''),
        ),
        children: [...root.children].map(parseAST),
      };
      // form-control STATE from the live DOM (the law is the state,
      // not its serialization)
      if (root.tagName === 'INPUT') {
        node.attrs.type = root.type;
        node.attrs.checked = String(root.checked);
        node.attrs.disabled = String(root.disabled);
      } else if (root.tagName === 'TEXTAREA' || root.tagName === 'SELECT') {
        node.attrs.type = root.type;
        node.attrs.disabled = String(root.disabled);
      }
      return node;
    };
    const countAST = (n) => 1 + n.children.reduce((acc, c) => acc + countAST(c), 0);
    // deep equality with a descriptive first difference
    const diffAST = (a, b, path) => {
      if (a.tag !== b.tag) return `tier0 has <${a.tag.toLowerCase()}> where tier1 has <${b.tag.toLowerCase()}> at path ${path}`;
      const keys = [...new Set([...Object.keys(a.attrs), ...Object.keys(b.attrs)])].sort();
      for (const k of keys) {
        if (a.attrs[k] !== b.attrs[k]) {
          return `tier0 ${k}="${a.attrs[k] ?? '(absent)'}" where tier1 ${k}="${b.attrs[k] ?? '(absent)'}" at path ${path}`;
        }
      }
      if (a.children.length !== b.children.length) {
        return `tier0 has ${a.children.length} children where tier1 has ${b.children.length} at path ${path}`;
      }
      for (let i = 0; i < a.children.length; i++) {
        const d = diffAST(a.children[i], b.children[i], `${path}>${a.children[i].tag.toLowerCase()}`);
        if (d) return d;
      }
      return null;
    };

    const run = [];
    for (const spec of rows) {
      // matrix variants render the same spec under @xs/@dark sections
      const sections = [
        document.querySelector(`[data-parity="${spec.row}"]`),
        ...[...document.querySelectorAll(`[data-parity^="${spec.row}@"]`)],
      ].filter(Boolean);
      if (sections.length === 0) {
        run.push({ row: spec.row, error: 'fixture row missing' });
        continue;
      }
      for (const section of sections) {
        const variant = section.dataset.parity;
      const t0root = section.querySelector('[data-renderer=tier0]');
      const t1root = section.querySelector('[data-renderer=tier1]');

      // ── phase 1: DOM-AST isomorphism — BEFORE any computed read ──
      // (§11.2: tags, attribute sets minus caller-specific values,
      // child order, cardinality; a structural divergence skips the
      // section's paint probes — fail fast on structure)
      const anchor = ast[spec.row];
      let astFailed = false;
      if (anchor && spec.states.length > 0) {
        const label = `${anchor.t0} ⇄ ${anchor.t1}`;
        const e0s = [...t0root.querySelectorAll(anchor.t0)];
        const e1s = [...section.querySelectorAll(anchor.t1)];
        const cardinalityBad =
          e0s.length === 0 || e1s.length === 0 || e0s.length !== e1s.length ||
          (!anchor.multi && (e0s.length > 1 || e1s.length > 1));
        if (cardinalityBad) {
          run.push({ row: variant, ast: label, state: spec.states[0].name, error: `DOM isomorphism failure: law-element cardinality tier0=${e0s.length} tier1=${e1s.length}${anchor.multi ? '' : ' (anchor must be unique per renderer)'}` });
          astFailed = true;
        } else {
          const pairs = anchor.multi ? e0s.map((e, i) => [e, e1s[i]]) : [[e0s[0], e1s[0]]];
          for (const [e0, e1] of pairs) {
            const a0 = parseAST(e0);
            const d = diffAST(a0, parseAST(e1), 'root');
            if (d) {
              run.push({ row: variant, ast: label, state: spec.states[0].name, error: `DOM isomorphism failure: ${d}` });
              astFailed = true;
            } else {
              run.push({ row: variant, ast: label, state: spec.states[0].name, ok: true, nodes: countAST(a0) });
            }
          }
        }
      }
      if (astFailed) continue;

      for (const probe of spec.probes) {
        // a probe entry may be [sel0, sel1] or [sel0, sel1, props[]]
        // — a per-probe whitelist overrides the row's list (the knob
        // carrier asserts positioning longhands the track does not own)
        const probeProps = probe[2] ?? spec.properties;
        // a '::before' suffix probes the PSEUDO (the B13 knob carrier)
        const pseudo0 = probe[0].endsWith('::before') ? '::before' : null;
        const el0Sel = pseudo0 ? probe[0].slice(0, -8) : probe[0];
        const el0 = t0root.querySelector(el0Sel);
        // tier1 pseudo selectors also strip the suffix
        const pseudo1 = probe[1].endsWith('::before') ? '::before' : null;
        const t1Sel = pseudo1 ? probe[1].slice(0, -8) : probe[1];
        const t1el = section.querySelector(t1Sel);
        if (!el0 || !t1el) {
          run.push({ row: spec.row, probe: probe.join(' ⇄ '), error: `element missing (t0:${!!el0} t1:${!!t1el})` });
          continue;
        }
        const t0 = pseudo0 ? { pseudo: true, el: el0 } : el0;
        const t1 = pseudo1 ? { pseudo: true, el: t1el } : t1el;
        for (const state of spec.states) {
          let stateError = null;
          if (state.click) {
            // the click selector list is tried under each renderer root
            for (const root of [t0root, t1root]) {
              const alternatives = state.click.split(',').map((s) => s.trim());
              const target = alternatives.map((sel) => root.querySelector(sel)).find(Boolean);
              if (!target) {
                stateError = `click target missing under ${root.dataset.renderer}: ${state.click}`;
                break;
              }
              target.click();
            }
          }
          if (state.focus) {
            for (const root of [t0root, t1root]) {
              const target = root.querySelector(state.focus);
              if (!target) {
                stateError = `focus target missing under ${root.dataset.renderer}: ${state.focus}`;
                break;
              }
              target.focus();
            }
          }
          if (stateError) {
            run.push({ row: spec.row, probe: probe.join(' ⇄ '), state: state.name, error: stateError });
            continue;
          }
          const cs0 = pseudo0 ? getComputedStyle(el0, pseudo0) : getComputedStyle(el0);
          const cs1 = pseudo1 ? getComputedStyle(t1el, pseudo1) : getComputedStyle(t1el);
          for (const prop of probeProps) {
            run.push({
              row: variant,
              probe: probe.join(' ⇄ '),
              state: state.name,
              prop,
              v0: cs0.getPropertyValue(prop),
              v1: cs1.getPropertyValue(prop),
            });
          }
        }
      }
      }
    }
    return run;
  },
  { rows, ast: AST_SPEC, legacy: AST_LEGACY_CARRIERS },
  );
}
const comparisonsPerState = [];
for (const row of ROWS) {
  const states = row.states;
  for (const state of states) {
    if (state.name !== 'base') {
      // fresh page per non-base state — isolation by construction
      await page.goto(`http://localhost:${port}/parity.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);
      await page
        .waitForFunction(
          () => document.querySelector('[data-parity="radio"] [data-renderer=tier1] input[type="radio"]')?.checked === true,
          { timeout: 5000 },
        )
        .catch(() => {});
      // re-apply the motion freeze after every reload (mid-transition
      // color sampling is non-deterministic)
      await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
      await page.waitForTimeout(50);
    }
    comparisonsPerState.push(
      await runComparisons(row.row, state.name).catch((e) => {
        console.error(`✗ [gate] state run failed (${row.row}/${state.name}): ${e.message}`);
        process.exit(1);
      }),
    );
  }
}
const comparisons = comparisonsPerState.flat();

const pendingRows = new Set(ROWS.filter((r) => r.pending).map((r) => r.row));
for (const row of pendingRows) {
  console.log(`- ${row}: SKIPPED (pending ${ROWS.find((r) => r.row === row).pending})`);
}
for (const c of comparisons) {
  if (pendingRows.has(c.row)) continue;
  if (c.error) {
    failures++;
    console.error(`✗ ${c.row} ${c.ast ?? c.probe ?? ''} ${c.state ?? ''}: ${c.error}`);
    continue;
  }
  // AST-ok records are structural assertions — no prop/v0/v1 payload
  if (c.ast) continue;
  const a = normalize(c.v0);
  const b = normalize(c.v1);
  if (!equal(c.prop, a, b)) {
    failures++;
    console.error(`✗ ${c.row} ${c.probe} [${c.state}] ${c.prop}: tier0="${a}" tier1="${b}"`);
  }
}
const astTotal = comparisons.filter((c) => c.ast && !pendingRows.has(c.row)).length;
const astOk = comparisons.filter((c) => c.ast && c.ok && !pendingRows.has(c.row)).length;
const astNodes = comparisons.filter((c) => c.ast && c.ok && !pendingRows.has(c.row)).reduce((n, c) => n + c.nodes, 0);
const total = comparisons.filter((c) => !c.error && !c.ast && !pendingRows.has(c.row)).length;
if (astTotal > 0) {
  console.log(`[ast] ${astOk}/${astTotal} DOM-AST assertions isomorphic (${astNodes} nodes: tags, scoped attrs, child order, cardinality)`);
}
console.log(
  failures === 0
    ? `[native-parity] GREEN: ${ROWS.length} row(s), ${total} comparisons + ${astTotal} DOM-AST assertions equal across the state matrix`
    : `[native-parity] ${failures} failure(s) across ${total} comparisons + ${astTotal} DOM-AST assertions`,
);
// ── the screenshot oracle: same-page pixel comparison ────────────
// For rows whose implementations share the law's build (pseudo-glyph
// twins), the two renderer subtrees must render equal PIXELS. The
// comparator is the capture-baseline one (decode PNGs — Chrome's
// encoder drifts run-to-run while pixels don't; TOLERANT: channel
// delta ≤8, hot cells ≤0.5% — sub-pixel AA on glyph edges is a real
// browser phenomenon, not drift). native-select is excluded
// (gradient pseudo vs inline SVG chevron — different mechanisms; the
// computed phase covers its box law).
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';

const decodePng = (buf) => {
  if (buf.readUInt32BE(12) !== 0x49484452) throw new Error('not a png');
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  const bitDepth = buf[24];
  const colorType = buf[25];
  if (bitDepth !== 8 || colorType !== 2) throw new Error(`unsupported png ${bitDepth}/${colorType}`);
  const idat = [];
  let i = 8;
  while (i < buf.length) {
    const len = buf.readUInt32BE(i);
    const typ = buf.toString('ascii', i + 4, i + 8);
    if (typ === 'IDAT') idat.push(buf.subarray(i + 8, i + 8 + len));
    i += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * 3;
  const out = Buffer.alloc(h * stride);
  let prev = Buffer.alloc(stride);
  let pos = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[pos++];
    const line = Buffer.from(raw.subarray(pos, pos + stride));
    pos += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= 3 ? line[x - 3] : 0;
      const b = prev[x];
      const c = x >= 3 ? prev[x - 3] : 0;
      if (filter === 1) line[x] = (line[x] + a) & 255;
      else if (filter === 2) line[x] = (line[x] + b) & 255;
      else if (filter === 3) line[x] = (line[x] + ((a + b) >> 1)) & 255;
      else if (filter === 4) {
        const pp = a + b - c;
        const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        line[x] = (line[x] + pr) & 255;
      }
    }
    line.copy(out, y * stride);
    prev = line;
  }
  return { w, h, pixels: out };
};

const comparePixels = (bufA, bufB) => {
  const A = decodePng(bufA);
  const B = decodePng(bufB);
  if (A.w !== B.w || A.h !== B.h) return { same: false, why: `dimensions differ ${A.w}x${A.h} vs ${B.w}x${B.h}` };
  let hot = 0;
  for (let i = 0; i < A.pixels.length; i++) {
    if (Math.abs(A.pixels[i] - B.pixels[i]) > 8) hot += 1;
  }
  const ratio = hot / A.pixels.length;
  return { same: hot <= A.pixels.length * 0.005, why: `hot ${(ratio * 100).toFixed(3)}% of channels` };
};

const SHOT_ROWS = [
  // geometric rows only: text rows (toggle-group) accumulate subpixel
  // rounding across segments — dimension-exact fails honestly there;
  // the computed phase carries them. native-select excluded (chevron
  // mechanisms differ by design).
  ['checkbox', 0, true],
  ['radio', 0, true],
  // KNOWN GAP (2026-08-27): the toggle's knob CARRIERS differ — B13
  // rides a ::before with margin travel, the component a span with
  // transform; end-state math matches (2px + 16px travel) but the
  // raster diverges ~9% of the track box. warn-only until the knob
  // builds are unified; the computed phase still gates the law box.
  ['toggle', 0, false], // known: hue-phase rasterization artifact
];
const readHue = () =>
  page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim());

// the site's BRAND hue is wall-clock driven (lib/hue-runtime: a 5s
// entry spin after load, then a 1s-cadence cruising re-derive). Two
// SEQUENTIAL screenshots can land on different hues and diverge
// whole-box despite identical laws — wait out the entry spin, then
// retry the pair until the hue is stable across the capture window
// (the 1s cruising cadence leaves stable windows between ticks).
await page.waitForTimeout(5500);
async function stablePair(e0, e1) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const before = await readHue();
    const [b0, b1] = await Promise.all([e0.screenshot(), e1.screenshot()]);
    const after = await readHue();
    if (before === after) return [b0, b1];
  }
  throw new Error('hue not stable across capture attempts');
}

for (const [row, probeIdx, fatal] of SHOT_ROWS) {
  try {
    const spec = ROWS.find((r) => r.row === row);
    const [sel0, sel1] = spec.probes[probeIdx];
    const section = page.locator(`[data-parity="${row}"]`);
    const e0 = section.locator(`[data-renderer=tier0] ${sel0}`).first();
    const e1 = section.locator(sel1).first();
    const [b0, b1] = await stablePair(e0, e1);
    const res = comparePixels(b0, b1);
    if (res.same) {
      console.log(`✓ [shot] ${row}: pixels equal (${res.why})`);
    } else if (fatal) {
      failures++;
      console.error(`✗ [shot] ${row}: ${res.why}`);
    } else {
      console.warn(`⚠ [shot] ${row}: ${res.why} (known gap, warn-only)`);
    }
  } catch (e) {
    failures++;
    console.error(`✗ [shot] ${row}: capture failed — ${e.message}`);
  }
}

await browser.close();
process.exit(failures === 0 ? 0 : 1);
