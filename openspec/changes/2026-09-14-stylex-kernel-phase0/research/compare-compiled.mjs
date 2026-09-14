#!/usr/bin/env node
// compare-compiled.mjs v5 — the P0.6 corpus-dogfood equivalence comparator
// (gate-1-r6 blocker A1: v4 closed the r5 boundaries (URL/custom-prop
// value/media ancestry/cascade conflict order) but adversarial probing
// still found three cascade-global gaps — @layer BLOCK order was absorbed
// by the unordered N5 pool (layer stack order decides the cascade), the
// at-keyword prelude normalizer lowercased SEMANTIC names (@layer Foo ≡
// @layer foo, @keyframes Spin ≡ @keyframes spin), and custom-ident
// property values were lowercased (animation-name: Spin ≡ spin). v5 adds
// the document-level @layer first-mention order vector compared as an
// ordered sequence in BOTH modes, shields prelude NAME tokens from
// lowercasing, and routes custom-ident properties through the
// case-preserving value path. v4's structure-aware parser and scoping
// laws carry over unchanged:)
//   - selectors: whitespace-only structural normalization (comma collapse)
//   - declarations: split at the first colon; property names are never
//     number-normalized; custom-property VALUES keep their case
//   - values: N1/N3 apply only to unquoted spans, with --custom-property
//     references and url(...) contents (quoted or not) shielded verbatim;
//     N2 canonicalizes quoting while preserving the quoted VALUE verbatim
//   - at-rule ancestry: @media/@supports/@container/@layer/@scope/
//     @keyframes nest — every rule key carries its full at-rule path
//   - cascade conflicts: multiple rules on one selector keep occurrence
//     order; reversed conflicts compare DIFFERENT
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
//                       never selectors, never --custom-property names,
//                       never url(...) contents)
//   N2 pseudo content   quote-style insensitive ('a' ≡ "a"); value-sensitive
//                       ("a" ≢ "b", "012" ≢ "12"); url("a") ≡ url(a)
//   N3 steps() timing   steps(1,end) ≡ steps(1) ≡ steps(1,jump-end); (2,start) ≢ (2)
//   N4 rule-set order   decls sorted within one rule; rules compared set-wise
//                       across selectors — but same-selector occurrences
//                       keep cascade order (reversed conflicts ≢)
//   N5 selector names   cross-context structural matching (default mode),
//                       keyed by decl-signature INCLUDING at-rule ancestry
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

// url(...) shielding (quoted or unquoted, surrounding whitespace stripped):
// URL contents are NOT CSS numbers, are case-sensitive, and keep their value
// semantics verbatim. Sentinel \u0001 is disjoint from numSpan's \u0000.
const shieldUrls = (s) => {
  const urls = [];
  const out = s.replace(/url\(\s*(["']?)([^)'"]*)\1\s*\)/gi, (_m, _q, inner) => `\u0001${urls.push(`url(${inner.trim()})`) - 1}\u0001`);
  return { out, urls };
};
const restoreUrls = (s, urls) => s.replace(/\u0001(\d+)\u0001/g, (_m, i) => urls[+i]);

// Selector normalization: structural whitespace ONLY — names, digits, and
// case stay verbatim (no N1/N2/N3 may ever touch a selector).
const normSelector = (s) => s.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ',').trim();

