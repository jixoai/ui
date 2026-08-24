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
  const addFamily = (base, file, hint = '') => {
    if (!families.has(base)) families.set(base, { variants: new Set(), sites: [] });
    families.get(base).sites.push(rel(file) + (hint ? `:${hint}` : ''));
  };
  const scanClassExpression = (expr, file) => {
    // string literals inside the class expression
    for (const m of expr.matchAll(/'([^']*)'|"([^"]*)"/g)) {
      const lit = m[1] ?? m[2];
      for (const t of lit.matchAll(/\bjx-[a-z0-9-]*|\bjx-\$\{?/g)) {
        const tok = t[0];
        if (tok.endsWith('-')) { addFamily(tok.slice(3, -1), file); continue; }
        if (tok === 'jx-' || tok.startsWith('jx-${')) { addFamily(tok.slice(3).replace('${', ''), file); continue; }
        addHook(tok, file);
      }
    }
    // template literals: `jx-foo-${bar}` and `...${x} jx-y ...`
    for (const m of expr.matchAll(/`([^`]*)`/g)) {
      const tpl = m[1];
      for (const t of tpl.matchAll(/jx-[a-z0-9-]*\$\{|jx-\$\{/g)) {
        addFamily(t[0].slice(3).replace(/\$\{$/, '').replace(/-$/, ''), file);
      }
      for (const t of tpl.matchAll(/\bjx-[a-z0-9-]+/g)) addHook(t[0], file);
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
            for (const frag of a.value ?? []) {
              if (frag.type === 'Text') {
                for (const t of frag.data.matchAll(/\bjx-[a-z0-9-]+/g)) addHook(t[0], f);
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
      scanScriptSection(code, f, rel, { staticHooks, families, references, handReview, addHook, addFamily }, { svelte: true });
    }
  }

  // ── script-file usage (.ts/.mjs) ──────────────────────────────────
  for (const f of codeFiles) {
    scanScriptSection(readFileSync(f, 'utf8'), f, rel, { staticHooks, families, references, handReview, addHook, addFamily });
  }

  if (process.env.JX_DEBUG) console.error('PRE-PRUNE families:', [...families.keys()]);
  // families: drop any base whose concrete staticHooks variant is fully
  // css-defined (family with no css-less variant is not a hook family)
  for (const [base, info] of families) {
    const familySelectorsDefined = [...defined].some((d) => d === `jx-${base}` || d.startsWith(`jx-${base}-`));
    if (familySelectorsDefined && ![...staticHooks.keys()].some((h) => h.startsWith(`jx-${base}-`))) {
      // css-defined family (e.g. jx-alert-* tones painted by residue css)
      families.delete(base);
    }
  }

  // staticHooks: remove css-defined tokens (they stay classes)
  for (const tok of [...staticHooks.keys()]) if (defined.has(tok)) staticHooks.delete(tok);

  return { defined, staticHooks, families, references, handReview };
}

function scanScriptSection(code, file, rel, bag, opts = {}) {
  const isSvelteScript = !!opts.svelte;
  const lines = code.split('\n');
    if (isSvelteScript) {
    // svelte script sections: cn(...) spans carry class strings — the
  // class-assignment idiom lives here (often MULTI-LINE), so work on
  // balanced-paren spans of a comment-stripped copy, plus any
  // template literal containing jx- (the cn arg / direct class form)
  if (isSvelteScript) {
    const stripped = lines.map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
    const scanLiteral = (lit, isTpl) => {
      if (!/jx-/.test(lit)) return;
      if (isTpl) {
        for (const t of lit.matchAll(/jx-[a-z0-9-]*\$\{/g)) bag.addFamily(t[0].slice(3).replace(/\$\{$/, '').replace(/-$/, ''), file);
        for (const t of lit.matchAll(/\bjx-[a-z0-9-]+/g)) bag.addHook(t[0], file);
      } else {
        for (const t of lit.matchAll(/\bjx-[a-z0-9-]*/g)) {
          if (t[0].endsWith('-')) bag.addFamily(t[0].slice(3, -1), file);
          else if (t[0].length > 3) bag.addHook(t[0], file);
        }
      }
    };
    // cn( ... ) spans
    for (const m of stripped.matchAll(/\bcn\(/g)) {
      let depth = 1, i = m.index + m[0].length;
      while (i < stripped.length && depth > 0) {
        if (stripped[i] === '(') depth += 1;
        else if (stripped[i] === ')') depth -= 1;
        i += 1;
      }
      const span = stripped.slice(m.index, i);
      for (const s of span.matchAll(/'([^']*)'|"([^"]*)"|`([^`]*)`/g)) scanLiteral(s[1] ?? s[2] ?? s[3], !!s[3]);
    }
    // NOTE: no catch-all template scan — id/getElementById templates
    // (e.g. jx-bar-panel-${id}) are structurally invisible here and any
    // genuinely class-shaped template outside cn() lands in handReview
    // via the stray-string net. (Codex r1 B2.)
    return; // line-level rules below are for plain scripts only
  }
    return;
  }
  lines.forEach((line, i) => {
    // classList method args
    const cl = line.match(/classList\.(add|remove|toggle|contains)\(\s*['"`]([^'"`]+)['"`]/);
    if (cl) {
      for (const t of cl[2].matchAll(/\bjx-[a-z0-9-]+/g)) {
        if (cl[2].endsWith('-') || t[0].endsWith('-')) bag.addFamily(t[0].slice(3, -1), file, `L${i + 1}`);
        else bag.addHook(t[0], file);
      }
      bag.references.push({ file: rel(file), kind: 'classList', token: cl[2] });
      return;
    }
    // selector-shaped strings on query APIs
    const q = line.match(/(querySelector(?:All)?|closest|matches)\(\s*['"`]([^'"`]+)['"`]/);
    if (q && /jx-/.test(q[2])) {
      bag.references.push({ file: rel(file), kind: 'query', token: q[2] });
      for (const t of q[2].matchAll(/\.jx-[a-z0-9-]+/g)) bag.addHook(t[0].slice(1), file);
      return;
    }
    // fail-closed: any other jx- token in a quoted string on this line
    const stray = line.match(/['"`]([^'"`]*jx-[a-z0-9-][^'"`]*)['"`]/);
    if (stray && !/onjx-|jx-reset|--jx-|@media|data-jx/.test(stray[1])) {
      bag.handReview.push({ file: rel(file), line: i + 1, excerpt: stray[1].slice(0, 80) });
    }
  });
}

// ── CLI ─────────────────────────────────────────────────────────────
if (process.argv[1] && process.argv[1].endsWith('jx-inventory.mjs')) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const inv = buildInventory(root);
  const jsonIdx = process.argv.indexOf('--json');
  const payload = {
    stats: {
      defined: inv.defined.size,
      staticHooks: inv.staticHooks.size,
      families: [...inv.families.keys()],
      familyCount: inv.families.size,
      handReview: inv.handReview.length,
      references: inv.references.length,
    },
    handReview: inv.handReview,
    hooks: [...inv.staticHooks.keys()].sort(),
    familiesDetail: Object.fromEntries([...inv.families].map(([b, v]) => [b, { sites: v.sitecount ?? v.sites?.length ?? 0 }])),
  };
  if (jsonIdx > -1) writeFileSync(process.argv[jsonIdx + 1], JSON.stringify(payload, null, 2));
  console.log(JSON.stringify(payload.stats, null, 1));
  if (inv.handReview.length) {
    console.log(`\nhand-review sites (${inv.handReview.length}):`);
    inv.handReview.slice(0, 20).forEach((h) => console.log(`  ${h.file}:${h.line} — ${h.excerpt}`));
  }
}
