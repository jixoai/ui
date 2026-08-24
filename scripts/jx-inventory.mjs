#!/usr/bin/env node
// jx-inventory — the structured scanner behind the data-jx-hooks change
// (engine@3; Codex r1–r3 remediation chain, 2026-08-25).
//
// buildInventory(root) → {
//   defined:     Set of css-defined .jx-* selector names (all authored
//                css: *.css files + every .svelte <style> block;
//                length-preserving comment strip, :where/:is unwrap)
//   staticHooks: Map hook → [sites 'file:line']   (css-less literals/parts)
//   families:    Map base → { variants: Map value → [sites], shapes, sites }
//   directives:  [{token, site, expr}]             (class:jx-foo={cond})
//   references:  [{file, kind, line, token}]
//   handReview:  [{file, line, excerpt}]           (fail-closed)
// }
//
// Laws (r3):
//   L1 parts-vs-variants mutual exclusion — a token lives in ONE
//      category; conditional-derived variants (ternary/&&/template)
//      win over literal parts with the same spelling.
//   L2 query/classList tokens are static hooks — never variants.
//   L3 every recorded site carries file:line (offset-mapped through
//      length-preserving strips).
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const svelteCompiler = require(require.resolve('svelte/compiler', { paths: [join(dirname(fileURLToPath(import.meta.url)), '..', 'apps', 'www')] }));

const EXCLUDE_DIRS = new Set(['node_modules', '.svelte-kit', 'dist', '.git', '.agents', 'shots-site', 'cli']);
// PRODUCT INPUT BOUNDARY (r4 B1): the auditors' own sources are never
// inventory inputs — their comments/fixtures/regex literals would make
// handReview unreachable-zero post-migration. Shared with
// verify-hook-law.mjs (single source of truth, versioned with the engine).
export const AUDITOR_SOURCES = new Set(['jx-inventory.mjs', 'verify-hook-law.mjs']);
const lineAt = (text, idx) => text.slice(0, Math.max(0, idx)).split('\n').length;
// strip comments WITHOUT changing offsets (mask with spaces)
const maskLineComments = (code) => code.replace(/(^|[^:])\/\/[^\n]*/g, (m) => m[0] + ' '.repeat(m.length - 1));
const maskBlockComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));