// At-rule prelude normalization (for @media conditions, @layer names,
// blockless @import/@charset, and ancestry keys): structural whitespace +
// lowercase keywords + N1 on numbers, with urls and --custom-property
// At-rule prelude normalization. The at-keyword itself and condition
// syntax are case-insensitive (lowercased); the NAME tokens are semantic
// identifiers and keep their case verbatim: @layer names (comma lists
// included), @keyframes names, and an optional named @container query.
// @scope preludes carry selector text (class names are case-sensitive),
// so they skip lowercasing entirely. urls and --custom-property names
// are shielded in every path. Sentinel \u0005 shields name tokens
// (disjoint from \u0000 custom-props and \u0001 urls).
const normPrelude = (p) => {
  const { out: s0, urls } = shieldUrls(p);
  const cps = [];
  const names = [];
  const shieldCps = (s) => s.replace(/--[a-z0-9_-]+/gi, (m) => `\u0000${cps.push(m) - 1}\u0000`);
  const shieldName = (s) => s.replace(/[^,\s]+/g, (m) => `\u0005${names.push(m) - 1}\u0005`);
  const syntax = (s, keepCase = false) => {
    let t = s
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ',')
      .replace(/\s*:\s*/g, ':')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')');
    if (!keepCase) t = t.toLowerCase();
    return numSpan(shieldCps(t));
  };
  const restore = (s) => s
    .replace(/\u0000(\d+)\u0000/g, (_m, i) => cps[+i])
    .replace(/\u0005(\d+)\u0005/g, (_m, i) => names[+i])
    .replace(/\u0001(\d+)\u0001/g, (_m, i) => urls[+i]);
  const nm = s0.match(/^@([-\w]+)([\s\S]*)$/);
  if (!nm) return restore(syntax(s0));
  const atkw = `@${nm[1].toLowerCase()}`;
  const rest = nm[2];
  if (atkw === '@layer' && rest.trim()) {
    // a layer name or comma list of names — every token is semantic
    return restore(`${atkw} ${syntax(shieldName(rest.trim()), true)}`.replace(/\s+/g, ' ').trim());
  }
  if (atkw === '@keyframes' || atkw === '@container') {
    // optional leading NAME token before the condition/query parens
    return restore(`${atkw} ${syntax(rest.replace(/^(\s*)([^\s(]+)/, (_m, ws_, tok) => ws_ + shieldName(tok)))}`.replace(/\s+/g, ' ').trim());
  }
  if (atkw === '@scope') {
    return restore(`${atkw} ${syntax(rest, true)}`.replace(/\s+/g, ' ').trim());
  }
  return restore(`${atkw} ${syntax(rest)}`.replace(/\s+/g, ' ').trim());
};

