#!/usr/bin/env node
// jx-inventory — the structured scanner behind the data-jx-hooks change
// (Codex r1 B1/B2/B4 remediation, 2026-08-25).
//
// Two engines, one file, importable:
//   buildInventory(root) → {
//     defined:     Set of css-defined .jx-* selector names (ALL authored
//                  css: *.css files + every .svelte <style> block,
//                  comments stripped, :where()/:is() unwrapped)
//     staticHooks: Map hook → [sites]     (css-less, static usage)
//     families:    Map base → { variants, sites }  (dynamic 'jx-{base}-{v}')
//     handReview:  [{file, line, excerpt}] (fail-closed: ambiguous tokens)
//     references:  [{file, kind, token}]   (selector/classList reference sites)
//   }
//
// Scoping rules (the r1 blockers):
//   • TEMPLATE usage comes from the Svelte AST: ONLY class Attribute
//     value fragments and Class directives (class:) — ids, events
//     (onjx-*), comments and prose are structurally invisible.
//   • SCRIPT usage (.ts/.mjs + svelte instance/module) only inside
//     classList.(add|remove|toggle|contains) args and selector-shaped
//     strings tied to query APIs — anything else lands in handReview.
//   • Dynamic families: template-literal `jx-${…}` prefixes and string
//     literals ending in '-' inside class expressions merge into a
//     family base; trailing-hyphen tokens never enter staticHooks.
//
// CLI: node scripts/jx-inventory.mjs [--json out.json]
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const svelteCompiler = require(require.resolve('svelte/compiler', { paths: [join(dirname(fileURLToPath(import.meta.url)), '..', 'apps', 'www')] }));

const EXCLUDE_DIRS = new Set(['node_modules', '.svelte-kit', 'dist', '.git', '.agents', 'shots-site', 'cli']);

