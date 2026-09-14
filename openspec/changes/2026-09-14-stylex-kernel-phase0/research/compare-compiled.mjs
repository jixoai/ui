#!/usr/bin/env node
// compare-compiled.mjs v2 — the P0.6 corpus-dogfood equivalence comparator
// (gate-1-r3 blocker A1: v1 had a real regex bug — (\d)+ captured only
// the LAST digit, making 12px ≡ 2px — and N2 erased content VALUES,
// making "a" ≡ "b". Both fixed; self-test.mjs pins every normalization
// with positive AND negative pairs.)
//
// Usage: node compare-compiled.mjs <a.(css|json)> <b.(css|json)> [--strict-selectors] [--raw-out <path>]
//   --strict-selectors : match rules by selector TEXT (name-sensitive);
//                        default is N5 structural matching by decl-signature
//                        (class hashes are path-dependent — the L3c finding)
// Exit 0 = equivalent after normalization; 1 = different; 2 = usage.
//
// Normalizations:
//   N1 number formats   0.5rem ≡ .5rem ≡ 0.50rem; 12px ≡ 12.0px; NOT 12px≡2px
//   N2 pseudo content   quote-style insensitive ('a' ≡ "a"); value-sensitive ("a" ≢ "b")
//   N3 steps() timing   steps(1,end) ≡ steps(1) ≡ steps(1,jump-end); (2,start) ≢ (2)
//   N4 rule-set order   decls sorted; rules compared set-wise
//   N5 selector names   cross-context structural matching (default mode)
import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const strictSelectors = args.includes('--strict-selectors');
const rawOutIdx = args.indexOf('--raw-out');
const rawOut = rawOutIdx >= 0 ? args[rawOutIdx + 1] : null;
const paths = args.filter((x, i) => x !== '--strict-selectors' && x !== '--raw-out' && args[i - 1] !== '--raw-out');
if (paths.length !== 2) {
  console.error('usage: node compare-compiled.mjs <a.(css|json)> <b.(css|json)> [--strict-selectors] [--raw-out path]');
  process.exit(2);
}
const [aPath, bPath] = paths;

// N1: canonicalize every NUMBER (with unit or bare) — multi-digit safe.
const num = (s) => s.replace(/(\d*\.?\d+)([a-z%]*)/gi, (whole, numPart, unit) => {
  let [i, f = ''] = numPart.split('.');
  i = i.replace(/^0+(?=\d)/, '');           // 012 -> 12 (lone 0 kept)
  f = f.replace(/0+$/, '');                  // 0.50 -> 0.5
  const canon = f ? `${i || '0'}.${f}` : `${i || '0'}`;
  return `${canon}${unit.toLowerCase()}`;
});

// N2: normalize QUOTING only; the VALUE stays.
const content = (s) => s.replace(/content\s*:\s*(["'])((?:\\.|(?!\1).)*)\1/gi, (_m, _q, val) => {
  const unescaped = val.replace(/\\(['"])/g, '$1');
  return `content:"${unescaped}"`;
});

// N3: steps() end-jump synonyms collapse; other positions preserved.
const steps = (s) => s.replace(/steps\(\s*(\d+)\s*,\s*(?:end|jump-end)\s*\)/gi, 'steps($1)');
const norm = (s) => steps(content(num(s))).replace(/\s+/g, ' ').replace(/\s*([;:{},])\s*/g, '$1').trim().toLowerCase();

function parseCss(text) {
  const map = new Map();
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(text))) {
    const sel = norm(m[1]);
    const decls = norm(m[2]).split(';').filter(Boolean).map((d) => d.trim()).sort();
    map.set(sel, [...(map.get(sel) || []), ...decls].sort());
  }
  return map;
}
function parseJson(text) {
  const map = new Map();
  const walk = (obj) => {
    for (const [k, v] of Object.entries(obj || {})) {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const decls = Object.entries(v)
          .filter(([, x]) => typeof x === 'string')
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

const verdict = diffs.length ? 'DIFFERENT' : 'EQUIVALENT';
const report = `compare-compiled: ${verdict} (${a.size} vs ${b.size} selectors, normalizations N1-N${strictSelectors ? 4 : 5} applied)\n` +
  diffs.slice(0, 20).map((d) => `  ✗ ${d.selector}\n    a: ${d.a}\n    b: ${d.b}`).join('\n');
if (rawOut) writeFileSync(rawOut, JSON.stringify({ a: aPath, b: bPath, equivalent: diffs.length === 0, diffs }, null, 2));
console.log(report);
process.exit(diffs.length ? 1 : 0);