export function buildInventory(root) {
  const walk = (dir, exts, out = []) => {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
    for (const e of entries) {
      if (EXCLUDE_DIRS.has(e.name) || AUDITOR_SOURCES.has(e.name)) continue;
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
  const rel = (f) => relative(root, f);

  // ── css-defined extraction ────────────────────────────────────────
  const defined = new Set();
  const collectSelectors = (css) => {
    css = maskBlockComments(css);
    for (const m of css.matchAll(/([^{}@]+)\{/g)) {
      let sel = m[1].trim();
      if (!sel || sel.startsWith(' ')) sel = sel.trim();
      if (!/[.[]/.test(sel)) continue; // at-rule preludes / garbage
      sel = sel.replace(/:where\(/g, '(').replace(/:is\(/g, '(');
      const parts = [];
      let depth = 0, cur = '';
      for (const ch of sel) {
        if (ch === '(') depth += 1;
        if (ch === ')') depth -= 1;
        if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; } else cur += ch;
      }
      parts.push(cur);
      for (const part of parts) for (const t of part.matchAll(/\.jx-[a-z0-9-]+/g)) defined.add(t[0].slice(1));
    }
  };
  for (const f of [...walk(join(root, 'registry/files'), ['.css']), ...walk(join(root, 'apps/www/src'), ['.css'])]) {
    collectSelectors(readFileSync(f, 'utf8'));
  }
  for (const f of svelteFiles) {
    try {
      const raw = readFileSync(f, 'utf8');
      const ast = svelteCompiler.parse(raw);
      const c = ast.css;
      if (c?.content && typeof c.content.start === 'number') collectSelectors(raw.slice(c.content.start, c.content.end));
      else if (typeof c?.code === 'string') collectSelectors(c.code);
    } catch { /* unparsable → handReview below */ }
  }

  // ── collectors ────────────────────────────────────────────────────
  const staticHooks = new Map();
  const families = new Map();
  const directives = [];
  const references = [];
  const handReview = [];

  const norm = (site) => (site.includes(':') ? site : `${site}:?`);
  const addHook = (token, site) => {
    if (!staticHooks.has(token)) staticHooks.set(token, []);
    staticHooks.get(token).push(norm(site));
  };
  const addFamily = (base, site, variant = 'dynamic', shape = 'family') => {
    if (!families.has(base)) families.set(base, { variants: new Map(), sites: [], shapes: new Set() });
    const fam = families.get(base);
    fam.sites.push(norm(site));
    fam.shapes.add(shape);
    if (!fam.variants.has(variant)) fam.variants.set(variant, []);
    fam.variants.get(variant).push(norm(site));
  };
  const addVariantToken = (token, site, shape) => {
    // L1/L2: only CONDITIONAL shapes feed variants; literal/classList/
    // query tokens are parts (static hooks)
    if (shape === 'literal' || shape === 'classList' || shape === 'query') return false;
    for (const [base] of families) {
      if (token.startsWith(`jx-${base}-`)) {
        addFamily(base, site, token.slice(`jx-${base}-`.length), shape);
        return true;
      }
    }
    return false;
  };

  // class-expression scanner: expr is source text; base/baseOffset map
  // match indices back to absolute file offsets for line evidence
  const scanClassExpression = (expr, file, baseText, baseOffset) => {
    const where = (i) => `${rel(file)}:${lineAt(baseText, baseOffset + i)}`;
    for (const t of expr.matchAll(/jx-[a-z0-9-]*\$\{|jx-\$\{/g)) {
      addFamily(t[0].slice(3).replace(/\$\{$/, '').replace(/-$/, ''), where(t.index), 'dynamic', 'template');
    }
    for (const t of expr.matchAll(/(['"])jx-[a-z0-9-]*-\1\s*\+/g)) {
      addFamily(t[0].replace(/(['"]\s*\+|^-['"])/g, '').replace(/^jx-/, '').replace(/-$/, ''), where(t.index), 'dynamic', 'concat');
    }
    const masked = expr
      .replace(/jx-[a-z0-9-]*\$\{[^}]*\}/g, (mm) => ' '.repeat(mm.length))
      .replace(/(['"])jx-[a-z0-9-]*-\1\s*\+/g, (mm) => ' '.repeat(mm.length));
    for (const t of masked.matchAll(/['"`]([^'`]*)['"`]/g)) {
      const lit = t[1];
      for (const m of lit.matchAll(/\bjx-[a-z0-9-]*-\{[^}]*\}/g)) {
        addFamily(m[0].slice(3, m[0].indexOf('-{')), where(t.index + m.index), 'dynamic', 'text-interp');
      }
      const litMasked = lit.replace(/\bjx-[a-z0-9-]*-\{[^}]*\}/g, (mm) => ' '.repeat(mm.length));
      for (const m of litMasked.matchAll(/\bjx-[a-z0-9-]+/g)) addHook(m[0], where(t.index + m.index));
    }
    for (const t of masked.matchAll(/\bjx-[a-z0-9-]+(?=[\s'\"`]|$)/g)) {
      addHook(t[0], where(t.index));
    }
    // conditional shapes with span evidence (r3 B4)
    for (const t of masked.matchAll(/([?&])\s*['"`]?([^'"`?:&]{0,120}?)\b(jx-[a-z0-9-]+)\b/g)) {
      addVariantToken(t[3], where(t.index), t[1] === '?' ? 'ternary' : 'and-guard');
    }
  };

  // ── svelte files ──────────────────────────────────────────────────
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
            const frags = [...(a.value ?? [])];
            // seam pass: Text ending 'jx-foo-' right before interpolation
            for (let i = 0; i < frags.length; i += 1) {
              const fr = frags[i];
              const next = frags[i + 1];
              if (fr?.type === 'Text' && (next?.type === 'MustacheTag' || next?.type === 'ExpressionTag')) {
                const m2 = fr.data.match(/\bjx-[a-z0-9-]*-$/);
                if (m2) {
                  addFamily(m2[0].slice(3, -1), `${rel(f)}:${lineAt(raw, fr.start)}`, 'dynamic', 'text-interp');
                  fr.data = fr.data.slice(0, fr.data.length - m2[0].length);
                }
              }
            }
            for (const frag of frags) {
              if (frag.type === 'Text') {
                const maskedText = frag.data.replace(/jx-[a-z0-9-]*-\{[^}]*\}/g, (mm) => {
                  addFamily(mm.slice(3, mm.indexOf('-{')), `${rel(f)}:${lineAt(raw, frag.start)}`, 'dynamic', 'text-interp');
                  return ' '.repeat(mm.length);
                });
                for (const t of maskedText.matchAll(/\bjx-[a-z0-9-]+/g)) {
                  addHook(t[0], `${rel(f)}:${lineAt(raw, (frag.start ?? 0) + t.index)}`);
                }
              } else if (frag.type === 'ExpressionTag' || frag.type === 'MustacheTag') {
                const e = frag.expression;
                const expr = typeof e?.code === 'string' ? e.code : e && typeof e.start === 'number' ? raw.slice(e.start, e.end) : '';
                scanClassExpression(expr, f, raw, e?.start ?? frag.start ?? 0);
              }
            }
          } else if (a.type === 'Class') {
            // class:jx-foo={cond} — boolean-directive shape with the
            // condition source (r3 B4)
            if (/^jx-/.test(a.name)) {
              const e = a.expression;
              const expr = e && typeof e.start === 'number' ? raw.slice(e.start, e.end) : typeof e?.code === 'string' ? e.code : '';
              const site = `${rel(f)}:${lineAt(raw, a.start ?? 0)}`;
              addHook(a.name, site);
              directives.push({ token: a.name, site, expr: expr.slice(0, 60) });
            }
          }
        }
      }
      for (const k in node) if (k !== 'parent' && k !== 'fragment') visit(node[k]);
    };
    visit(ast.html);
    for (const script of [ast.instance, ast.module]) {
      const c = script?.content;
      if (!c) continue;
      const base = typeof c === 'string' ? 0 : c.start;
      const code = typeof c === 'string' ? c : raw.slice(c.start, c.end);
      scanScriptSection(code, f, rel, { staticHooks, families, directives, references, handReview, addHook, addFamily, addVariantToken }, { svelte: true, raw, base });
    }
  }

  // ── plain script files ────────────────────────────────────────────
  for (const f of codeFiles) {
    const code = readFileSync(f, 'utf8');
    scanScriptSection(code, f, rel, { staticHooks, families, directives, references, handReview, addHook, addFamily, addVariantToken }, {});
  }

  // L1 post-pass: conditional variants win over same-spelling parts
  for (const [base, fam] of families) {
    for (const val of fam.variants.keys()) {
      if (val !== 'dynamic') staticHooks.delete(`jx-${base}-${val}`);
    }
  }

  // family evidence rule (r2): mixed families surface for human ruling
  for (const [base] of families) {
    const definedVariants = [...defined].filter((d) => d.startsWith(`jx-${base}-`));
    if (definedVariants.length > 0) {
      handReview.push({
        file: `family:${base}`,
        line: 0,
        excerpt: `mixed family: css defines ${definedVariants.slice(0, 4).join(', ')}${definedVariants.length > 4 ? ` +${definedVariants.length - 4}` : ''} — rule state-vs-hook`,
      });
      if (defined.has(`jx-${base}`) && ![...staticHooks.keys()].some((h) => h.startsWith(`jx-${base}-`))) {
        families.delete(base);
      }
    }
  }

  for (const tok of [...staticHooks.keys()]) if (defined.has(tok)) staticHooks.delete(tok);

  return { defined, staticHooks, families, directives, references, handReview };
}

function scanScriptSection(code, file, rel, bag, opts = {}) {
  const isSvelteScript = !!opts.svelte;
  const raw = opts.raw ?? code;
  const base = opts.base ?? 0;
  const lines = code.split('\n');

  if (isSvelteScript) {
    // length-preserving strip → indices map 1:1 to absolute offsets (L3)
    const stripped = maskBlockComments(maskLineComments(code));
    const where = (i) => `${rel(file)}:${lineAt(raw, base + i)}`;
    const scanLiteral = (lit, at) => {
      if (!/jx-/.test(lit)) return;
      // template families
      for (const t of lit.matchAll(/jx-[a-z0-9-]*\$\{/g)) {
        bag.addFamily(t[0].slice(3).replace(/\$\{$/, '').replace(/-$/, ''), where(at + t.index), 'dynamic', 'template');
      }
      const maskedTpl = lit.replace(/jx-[a-z0-9-]*\$\{[^}]*\}/g, (mm) => ' '.repeat(mm.length));
      for (const t of maskedTpl.matchAll(/\bjx-[a-z0-9-]+/g)) bag.addHook(t[0], where(at + t.index));
      // concat families + literal parts
      for (const t of lit.matchAll(/\bjx-[a-z0-9-]*/g)) {
        if (t[0].endsWith('-')) bag.addFamily(t[0].slice(3, -1), where(at + t.index), 'dynamic', 'concat');
        else if (t[0].length > 3) bag.addHook(t[0], where(at + t.index));
      }
    };
    for (const m of stripped.matchAll(/\bcn\(/g)) {
      let depth = 1, i = m.index + m[0].length;
      while (i < stripped.length && depth > 0) {
        if (stripped[i] === '(') depth += 1;
        else if (stripped[i] === ')') depth -= 1;
        i += 1;
      }
      const spanStart = m.index;
      const span = stripped.slice(spanStart, i);
      for (const s2 of span.matchAll(/'([^']*)'|"([^"]*)"|`([^`]*)`/g)) {
        scanLiteral(s2[1] ?? s2[2] ?? s2[3], spanStart + s2.index);
      }
      for (const t of span.matchAll(/([?&])\s*['"`]?[^'"`?:&]{0,120}?\b(jx-[a-z0-9-]+)\b/g)) {
        bag.addVariantToken(t[2], where(spanStart + t.index), t[1] === '?' ? 'ternary' : 'and-guard');
      }
    }
  }

  lines.forEach((line, i) => {
    const site = `${rel(file)}:${i + 1}`;
    const cl = line.match(/classList\.(add|remove|toggle|contains)\(\s*['"`]([^'"`]+)['"`]/);
    if (cl) {
      for (const t of cl[2].matchAll(/\bjx-[a-z0-9-]+/g)) bag.addHook(t[0], site);
      bag.references.push({ file: rel(file), kind: 'classList', line: i + 1, token: cl[2] });
      return;
    }
    const q = line.match(/(querySelector(?:All)?|closest|matches)\(\s*['"`]([^'"`]+)['"`]/);
    if (q && /jx-/.test(q[2])) {
      bag.references.push({ file: rel(file), kind: 'query', line: i + 1, token: q[2] });
      for (const t of q[2].matchAll(/\.jx-[a-z0-9-]+/g)) bag.addHook(t[0].slice(1), site); // L2
      return;
    }
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
  const label = process.argv.find((a) => a.startsWith('--label='))?.slice(8) ?? 'cwd';
  const inv = await buildInventory(rootArg);
  const jsonIdx = process.argv.indexOf('--json');
  const payload = {
    engine: 'jx-inventory@3.1',
    root: label,
    counts: {
      defined: inv.defined.size,
      staticHooks: inv.staticHooks.size,
      families: inv.families.size,
      directives: inv.directives.length,
      handReview: inv.handReview.length,
      references: inv.references.length,
    },
    defined: [...inv.defined].sort(),
    hooks: Object.fromEntries([...inv.staticHooks.entries()].sort()),
    families: Object.fromEntries([...inv.families.entries()].map(([b, v]) => [b, {
      variants: Object.fromEntries([...v.variants.entries()]),
      shapes: [...v.shapes],
      sites: v.sites.slice(0, 12),
    }])),
    directives: inv.directives,
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
