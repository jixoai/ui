#!/usr/bin/env node
// extract-stylex.mjs — the P0.6 dogfood CSS extraction tool.
//
// The corpus equivalence check compares the stylex-emitted portion of
// the REAL www build against the research spike's archived compiled
// artifact (spike/corpus/dist/assets/*.css). Two facts shape this
// tool (both verified against the pinned engine 0.19.0 source,
// packages/vite-plugin/node_modules/@stylexjs/unplugin/lib/core.js):
//
//   1. useCSSLayers wraps the collected rules into @layer
//      stylex.priorityN blocks AT CSS-GENERATION TIME ONLY — the
//      babel atom output (rules, :not(#\#) bumps, canonical values)
//      is identical with or without layers. The real pipeline rides
//      the F9 layer law (design §1); the spike (pre-F9 lab) emitted
//      unlayered stylex output. Stripping ONLY the priority-layer
//      wrapper therefore loses no semantic information that F9 does
//      not already own: the layer ORDER itself is asserted separately
//      (byte-zero statement check below, receipt §F9).
//
//   2. StyleX plain-atom class names are content-derived (identical
//      declarations share one class across modules — the dedupe the
//      spike artifact itself shows), so a rule may be "owned" by a
//      module but byte-identical to a baseline module's rule. The
//      delta pass therefore subtracts the baseline rules EXCEPT those
//      whose text also appears in the spike artifact (corpus-shared
//      atoms that deduped into a baseline-owned rule must stay in the
//      delta, or the corpus comparison would phantom-miss them).
//
// Subcommands:
//   extract <css-file|dist-dir> <out.css>
//       - find the css asset carrying stylex output (a dir scans
//         **/*.css for one containing '@layer stylex.')
//       - ASSERT the F9 canonical statement sits at byte zero
//       - write the concatenated contents of every top-level
//         '@layer stylex.*' block, inner rules verbatim, file order
//   slice-spike <spike-css> <out.css>
//       - the spike artifact's stylex portion = from the first
//         '@property' at-rule to EOF (the unplugin APPENDS stylex
//         output after the app css; the spike's residue css + theme
//         sheet live ahead of it). Asserts the marker exists.
//   delta <baseline.css> <dogfood.css> <spike.css> <out.css>
//       - rule-level multiset delta: dogfood minus (baseline minus
//         spike-matching); whitespace-normalized text equality.
//
// Exit 0 on success; 1 on any assertion failure. No normalization
// beyond whitespace-collapse happens here — semantic normalization is
// the comparator's job (research/compare-compiled.mjs, of record).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../../..');

// the F9 law (Gate-2 P1-1: dynamic tiers nested under components) —
// read from the BUILT plugin dist so this tool never re-types it
const { canonicalLayerStatement, maxStylexPriority } = await import(
  pathToFileURL(join(repoRoot, 'packages/vite-plugin/dist/stylex/layer-law.js')).href
);

const die = (msg) => {
  console.error(`[extract-stylex] ${msg}`);
  process.exit(1);
};

const norm = (s) => s.replace(/\s+/g, ' ').trim();

/** split a css text into top-level units (prelude+block or blockless stmt), verbatim */
function topUnits(css) {
  const units = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    const semi = css.indexOf(';', i);
    if (open === -1 && semi === -1) break;
    if (semi !== -1 && (open === -1 || semi < open)) {
      const seg = css.slice(i, semi).trim();
      if (seg) units.push(seg + ';');
      i = semi + 1;
      continue;
    }
    let depth = 1;
    let j = open + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      if (depth === 0) break;
      j++;
    }
    units.push(css.slice(i, j + 1).trim());
    i = j + 1;
  }
  return units;
}

function findStylexCssAsset(dir) {
  const hits = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else if (name.endsWith('.css') && /@layer (?:components\.)?stylex\./.test(readFileSync(p, 'utf8'))) hits.push(p);
    }
  };
  walk(dir);
  if (hits.length === 0) die(`no css asset carrying stylex output under ${dir}`);
  if (hits.length > 1) die(`multiple stylex-carrying css assets (${hits.join(', ')}) — the bake must land in ONE asset`);
  return hits[0];
}

