#!/usr/bin/env node
// compare-compiled.mjs v3 — the P0.6 corpus-dogfood equivalence comparator
// (gate-1-r4 blocker A1: v2 ran N1 over selectors and WHOLE declaration
// strings, rewriting digits that must stay verbatim — quoted content
// ("012" ≡ "12"), numeric class names (.x01 ≡ .x1 even under
// --strict-selectors), and --custom-property names. v3 scopes every
// normalization to where it is lawful:)
//   - selectors: whitespace-only structural normalization (comma collapse)
//   - declarations: split at the first colon; the property name is never
//     number-normalized
//   - values: N1/N3 apply ONLY to unquoted spans, with --custom-property
//     references shielded; N2 canonicalizes quoting while preserving the
//     quoted VALUE verbatim
//
// Usage: node compare-compiled.mjs <a.(css|json)> <b.(css|json)> [--strict-selectors] [--raw-out <path>]
//   --strict-selectors : match rules by selector TEXT (name-sensitive);
//                        default is N5 structural matching by decl-signature
//                        (class hashes are path-dependent — the L3c finding)
//   flags may appear anywhere after the script name.
// Exit 0 = equivalent after normalization; 1 = different; 2 = usage.
//
// Normalizations:
//   N1 number formats   0.5rem ≡ .5rem ≡ 0.50rem; 12px ≡ 12.0px; NOT 12px≡2px
//                       (unquoted value tokens ONLY — never quoted content,
//                       never selectors, never --custom-property names)
//   N2 pseudo content   quote-style insensitive ('a' ≡ "a"); value-sensitive
//                       ("a" ≢ "b", "012" ≢ "12")
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

// N1 core: canonicalize a number token (multi-digit safe, lone 0 kept).
const numCore = (s) => s.replace(/(\d*\.?\d+)([a-z%]*)/gi, (_whole, numPart, unit) => {
  let [i, f = ''] = numPart.split('.');
  i = i.replace(/^0+(?=\d)/, '');           // 012 -> 12 (lone 0 kept)
  f = f.replace(/0+$/, '');                  // 0.50 -> 0.5
  const canon = f ? `${i || '0'}.${f}` : `${i || '0'}`;
  return `${canon}${unit.toLowerCase()}`;
});

// N1+N3 on an UNQUOTED span, with --custom-property references shielded
// (placeholder digits carry no leading zeros, so numCore passes them through).
const numSpan = (s) => {
  const shields = [];
  const shielded = s.replace(/--[a-z0-9_-]+/gi, (m) => `\u0000${shields.push(m) - 1}\u0000`);
  return numCore(shielded.replace(/steps\(\s*(\d+)\s*,\s*(?:end|jump-end)\s*\)/gi, 'steps($1)'))
    .replace(/\u0000(\d+)\u0000/g, (_m, i) => shields[+i]);
};

// Selector normalization: structural whitespace ONLY — names, digits, and
// case stay verbatim (no N1/N2/N3 may ever touch a selector).
const normSelector = (s) => s.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ',').trim();

// Value normalization: walk the quoted runs. Unquoted spans get whitespace/
// comma collapse + lowercase (CSS value keywords are case-insensitive) then
// N1/N3. Quoted runs get N2: canonical double quotes, quote-escapes
// resolved, the inner VALUE kept verbatim.
const normValue = (raw) => {
  let out = '';
  let last = 0;
  const re = /(["'])((?:\\.|(?!\1).)*)\1/g;
  const plain = (s) => s.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ',').toLowerCase();
  let m;
  while ((m = re.exec(raw))) {
    out += numSpan(plain(raw.slice(last, m.index)));
    out += `"${m[2].replace(/\\(['"])/g, '$1')}"`;
    last = m.index + m[0].length;
  }
  out += numSpan(plain(raw.slice(last)));
  return out;
};

// Declaration normalization: split at the FIRST colon (a quoted value may
// contain colons, a property name cannot). The property name is lowercased
// but never number-normalized.
const normDecl = (d) => {
  const ci = d.indexOf(':');
  if (ci === -1) return d.replace(/\s+/g, ' ').trim().toLowerCase();
  const prop = d.slice(0, ci).replace(/\s+/g, ' ').trim().toLowerCase();
  return `${prop}:${normValue(d.slice(ci + 1))}`;
};

// Quote-aware top-level ';' split — a ';' inside a quoted string never splits.
const splitDecls = (block) => {
  const parts = [];
  let cur = '';
  let q = null;
  for (let i = 0; i < block.length; i++) {
    const ch = block[i];
    if (q) {
      cur += ch;
      if (ch === '\\') cur += block[++i] ?? '';
      else if (ch === q) q = null;
    } else if (ch === '"' || ch === "'") {
      q = ch;
      cur += ch;
    } else if (ch === ';') {
      parts.push(cur);
      cur = '';
    } else cur += ch;
  }
  parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
};

function parseCss(text) {
  const map = new Map();
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(text))) {
    const sel = normSelector(m[1]);
    const decls = splitDecls(m[2]).map(normDecl).sort();
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
          .map(([p, x]) => normDecl(`${p.replace(/([a-z0-9])([A-Z])/g, '$1-$2')}:${x}`))
          .sort();
        if (decls.length) map.set(normSelector(k), decls);
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
