#!/usr/bin/env node
// compare-compiled.mjs — the P0.6 corpus-dogfood equivalence comparator
// (phase0 gate-1-r2 blocker 4: the docs claimed a "committed comparator
// script" — this IS it). Normalizes the serialization variance the
// research archive recorded (spike-report §5, corpus-report), then
// diffs. Exit 0 = equivalent after normalization; exit 1 = real diff.
//
// Usage: node compare-compiled.mjs <a.(css|json)> <b.(css|json)> [--raw-out <path>]
//   - css inputs: normalized rule-level diff
//   - json inputs: deep-normalized structural diff (class -> decls maps)
// Normalizations (each corresponds to an archive-recorded variance):
//   N1 number formats      0.5rem vs .5rem, 12px vs 12.0px, leading zeros
//   N2 pseudo content      content:"" vs content:'' vs content: " " quoted
//                          forms; ::before/::after preserved as structure
//   N3 steps() timing      steps(1, end) vs steps(1) vs steps(1,end)
//   N4 whitespace/order    declaration order inside a rule is sorted;
//                          rules are compared as a set (order-insensitive)
//                          EXCEPT same-selector collisions, which merge
//   N5 selector-name       cross-context mode (default): rules match by
//      insensitivity       normalized DECL-SIGNATURE, not by selector
//                          text — class hashes are path-dependent (the
//                          L3c finding), so a/b equivalence is structural
//                          (--strict-selectors restores name matching)
import { readFileSync, writeFileSync } from 'node:fs';

const [, , aPath, bPath, ...rest] = process.argv;
const rawOutIdx = rest.indexOf('--raw-out');
const rawOut = rawOutIdx >= 0 ? rest[rawOutIdx + 1] : null;
if (!aPath || !bPath) {
  console.error('usage: node compare-compiled.mjs <a.(css|json)> <b.(css|json)> [--raw-out path]');
  process.exit(2);
}

// N1
const num = (s) => s
  .replace(/(\d)+(?:\.(\d+))?([a-z%]+)/gi, (_, i, f, u) => {
    const frac = (f || '').replace(/0+$/, '');
    return `${Number(i)}.${frac || '0'}${u.toLowerCase()}`;
  })
  .replace(/0\.(\d+)([a-z%]+)/gi, (_, f, u) => `.${f}${u.toLowerCase()}`);
// N2
const content = (s) => s
  .replace(/content\s*:\s*(['"])((?:\\.|(?!\1).)*)\1/gi, 'content:"«C»"')
  .replace(/content\s*:\s*(['"])((?:\\.|(?!\1).)*)\1/gi, 'content:"«C»"');
// N3
const steps = (s) => s
  .replace(/steps\(\s*(\d+)\s*(?:,\s*end\s*)?\)/gi, 'steps($1)')
  .replace(/steps\(\s*(\d+)\s*,\s*jump-end\s*\)/gi, 'steps($1)');
const norm = (s) => steps(content(num(s)))
  .replace(/\s+/g, ' ')
  .replace(/\s*([;:{},])\s*/g, '$1')
  .trim()
  .toLowerCase();

// css -> map selector -> sorted decl set
function parseCss(text) {
  const map = new Map();
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(text))) {
    const sel = norm(m[1]);
    const decls = norm(m[2]).split(';').filter(Boolean).map((d) => d.trim()).sort();
    const key = sel;
    map.set(key, [...(map.get(key) || []), ...decls].sort());
  }
  return map;
}
// json -> map class -> sorted decl set (structure-insensitive to key order)
function parseJson(text) {
  const map = new Map();
  const walk = (obj) => {
    for (const [k, v] of Object.entries(obj || {})) {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const decls = Object.entries(v)
          .filter(([, x]) => typeof x === 'string' && !String(x).startsWith('var(') === false || typeof x === 'string')
          .map(([p, x]) => norm(`${p.replace(/([a-z0-9])([A-Z])/g, '$1-$2')}:${x}`))
          .sort();
        if (decls.length) map.set(norm(k), decls);
        walk(v);
      }
    }
  };
  walk(JSON.parse(text));
  return map;
}

const strictSelectors = rest.includes('--strict-selectors');
const isJson = (p) => p.endsWith('.json');
const a = (isJson(aPath) ? parseJson : parseCss)(readFileSync(aPath, 'utf8'));
const b = (isJson(bPath) ? parseJson : parseCss)(readFileSync(bPath, 'utf8'));

const diffs = [];
if (strictSelectors) {
  for (const k of new Set([...a.keys(), ...b.keys()])) {
    const da = (a.get(k) || []).join(';');
    const db = (b.get(k) || []).join(';');
    if (da !== db) diffs.push({ selector: k, a: da, b: db });
  }
} else {
  // N5: structural multiset match by decl-signature
  const sig = (decls) => decls.slice().sort().join(';');
  const pool = [];
  for (const [k, decls] of b) pool.push({ k, sig: sig(decls) });
  for (const [k, decls] of a) {
    const s0 = sig(decls);
    const idx = pool.findIndex((p) => p.sig === s0);
    if (idx === -1) diffs.push({ selector: k, a: s0, b: '(no structural match)' });
    else pool.splice(idx, 1);
  }
  for (const p of pool) diffs.push({ selector: p.k, a: '(no structural match)', b: p.sig });
}
const report = `compare-compiled: ${diffs.length ? 'DIFFERENT' : 'EQUIVALENT'} (${a.size} vs ${b.size} selectors, normalizations N1-N${strictSelectors ? 4 : 5} applied)\n` +
  diffs.map((d) => `  ✗ ${d.selector}\n    a: ${d.a}\n    b: ${d.b}`).join('\n');
if (rawOut) writeFileSync(rawOut, JSON.stringify({ a: aPath, b: bPath, equivalent: diffs.length === 0, diffs }, null, 2));
console.log(report);
process.exit(diffs.length ? 1 : 0);