const [cmd, a, b, c, outPath] = process.argv.slice(2);
if (cmd === 'extract') {
  const src = statSync(a).isDirectory() ? findStylexCssAsset(a) : a;
  const css = readFileSync(src, 'utf8');
  const statement = canonicalLayerStatement(maxStylexPriority(css));
  if (!css.startsWith(statement)) {
    die(`F9 FAIL: ${src} does not start with the canonical layer statement for its tiers (want: ${statement.slice(0, 90)}…; got: ${css.slice(0, 90)}…)`);
  }
  // The stylex surface = the plugin-appended TAIL: every top-level unit
  // from the FIRST stylex-owned unit to EOF (blockless priority mentions,
  // the priority layer blocks, the trailing '@layer utilities;' bookkeeping
  // re-mention, the bare @keyframes, and the bare defineVars :root rules —
  // the engine's grouping of bare pieces varies with the priority mix, so
  // the whole tail is the honest surface; site css never emits stylex.*
  // layers, and TW's own '@layer utilities {…}' is a CONTENT block that
  // can never match the blockless bookkeeping form).
  const units = topUnits(css);
  const firstStylex = units.findIndex((u) => /^@layer\s+(?:components\.)?stylex\./.test(u));
  if (firstStylex === -1) die(`no '@layer stylex.*' unit in ${src}`);
  const tail = units.slice(firstStylex);
  const out = [];
  let layers = 0;
  for (const unit of tail) {
    const one = norm(unit);
    if (/^@layer (?:components\.)?stylex\.[\w.]+;$/.test(one)) continue; // blockless priority mention
    if (one === '@layer utilities;') continue; // the engine's trailing bookkeeping re-mention
    const m = /^@layer ((?:components\.)?stylex\.[\w.]+) \{([\s\S]*)\}$/.exec(one);
    if (m) {
      layers++;
      // strip ONE indentation level (the unplugin nests with 2 spaces)
      out.push(m[2].replace(/\n  /g, '\n').replace(/^\n|\n$/g, ''));
      continue;
    }
    out.push(unit.replace(/\n  /g, '\n')); // bare @keyframes / vars / rules verbatim
  }
  if (out.length === 0) die(`no stylex rules extracted from ${src}`);
  const body = out.join('\n\n');
  writeFileSync(b, body + '\n');
  console.log(
    `[extract-stylex] ${src} → ${b}: F9 statement at byte 0 OK; tail from unit ${firstStylex}/${units.length}; ` +
      `${layers} priority layer blocks stripped; ${topUnits(body).length} rules, ${body.length} bytes`,
  );
} else if (cmd === 'slice-spike') {
  const css = readFileSync(a, 'utf8');
  const idx = css.indexOf('@property');
  if (idx === -1) die(`no '@property' marker (stylex output start) in ${a}`);
  const body = css.slice(idx).trim();
  writeFileSync(b, body + '\n');
  console.log(`[extract-stylex] spike slice ${a} → ${b}: from byte ${idx}, ${topUnits(body).length} rules, ${body.length} bytes`);
} else if (cmd === 'delta') {
  const [s0, s1, sp] = [a, b, c].map((p) => readFileSync(p, 'utf8'));
  // decl-signature: the sorted declaration text of a style rule (at-rule
  // wrappers and keyframes blocks carry no signature). Cross-side SELECTOR
  // text never matches — the spike rides the pre-F9 :not(#\#) specificity
  // bumps that layers mode replaces — but identical declarations through
  // the same pinned engine canonicalize identically.
  const declSig = (unit) => {
    const u = norm(unit);
    if (u.startsWith('@')) return null; // at-rule units (kf/vars blocks are handled by exact text)
    const open = u.indexOf('{');
    const close = u.lastIndexOf('}');
    if (open === -1 || close <= open) return null;
    return u
      .slice(open + 1, close)
      .split(';')
      .map((d) => norm(d))
      .filter(Boolean)
      .sort()
      .join(';');
  };
  const base = topUnits(s0).map(norm);
  const dog = topUnits(s1).map(norm);
  // corpus-shared = the comparator WOULD match this baseline rule against
  // a spike rule: same at-rule ancestry (flat here), same PSEUDO SUFFIX
  // (the selector minus its class tokens — ':checked' ≢ flat; the spike's
  // :not(#\#) bumps strip with the class tokens), and equal decls — raw or
  // typed-stripped (var(--jx-M) → var(--M), MEMBERS ONLY). The baseline
  // scene and the corpus atoms share typed decl text (content-derived
  // classes dedupe them into ONE rule); without this check the delta
  // would lose those rules and the corpus comparison would phantom-miss
  // them. Decl-only matching is TOO LOOSE: the scene's flat
  // background-color:var(--jx-primary) must NOT be kept by matching the
  // spike switch's :checked rule of the same value (found live).
  const TOKEN_MEMBERS = 'brand-hue|background|foreground|card|card-foreground|popover|popover-foreground|primary|primary-foreground|secondary|secondary-foreground|muted|muted-foreground|accent|accent-foreground|destructive|destructive-foreground|border|input|ring|terminal|terminal-foreground|terminal-hover|terminal-muted|success|success-foreground|warning|warning-foreground|info|info-foreground|error|error-foreground|chart-1|chart-2|chart-3|chart-4|chart-5|font-sans|font-mono|font-nav|radius|shadow-color|shadow-2xs|shadow-xs|shadow-sm|shadow|shadow-md|shadow-xs-press|shadow-sm-press|shadow-md-press|shadow-engrave|shadow-well|shadow-well-hover|shadow-paper|scrim|surface-shadow|scrollbar-track|scrollbar-thumb|scrollbar-thumb-hover|scrollbar-thumb-active';
  const MEMBER_VAR = new RegExp(`var\\(--jx-(${TOKEN_MEMBERS})\\b`, 'gi');
  const tStrip = (s) => s.replace(MEMBER_VAR, 'var(--$1');
  const pseudoOf = (unit) => {
    const open = unit.indexOf('{');
    const sel = norm(unit.slice(0, open));
    return sel
      .replace(/\.x[a-z0-9]+/gi, '') // class tokens (path-derived AND content-derived)
      .replace(/:not\(#\\#\)/gi, '') // the spike's treeshake-compensation bumps
      .replace(/[\s,]+/g, ' ')
      .trim();
  };
  const spikeCorpusSig = new Set();
  for (const u of topUnits(sp)) {
    const s = declSig(u);
    if (s) {
      const p = pseudoOf(u);
      spikeCorpusSig.add(`${p}|${s}`);
      spikeCorpusSig.add(`${p}|${tStrip(s)}`);
    }
  }
  const keepBase = []; // multiset of baseline rules that are NOT corpus-shared
  const corpusShared = [];
  for (const r of base) {
    const s = declSig(r);
    const p = s ? pseudoOf(r) : '';
    if (s && (spikeCorpusSig.has(`${p}|${s}`) || spikeCorpusSig.has(`${p}|${tStrip(s)}`))) corpusShared.push(r);
    else keepBase.push(r);
  }
  const remaining = new Map(); // text → count
  for (const r of keepBase) remaining.set(r, (remaining.get(r) ?? 0) + 1);
  const delta = [];
  for (const r of dog) {
    const n = remaining.get(r) ?? 0;
    if (n > 0) remaining.set(r, n - 1);
    else delta.push(r);
  }
  const leftover = [...remaining.entries()].filter(([, n]) => n > 0);
  if (leftover.length > 0) {
    die(
      `baseline rules MISSING from the dogfood build (regression!):\n  ` +
        leftover.map(([t]) => t.slice(0, 120)).join('\n  '),
    );
  }
  const pretty = topUnits(s1);
  const need = new Map(); // normalized text → how many pretty copies to pick
  for (const t of delta) need.set(t, (need.get(t) ?? 0) + 1);
  const picked = [];
  for (const u of pretty) {
    const n = norm(u);
    const left = need.get(n) ?? 0;
    if (left > 0) {
      need.set(n, left - 1);
      picked.push(u);
    }
  }
  writeFileSync(outPath, picked.join('\n\n') + '\n');
  console.log(
    `[extract-stylex] delta: baseline ${base.length} rules (${corpusShared.length} corpus-shared kept) − dogfood ` +
      `${dog.length} rules → delta ${delta.length} rules → ${outPath}`,
  );
} else {
  die(`usage: extract-stylex.mjs extract <css|dir> <out> | slice-spike <css> <out> | delta <base> <dog> <spike> <out>`);
}