export function buildInventory(root) {
  const walk = (dir, exts, out = []) => {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
    for (const e of entries) {
      if (EXCLUDE_DIRS.has(e.name)) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p, exts, out);
      else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
    }
    return out;
  };

  const svelteFiles = [
    ...walk(join(root, 'registry/files'), ['.svelte']),
    ...walk(join(root, 'apps/www/src'), ['.svelte']),
    ...walk(join(root, 'apps/www/test'), ['.svelte']),
  ];
  const codeFiles = [
    ...walk(join(root, 'registry/files'), ['.ts']),
    ...walk(join(root, 'apps/www/src'), ['.ts']),
    ...walk(join(root, 'apps/www/test'), ['.ts']),
    ...walk(join(root, 'scripts'), ['.mjs']),
  ];

  // ── css-defined extraction ────────────────────────────────────────
  const defined = new Set();
  const collectSelectors = (css) => {
    // strip comments
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    // selector prelude = text before '{' at any nesting depth; crude but
    // robust for authored sheets: take every chunk ending in '{'
    for (const m of css.matchAll(/([^{}@]+)\{/g)) {
      let sel = m[1].trim();
      if (sel.startsWith('/*')) continue;
      // unwrap :where()/:is() wrappers
      sel = sel.replace(/:where\(/g, '(').replace(/:is\(/g, '(');
      // split top-level commas (paren-aware)
      const parts = [];
      let depth = 0, cur = '';
      for (const ch of sel) {
        if (ch === '(') depth += 1;
        if (ch === ')') depth -= 1;
        if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; } else cur += ch;
      }
      parts.push(cur);
      for (const part of parts) {
        for (const t of part.matchAll(/\.jx-[a-z0-9-]+/g)) defined.add(t[0].slice(1));
      }
    }
  };
  const cssFiles = [
    ...walk(join(root, 'registry/files'), ['.css']),
    ...walk(join(root, 'apps/www/src'), ['.css']),
  ];
  for (const f of cssFiles) collectSelectors(readFileSync(f, 'utf8'));
  const svelteCss = new Map(); // file → css text (for reuse below)
  for (const f of svelteFiles) {
    try {
      const raw = readFileSync(f, 'utf8');
      const ast = svelteCompiler.parse(raw);
      const c = ast.css;
      if (c?.content && typeof c.content.start === 'number') {
        const css = raw.slice(c.content.start, c.content.end);
        collectSelectors(css);
        svelteCss.set(f, css);
      } else if (typeof c?.code === 'string') {
        collectSelectors(c.code);
        svelteCss.set(f, c.code);
      }
    } catch { /* unparsable svelte → handReview via template scan below */ }
  }

  // ── template usage (svelte AST) ───────────────────────────────────
  const staticHooks = new Map();
  const families = new Map();
  const references = [];
  const handReview = [];
  const rel = (f) => relative(root, f);

  const addHook = (token, file) => {
    if (!staticHooks.has(token)) staticHooks.set(token, []);
    staticHooks.get(token).push(rel(file));
  };
  const addFamily = (base, file, hint = '', variant = 'dynamic', shape = 'family') => {
    if (!families.has(base)) families.set(base, { variants: new Map(), sites: [], shapes: new Set() });
    const fam = families.get(base);
    fam.sites.push(rel(file) + (hint ? `:${hint}` : ''));
    fam.shapes.add(shape);
    if (!fam.variants.has(variant)) fam.variants.set(variant, []);
    fam.variants.get(variant).push(rel(file));
  };
  // a concrete variant observed as a full token ('jx-alert-default',
  // ternary branch 'jx-tgroup-on') feeds the family's variant table
  const addVariantToken = (token, file, shape) => {
    // family-vs-part law (r1): a LITERAL token is a PART (static hook)
    // even when it shares a family prefix; only CONDITIONAL shapes
    // (ternary / and-guard / query against a family) feed variants
    if (shape === 'literal' || shape === 'classList') return false;
    for (const [base] of families) {
      if (token.startsWith(`jx-${base}-`)) {
        addFamily(base, file, '', token.slice(`jx-${base}-`.length), shape);
        return true;
      }
    }
    return false;
  };
  const scanClassExpression = (expr, file) => {
    // B1: recognize family spans FIRST, then mask them so trailing-dash
    // prefixes can never enter staticHooks
    const familySpans = [];
    const recordFamily = (wholeMatch, base, shape) => {
      addFamily(base, file, '', 'dynamic', shape);
      familySpans.push([wholeMatch.length, wholeMatch.index]);
    };
    let work = expr;
    for (const t of work.matchAll(/jx-[a-z0-9-]*\$\{|jx-\$\{/g)) {
      addFamily(t[0].slice(3).replace(/\$\{$/, '').replace(/-$/, ''), file, '', 'dynamic', 'template');
    }
    for (const t of work.matchAll(/'jx-[a-z0-9-]*-'\s*\+|"jx-[a-z0-9-]*-"\s*\+/g)) {
      const base = t[0].replace(/['"]\s*\+$/, '').replace(/^['"]jx-/, '').replace(/-$/, '');
      addFamily(base, file, '', 'dynamic', 'concat');
    }
    // mask family-dynamic spans (template `${` tails and concat prefixes)
    const masked = work
      .replace(/jx-[a-z0-9-]*\$\{[^}]*\}/g, (mm) => ' '.repeat(mm.length))
      .replace(/(['"])jx-[a-z0-9-]*-\1\s*\+/g, (mm) => ' '.repeat(mm.length));
    // static tokens on the masked text only
    for (const t of masked.matchAll(/['"`]([^'`]*)['"`]/g)) {
      const lit = t[1];
      // literal hook-family spelling: 'jx-foo-{x}' inside a quoted string
      for (const m of lit.matchAll(/\bjx-[a-z0-9-]*-\{[^}]*\}/g)) {
        addFamily(m[0].slice(3, m[0].indexOf('-{')), file, '', 'dynamic', 'text-interp');
      }
      const litMasked = lit.replace(/\bjx-[a-z0-9-]*-\{[^}]*\}/g, (mm) => ' '.repeat(mm.length));
      for (const m of litMasked.matchAll(/\bjx-[a-z0-9-]+/g)) addHook(m[0], file);
    }
    for (const t of masked.matchAll(/\bjx-[a-z0-9-]+(?=[\s'\"`]|$)/g)) {
      if (!addVariantToken(t[0], file, 'literal')) addHook(t[0], file);
    }
    // B4: conditional shapes — ternary branches / && guards holding hooks
    for (const t of masked.matchAll(/([?&])\s*['"`]?([^'"`?:&]{0,120}?)\b(jx-[a-z0-9-]+)\b/g)) {
      const token = t[3];
      if (addVariantToken(token, file, t[1] === '?' ? 'ternary' : 'and-guard')) {
        // nothing else — recorded as a concrete conditional variant
      }
    }
  };

  for (const f of svelteFiles) {
    const raw = readFileSync(f, 'utf8');
    let ast;
    try { ast = svelteCompiler.parse(raw); } catch (e) {
      handReview.push({ file: rel(f), line: 0, excerpt: `unparsable svelte: ${e.message.split('\n')[0]}` });
      continue;
    }
    const visit = (node) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) { node.forEach(visit); return; }
      if (node.type === 'RegularElement' || node.type === 'Element' || node.type === 'Component') {
        for (const a of node.attributes ?? []) {
          if (a.type === 'Attribute' && a.name === 'class') {
            // two passes: (1) seam detection — a Text fragment ending in
            // 'jx-foo-' immediately before a Mustache is a FAMILY
            // (`class="jx-file-icon-{fn(x)}"`); (2) token scanning on
            // the seam-truncated copies
            const frags = [...(a.value ?? [])];
            for (let i = 0; i < frags.length; i += 1) {
              const fr = frags[i];
              const next = frags[i + 1];
              if (fr?.type === 'Text' && (next?.type === 'MustacheTag' || next?.type === 'ExpressionTag')) {
                const m2 = fr.data.match(/\bjx-[a-z0-9-]*-$/);
                if (m2) {
                  addFamily(m2[0].slice(3, -1), f, '', 'dynamic', 'text-interp');
                  fr.data = fr.data.slice(0, fr.data.length - m2[0].length);
                }
              }
            }
            for (const frag of frags) {
              if (frag.type === 'Text') {
                // svelte {var} interpolation inside class text: jx-foo-{x}
                // is a FAMILY (masked before static token scanning)
                const maskedText = frag.data.replace(/jx-[a-z0-9-]*-\{[^}]*\}/g, (mm) => {
                  addFamily(mm.slice(3, mm.indexOf('-{')), f, '', 'dynamic', 'text-interp');
                  return ' '.repeat(mm.length);
                });
                for (const t of maskedText.matchAll(/\bjx-[a-z0-9-]+/g)) {
                  if (!addVariantToken(t[0], f, 'literal')) addHook(t[0], f);
                }
              } else if (frag.type === 'ExpressionTag' || frag.type === 'MustacheTag') {
                // ESTree expression: slice source via start/end (.code absent)
                const e = frag.expression;
                const expr = typeof e?.code === 'string' ? e.code : e && typeof e.start === 'number' ? raw.slice(e.start, e.end) : '';
                scanClassExpression(expr, f);
              }
            }
          } else if (a.type === 'Class') {
            // class:jx-foo={cond} — static name; dynamic names are impossible
            if (/^jx-/.test(a.name)) addHook(a.name, f);
          }
          // ids, events, data-* etc. are structurally ignored
        }
      }
      for (const k in node) if (k !== 'parent' && k !== 'fragment') visit(node[k]);
    };
    visit(ast.html);
    // instance/module scripts: classList + selector strings only
    for (const script of [ast.instance, ast.module]) {
      const c = script?.content;
      if (!c) continue;
      // ESTree Program: slice the source text via its start/end offsets
      const code = typeof c === 'string' ? c : raw.slice(c.start, c.end);
      scanScriptSection(code, f, rel, { staticHooks, families, references, handReview, addHook, addFamily, addVariantToken }, { svelte: true });
    }
  }

  // ── script-file usage (.ts/.mjs) ──────────────────────────────────
  for (const f of codeFiles) {
    scanScriptSection(readFileSync(f, 'utf8'), f, rel, { staticHooks, families, references, handReview, addHook, addFamily, addVariantToken });
  }

  if (process.env.JX_DEBUG) console.error('PRE-PRUNE families:', [...families.keys()]);
  // families — evidence rule (r2 B1/audit): a family with ZERO
  // css-defined `jx-<base>-*` selectors survives (its variants are
  // css-less hooks); a family with ≥1 defined selector is MIXED
  // (state machines like jx-sheet-left live in css) and goes to
  // handReview for an explicit human ruling — never auto-dropped.
  for (const [base, info] of families) {
    const definedVariants = [...defined].filter((d) => d.startsWith(`jx-${base}-`));
    if (definedVariants.length > 0) {
      handReview.push({
        file: `family:${base}`,
        line: 0,
        excerpt: `mixed family: css defines ${definedVariants.slice(0, 4).join(', ')}${definedVariants.length > 4 ? ` +${definedVariants.length - 4}` : ''} — rule whether the dynamic variants are states (drop family) or hooks (keep)`,
      });
      if (defined.has(`jx-${base}`) && ![...staticHooks.keys()].some((h) => h.startsWith(`jx-${base}-`))) {
        families.delete(base); // base + all visible variants defined → state family
      }
    }
  }

  // staticHooks: remove css-defined tokens (they stay classes)
  for (const tok of [...staticHooks.keys()]) if (defined.has(tok)) staticHooks.delete(tok);

  return { defined, staticHooks, families, references, handReview };
}

function scanScriptSection(code, file, rel, bag, opts = {}) {
  const isSvelteScript = !!opts.svelte;
  const lines = code.split('\n');

  // ── svelte scripts, stage 1: cn(...) spans (class strings, often
  // multi-line) — balanced parens on a comment-stripped copy.
  // NO early return: stage 2 (query/classList) still runs (r2 B7).
  if (isSvelteScript) {
    const stripped = lines.map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
    const scanLiteral = (lit, isTpl) => {
      if (!/jx-/.test(lit)) return;
      if (isTpl) {
        for (const t of lit.matchAll(/jx-[a-z0-9-]*\$\{/g)) bag.addFamily(t[0].slice(3).replace(/\$\{$/, '').replace(/-$/, ''), file, '', 'dynamic', 'template');
        const maskedTpl = lit.replace(/jx-[a-z0-9-]*\$\{[^}]*\}/g, (mm) => ' '.repeat(mm.length));
        for (const t of maskedTpl.matchAll(/\bjx-[a-z0-9-]+/g)) bag.addHook(t[0], file);
      } else {
        for (const t of lit.matchAll(/\bjx-[a-z0-9-]*/g)) {
          if (t[0].endsWith('-')) bag.addFamily(t[0].slice(3, -1), file, '', 'dynamic', 'concat');
          else if (t[0].length > 3) {
            if (!bag.addVariantToken(t[0], file, 'literal')) bag.addHook(t[0], file);
          }
        }
      }
    };
    for (const m of stripped.matchAll(/\bcn\(/g)) {
      let depth = 1, i = m.index + m[0].length;
      while (i < stripped.length && depth > 0) {
        if (stripped[i] === '(') depth += 1;
        else if (stripped[i] === ')') depth -= 1;
        i += 1;
      }
      const span = stripped.slice(m.index, i);
      for (const s2 of span.matchAll(/'([^']*)'|"([^"]*)"|`([^`]*)`/g)) scanLiteral(s2[1] ?? s2[2] ?? s2[3], !!s2[3]);
      // conditional shapes inside the span (ternary / &&)
      for (const t of span.matchAll(/([?&])\s*['"`]?[^'"`?:&]{0,120}?\b(jx-[a-z0-9-]+)\b/g)) {
        bag.addVariantToken(t[2], file, t[1] === '?' ? 'ternary' : 'and-guard');
      }
    }
  }

  // ── stage 2 (ALL scripts, incl. svelte): classList + query references
  lines.forEach((line, i) => {
    const cl = line.match(/classList\.(add|remove|toggle|contains)\(\s*['"`]([^'"`]+)['"`]/);
    if (cl) {
      for (const t of cl[2].matchAll(/\bjx-[a-z0-9-]+/g)) {
        if (!bag.addVariantToken(t[0], file, 'classList')) bag.addHook(t[0], file);
      }
      bag.references.push({ file: rel(file), kind: 'classList', line: i + 1, token: cl[2] });
      return;
    }
    const q = line.match(/(querySelector(?:All)?|closest|matches)\(\s*['"`]([^'"`]+)['"`]/);
    if (q && /jx-/.test(q[2])) {
      bag.references.push({ file: rel(file), kind: 'query', line: i + 1, token: q[2] });
      for (const t of q[2].matchAll(/\.jx-[a-z0-9-]+/g)) {
        if (!bag.addVariantToken(t[0].slice(1), file, 'query')) bag.addHook(t[0].slice(1), file);
      }
      return;
    }
    // fail-closed: multi-line/concat selector shapes containing jx-
    if (/querySelector|closest|matches|classList/.test(line) && /jx-/.test(line) && !/\(/.test(line.split('jx-')[0])) {
      bag.handReview.push({ file: rel(file), line: i + 1, excerpt: 'possible multi-line selector: ' + line.trim().slice(0, 70) });
      return;
    }
    const stray = line.match(/['"`]([^'"`]*jx-[a-z0-9-][^'"`]*)['"`]/);
    if (stray && !/onjx-|jx-reset|--jx-|@media|data-jx/.test(stray[1])) {
      bag.handReview.push({ file: rel(file), line: i + 1, excerpt: stray[1].slice(0, 80) });
    }
  });
}

// ── CLI ─────────────────────────────────────────────────────────────
if (process.argv[1] && process.argv[1].endsWith('jx-inventory.mjs')) {
  const rootArg = process.argv.find((a) => a.startsWith('--root='))?.slice(7) ?? join(dirname(fileURLToPath(import.meta.url)), '..');
  const inv = await buildInventory(rootArg);
  const jsonIdx = process.argv.indexOf('--json');
  const payload = {
    engine: 'jx-inventory@2',
    root: rootArg,
    counts: {
      defined: inv.defined.size,
      staticHooks: inv.staticHooks.size,
      families: inv.families.size,
      handReview: inv.handReview.length,
      references: inv.references.length,
    },
    defined: [...inv.defined].sort(),
    hooks: Object.fromEntries([...inv.staticHooks.entries()].sort().map(([k, v]) => [k, v])),
    families: Object.fromEntries([...inv.families.entries()].map(([b, v]) => [b, {
      variants: Object.fromEntries([...v.variants.entries()].map(([val, sites]) => [val, sites])),
      shapes: [...v.shapes],
      sites: v.sites.slice(0, 12),
    }])),
    handReview: inv.handReview,
    references: inv.references,
  };
  if (jsonIdx > -1) writeFileSync(process.argv[jsonIdx + 1], JSON.stringify(payload, null, 2));
  console.log(JSON.stringify(payload.counts, null, 1));
  if (inv.handReview.length) {
    console.log(`\nhand-review sites (${inv.handReview.length}):`);
    inv.handReview.slice(0, 12).forEach((h) => console.log(`  ${h.file}:${h.line} — ${h.excerpt}`));
  }
}