// Value normalization: url(...) shielded first (canonical url(value) form,
// so quoted and unquoted URLs unify); then a quoted-run walk. Unquoted
// spans get whitespace/comma collapse + N1/N3 (lowercased — CSS value
// keywords are case-insensitive — UNLESS keepCase, used for custom-property
// values which are case-sensitive token streams). Quoted runs get N2:
// canonical double quotes, quote-escapes resolved, the inner VALUE verbatim.
const normValue = (raw, keepCase = false) => {
  const { out: stage, urls } = shieldUrls(raw);
  const plain = (s) => {
    let t = s.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ',');
    if (!keepCase) t = t.toLowerCase();
    return t;
  };
  let out = '';
  let last = 0;
  const re = /(["'])((?:\\.|(?!\1).)*)\1/g;
  let m;
  while ((m = re.exec(stage))) {
    out += numSpan(plain(stage.slice(last, m.index)));
    out += `"${m[2].replace(/\\(['"])/g, '$1')}"`;
    last = m.index + m[0].length;
  }
  out += numSpan(plain(stage.slice(last)));
  return restoreUrls(out, urls);
};

// Properties whose unquoted values are custom-ident token streams
// (keyframe names, view-transition names, counter names, timeline/anchor
// names) — case-sensitive references to author-defined identifiers, so
// their values take the case-preserving path. Shorthands are included:
// a keyword inside them keeping its case is a conservative false-DIFFERENT.
const CUSTOM_IDENT_PROPS = new Set([
  'animation', 'animation-name', 'animation-timeline',
  'view-transition-name', 'view-transition-class',
  'counter-reset', 'counter-increment', 'counter-set',
  'scroll-timeline-name', 'timeline-scope', 'anchor-name', 'position-try',
]);

// Declaration normalization: split at the FIRST colon (a quoted value may
// contain colons, a property name cannot). The property name is lowercased
// but never number-normalized; custom-property values and custom-ident
// property values keep their case.
const normDecl = (d) => {
  const ci = d.indexOf(':');
  if (ci === -1) return d.replace(/\s+/g, ' ').trim().toLowerCase();
  const prop = d.slice(0, ci).replace(/\s+/g, ' ').trim().toLowerCase();
  return `${prop}:${normValue(d.slice(ci + 1), prop.startsWith('--') || CUSTOM_IDENT_PROPS.has(prop))}`;
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

// At-rules whose bodies contain RULES (nest recursively); everything else
// (@font-face, @property, @charset…) is a decl-block or blockless rule.
const AT_RULE_CONTAINERS = /^@(-[a-z]+-)?(media|supports|container|layer|scope|keyframes|starting-style|document)\b/i;

const OCC = '\u0003'; // occurrence separator inside one selector's cascade sequence

// Rule entries carry structure, not just a flat key:
//   key  — full at-rule path + leaf (strict-mode identity)
//   ctx  — the at-rule ancestry ALONE (semantic context; part of the N5
//          signature — identical decls under different @media/@layer are
//          NOT equivalent, only leaf class-name differences are forgiven)
//   leaf — the style-rule selector text (ignored by N5 — class hashes are
//          path-dependent per L3c — EXCEPT at-rule preludes and keyframe
//          stop names, which are semantic and stay in the signature)
//   occs — declaration sets in occurrence order (cascade conflicts keep order)
function parseCss(text) {
  const map = new Map();
  // Global @layer order: the first-mention sequence of layer paths
  // decides the layer stack, so it is captured document-wide and compared
  // as an ordered vector (blockless lists mention their names in order;
  // anonymous layers get unique ids — each anonymous block is a DISTINCT
  // layer that can never be reopened).
  const layerOrder = [];
  const seenLayers = new Set();
  let anonLayer = 0;
  const mentionLayer = (path) => {
    if (!seenLayers.has(path)) {
      seenLayers.add(path);
      layerOrder.push(path);
    }
  };
  const add = (key, ctx, leaf, atRule, decls) => {
    const e = map.get(key);
    if (e) e.occs.push(decls);
    else map.set(key, { key, ctx, leaf, atRule, occs: [decls] });
  };
  const walk = (src, ancestors, layerPath) => {
    let i = 0;
    while (i < src.length) {
      const open = src.indexOf('{', i);
      const semi = src.indexOf(';', i);
      if (open === -1 && semi === -1) {
        const tail = src.slice(i).replace(/\/\*[\s\S]*?\*\//g, '').trim();
        if (tail && !/^@layer\b/i.test(tail)) add(normPrelude(tail), ancestors.map(normPrelude).join('\u0002'), normPrelude(tail), true, []);
        break;
      }
      if (semi !== -1 && (open === -1 || semi < open)) {
        const seg = src.slice(i, semi).replace(/\/\*[\s\S]*?\*\//g, '').trim();
        if (seg) {
          if (/^@layer\b/i.test(seg)) {
            // blockless @layer statement: order-establishing names only
            for (const tok of seg.replace(/^@layer\s*/i, '').split(',')) {
              const name = tok.trim();
              if (name) mentionLayer([...layerPath, name].join('.'));
            }
          } else {
            add(normPrelude(seg), ancestors.map(normPrelude).join('\u0002'), normPrelude(seg), true, []);
          }
        }
        i = semi + 1;
        continue;
      }
      const prelude = src.slice(i, open).replace(/\/\*[\s\S]*?\*\//g, '').trim();
      let depth = 1;
      let j = open + 1;
      while (j < src.length && depth > 0) {
        if (src[j] === '{') depth++;
        else if (src[j] === '}') depth--;
        if (depth === 0) break;
        j++;
      }
      const body = src.slice(open + 1, j);
      if (AT_RULE_CONTAINERS.test(prelude)) {
        if (/^@layer\b/i.test(prelude)) {
          const restName = prelude.replace(/^@layer\s*/i, '').trim();
          const name = restName || `\u0004${anonLayer++}`;
          mentionLayer([...layerPath, name].join('.'));
          // canonical ancestor keeps the (case-sensitive) name verbatim;
          // normPrelude is idempotent on it
          walk(body, [...ancestors, `@layer ${name}`], [...layerPath, name]);
        } else {
          walk(body, [...ancestors, prelude], layerPath);
        }
      } else {
        const ctx = ancestors.map(normPrelude).join('\u0002');
        const leaf = normSelector(prelude);
        add(`${ctx}${ancestors.length ? '\u0002' : ''}${leaf}`, ctx, leaf, false, splitDecls(body).map(normDecl));
      }
      i = j + 1;
    }
  };
  walk(text.replace(/\/\*[\s\S]*?\*\//g, ''), [], []);
  return { map, layerOrder };
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
        const leaf = normSelector(k);
        if (decls.length) map.set(leaf, { key: leaf, ctx: '', leaf, atRule: false, occs: [decls] });
        walk(v);
      }
    }
  };
  walk(JSON.parse(text));
  return { map, layerOrder: [] };
}

const isJson = (p) => p.endsWith('.json');
const a = (isJson(aPath) ? parseJson : parseCss)(readFileSync(aPath, 'utf8'));
const b = (isJson(bPath) ? parseJson : parseCss)(readFileSync(bPath, 'utf8'));

const diffs = [];
// Document-level: the @layer stack order (first-mention vector) is a
// cascade-deciding global — compared as an ORDERED sequence in BOTH modes.
if (a.layerOrder.join(' → ') !== b.layerOrder.join(' → ')) {
  diffs.push({ selector: '(document) @layer order', a: a.layerOrder.join(' → ') || '(none)', b: b.layerOrder.join(' → ') || '(none)' });
}
if (strictSelectors) {
  for (const k of new Set([...a.map.keys(), ...b.map.keys()])) {
    const da = (a.map.get(k)?.occs || []).map((o) => o.join(';')).join(OCC);
    const db = (b.map.get(k)?.occs || []).map((o) => o.join(';')).join(OCC);
    if (da !== db) diffs.push({ selector: k, a: da, b: db });
  }
} else {
  // N5 structural signature: at-rule ancestry + semantic leaf (at-rule
  // preludes, keyframe stops) + cascade-ordered decl sequence — only the
  // style-rule leaf NAME is forgiven (path-dependent class hashes, L3c).
  const semanticLeaf = (e) => (e.atRule || /@([-\w]+-)?keyframes\b/i.test(e.ctx) ? e.leaf : '');
  const sig = (e) => `${e.ctx}${OCC}${semanticLeaf(e)}${OCC}${e.occs.map((o) => o.slice().sort().join(';')).join(OCC)}`;
  const pool = [];
  for (const e of b.map.values()) pool.push({ k: e.key, sig: sig(e) });
  for (const e of a.map.values()) {
    const s0 = sig(e);
    const idx = pool.findIndex((p) => p.sig === s0);
    if (idx === -1) diffs.push({ selector: e.key, a: s0, b: '(no structural match)' });
    else pool.splice(idx, 1);
  }
  for (const p of pool) diffs.push({ selector: p.k, a: '(no structural match)', b: p.sig });
}

const verdict = diffs.length ? 'DIFFERENT' : 'EQUIVALENT';
const report = `compare-compiled: ${verdict} (${a.map.size} vs ${b.map.size} selectors, normalizations N1-N${strictSelectors ? 4 : 5} applied)\n` +
  diffs.slice(0, 20).map((d) => `  ✗ ${d.selector}\n    a: ${d.a}\n    b: ${d.b}`).join('\n');
if (rawOut) writeFileSync(rawOut, JSON.stringify({ a: aPath, b: bPath, equivalent: diffs.length === 0, diffs }, null, 2));
console.log(report);
process.exit(diffs.length ? 1 : 0);
