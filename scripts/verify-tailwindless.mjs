#!/usr/bin/env node
// verify-tailwindless — the tailwindless gate (2026-09-17-tailwindless-site
// tasks 1.1–1.5). ONE ratchet over the site's surviving utility-class
// identities: the AST census is PINNED (single writer: this script's
// --pin) into the allowlist instance, and --check re-extracts and
// fails on ANY growth — a new identity, a count increase, an
// equal-count identity swap, an unregistered dynamic class producer,
// a tier-2 literal in a .stylex.ts, an @utility added to jixoai.css,
// or a hand edit of the allowlist itself. Identity removal and file
// zeroing are LEGAL — that is the migration direction.
//
// Gate-4 hardening (2026-09-16, Codex adversarial review): the gate
// also fails on (1) a canonically re-serialized tamper of the
// allowlist's CONTRACT blocks — producers[]/semantics[] are deep-
// compared against THIS script's own definitions, so an edit that
// survives the canonical-format check still goes red; and (2) a
// spoofed .stylex channel — the import suffix alone proves nothing:
// the source must resolve into a transform root AND the module must
// AST-verify a top-level stylex authoring call (stylex.create /
// defineVars / createTheme). Tier-2 coverage grew the token-bound
// families with the weight/radius/shadow/motion/leading slots; the
// probe-corpus occurrences that predate the extension are frozen in
// the explicit, count-bounded TIER2_GRANDFATHER ledger (never a
// silent pass).
//
// Gate-5 hardening (2026-09-16, Codex round-5 adversarial pass — four
// more demonstrated bypasses, all closed here): (1) the allowlist's
// OWN budget was ratchetless — counts raised inside files[] and
// canonicalized sailed through; the pinned totals are now bounded by
// the script-embedded RATCHET constants (files/identities/
// occurrences/zones/forms — lifting a ceiling means editing the gate
// source, which is review-visible); (2) formsByFile was stripped as
// "census" and never compared — it is now deep-compared per file (no
// new rel, no new form, no padding past the forms budget) with the
// forms total riding the RATCHET; (3) a LEGAL stylex module could
// smuggle arbitrary producers as extra exports — the exemption is now
// per EXPORT: only authoring-call results (stylex.create / defineVars
// / createTheme) and STYLEX_MODULE_HELPERS-registered joiners (cx)
// are the stylex lane, every other export at a class position is an
// unregistered producer; (4) the tier-2 families grew
// animationDuration/animationDelay/animationTimingFunction, fontWeight
// widened to any 1..1000 value, quoted property keys parse exactly
// like identifier keys, and the TIER2_GRANDFATHER ledger gained the
// REVERSE check — a stale entry whose literal already migrated is RED
// until the entry is deleted.
//
//   node scripts/verify-tailwindless.mjs --pin       # write the allowlist instance
//   node scripts/verify-tailwindless.mjs --check     # the gate (verify:tailwindless)
//   node scripts/verify-tailwindless.mjs --selftest  # negative fixtures (the thirteen reds)
//
// AST BOUNDARY (what the extractor reads — see allowlist.exclusions):
//   * Svelte markup: `class=` attribute parts (Text chunks + the string
//     literal fragments of its expressions) and `class:` directives;
//     each-scope bindings ({#each [a, b] as [x, y]}) resolve to their
//     literal arrays. Doc-sample channels are excluded BY CONSTRUCTION
//     — the CodeBlock `code` prop and backtick usage strings are
//     attributes/consts that never reach a class position (plus a
//     component-name blacklist on doc props as the recorded guard).
//   * TS (script blocks of .svelte + standalone .ts/.js): every
//     cn()/clsx() call site's arguments, positionally resolved
//     (ternary branches, && right side, || both sides, `+` concat
//     operands, array elements, object VALUES, template chunks —
//     comparison operands are never class values, so `d.shape ===
//     'pill' && 'rounded-full'` counts ONLY 'rounded-full').
//   * dynamic producers, REGISTERED by module+name: cn()/clsx()
//     (passthrough — the pinned global union is their legal set) and
//     resolveTextStyle() (registry/files/lib/text-style.svelte.ts —
//     its emission forms are enumerated from source and frozen; the
//     stylex runtime seam (stylex.create / stylex.attrs namespaces)
//     is the destination lane, pattern-exempt). A call/identifier at
//     a class position that cannot be accounted (imported helpers,
//     computed producers) is RED: unregistered producer.
//   * mirrors: apps/www/src/lib/ui/X ≡ registry/files/ui/X and
//     apps/www/src/lib/X ≡ registry/files/{lib,theme}/X share ONE
//     entry under the registry-side path (byte-twins by construction;
//     drifted sides union into the entry so www-side growth is seen).
//
// The parsers ride the REAL toolchain — svelte/compiler and typescript
// from apps/www/node_modules (no new dependency, no install).

import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, posix, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REAL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const wwwRequire = createRequire(join(REAL_ROOT, 'apps/www/package.json'));
const { parse: svelteParse } = wwwRequire('svelte/compiler');
const ts = wwwRequire('typescript');

const ALLOWLIST_REL = 'openspec/changes/2026-09-17-tailwindless-one-shot/research/tailwindless-allowlist.json';
// the one-shot change ARCHIVED at the phase-1 wrap: the frozen archive
// copy became the allowlist's canonical home (archives are history —
// never written). --check prefers a live forward copy if a future
// change re-opens one, else reads the archive; --pin always writes
// the LIVE path (so re-pinning can never mutate the archive).
const ALLOWLIST_ARCHIVE_REL = 'openspec/changes/archive/2026-09-17-tailwindless-one-shot/research/tailwindless-allowlist.json';
const allowlistPathFor = (root) => {
  const live = join(root, ALLOWLIST_REL);
  if (existsSync(live)) return live;
  const archived = join(root, ALLOWLIST_ARCHIVE_REL);
  if (existsSync(archived)) return archived;
  return live; // neither exists: report against the live path (the --pin target)
};
const TEXT_STYLE_REL = 'registry/files/lib/text-style.svelte.ts';
const TEXT_STYLE_MIRROR_REL = 'apps/www/src/lib/text-style.svelte.ts';
const JX_CSS_REL = 'apps/www/src/lib/jixoai.css';
const JX_CSS_MIRROR_REL = 'registry/files/theme/jixoai.css';
const GENERATOR = 'scripts/verify-tailwindless.mjs --pin';

// registered dynamic producers matched by module+name at call sites
// (the producers[] registry in the allowlist instance); cn()/clsx are
// handled inline as the class-composition seams
const REGISTERED_PRODUCER_CALLS = new Set(['resolveTextStyle']);
const REGISTERED_PRODUCER_MODULES = {
  resolveTextStyle: /text-style(?:\.svelte(?:\.ts)?)?$/, // '$lib/text-style.svelte' / './text-style.svelte.ts'
};

// pure string/array transforms over ACCOUNTED receivers: the receiver
// is recursed as a value position and literal args counted — the
// ratchet over-approximates (pre-transform tokens stay frozen until
// migration removes the whole expression)
const STRING_METHODS = new Set([
  'replace', 'replaceAll', 'trim', 'trimStart', 'trimEnd', 'concat', 'padStart', 'padEnd',
  'toLowerCase', 'toUpperCase', 'normalize', 'slice', 'substring', 'split', 'flat',
  'join', 'filter', 'map', 'flatMap', 'entries', 'keys', 'values', 'reduce', 'at', 'includes',
]);
// global utility roots: never class producers themselves
const GLOBAL_UTILITY_OBJECTS = new Set(['Object', 'String', 'Array', 'JSON', 'Math', 'Number', 'Promise', 'Boolean']);
const GLOBAL_VALUE_NAMES = new Set(['undefined', 'null', 'true', 'false', 'NaN', 'Infinity', 'globalThis', 'arguments', 'window', 'document', 'console', ...GLOBAL_UTILITY_OBJECTS]);

// doc-sample component/prop blacklist (recorded guard; the extractor
// never reads non-class attributes, so these channels are excluded by
// construction — CodeBlock `code` per the P0 ruling)
const DOC_PROP_BLACKLIST = {
  CodeBlock: ['code', 'usage', 'demo'],
  ComponentCanvas: ['files', 'content'],
  PropsTable: ['props', 'meta'],
};

// theme-able .stylex.ts property families (tier-2 — token-bound only);
// structural geometry (display, flexDirection, blockSize, width, …)
// lives OUTSIDE these families and stays lawful as literals.
// THEME_PROP_RE carries the LENGTH families; the Gate-4 extension
// (weight/radius/shadow/motion/leading) lives in tier2KeyOf below,
// each with its own literal shape — and its own deliberate exclusions:
// motion-kill values ('none', 0ms/0s) and mask/gradient geometry
// strings are STRUCTURE, not theme slots; a var()-chain shadow already
// eats tokens (only a hardcoded length fragment makes it tier-2).
const THEME_PROP_RE =
  /^(?:padding|margin|gap)(?:Top|Right|Bottom|Left|Inline|Block|InlineStart|InlineEnd|BlockStart|BlockEnd)?$|^(?:fontSize|letterSpacing|lineHeight|color|backgroundColor|borderColor)$|^border(?:Top|Right|Bottom|Left|Inline|Block)?Width$/;
const LENGTH_LITERAL_RE = /^-?(?:\d+\.?\d*|\.\d+)(?:px|em|rem)$/;
// Gate-4 family shapes:
const UNITLESS_NUMBER_RE = /^\d+(?:\.\d+)?$/; // the leading multiplier: lineHeight 1.6 (numeric literal text matches too)
// Gate-5: fontWeight widened from the [1-9]00 steps to ANY 1..1000
// value, numeric literal or string numeric (the Codex attack planted
// 550 — a non-step weight — and rode the gap); keywords stay tier-2.
const FONT_WEIGHT_NUMERIC_RE = /^(?:[1-9]\d{0,2}|1000)(?:\.\d+)?$/; // 1..1000 — '550' / 550 / '550.5' alike
const FONT_WEIGHT_KEYWORD_RE = /^(?:normal|bold|bolder|lighter)$/;
const RADIUS_LITERAL_RE = /^(?:-?(?:\d+\.?\d*|\.\d+)(?:px|em|rem)|\d+(?:\.\d+)?%)$/; // calc(infinity*1px)/inherit are geometry, not scale steps
const DURATION_RE = /^(?!0+(?:\.\d+)?(?:ms|s)$)\d+(?:\.\d+)?(?:ms|s)$/; // zero = the motion-kill (reduced-motion freeze law) — structural
const EASING_RE = /^(?:linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|cubic-bezier\([^)]*\)|steps\([^)]*\))$/;
const SHADOW_LENGTH_RE = /-?\d+(?:\.\d+)?(?:px|em|rem)\b/; // a pure var() fallback chain carries no lengths — it already eats tokens
const COMPOSITE_DURATION_RE = /\b(?:[1-9]\d*|\d*[1-9]\d*)(?:\.\d+)?m?s\b/; // non-zero duration inside a shorthand
const COMPOSITE_EASING_RE = /\b(?:linear|ease-in-out|ease-in|ease-out|ease|step-start|step-end)\b|cubic-bezier\s*\(|steps\s*\(/;
// W1b fix (2026-09-17): strip var() references (seam form included —
// the fallback IS the sanctioned seam law) before the composite
// substring tests, else `var(--motion-ease-out)` — a LEGAL token
// consumption — trips the easing word boundary inside the token NAME
// (first seen as batch A's transition shorthands going red while
// riding the promoted motion tokens).
const STRIP_VAR_REFS = (value) => value.replace(/var\([^)]*\)/g, 'var()');

// tier-2 key for a (prop, literal-text) pair, or null when the slot is
// not theme-bound. `value` is the literal's TEXT — string literal or
// numeric literal alike (the shapes above are text shapes, so '600'
// and 600 both match FONT_WEIGHT_RE). A key means token-bound-only:
// a fresh literal is RED, the grandfathered probe-corpus occurrences
// below are the frozen debt.
function tier2KeyOf(prop, value) {
  if (THEME_PROP_RE.test(prop)) {
    if (LENGTH_LITERAL_RE.test(value)) return `${prop}:${value}`;
    if (prop === 'lineHeight' && UNITLESS_NUMBER_RE.test(value)) return `${prop}:${value}`; // unitless leading is a theme slot
    return null;
  }
  if (prop === 'fontWeight') return (FONT_WEIGHT_NUMERIC_RE.test(value) || FONT_WEIGHT_KEYWORD_RE.test(value)) ? `${prop}:${value}` : null;
  if (prop === 'borderRadius') return RADIUS_LITERAL_RE.test(value) ? `${prop}:${value}` : null;
  if (prop === 'transitionDuration') return DURATION_RE.test(value) ? `${prop}:${value}` : null;
  if (prop === 'transitionTimingFunction') return EASING_RE.test(value) ? `${prop}:${value}` : null;
  if (prop === 'boxShadow') return SHADOW_LENGTH_RE.test(value) ? `${prop}:${value}` : null;
  if (prop === 'transition') {
    const stripped = STRIP_VAR_REFS(value);
    return COMPOSITE_DURATION_RE.test(stripped) || COMPOSITE_EASING_RE.test(stripped) ? `${prop}:${value}` : null; // 'none' passes
  }
  // Gate-5: the animation slot families (the Codex attack planted
  // animationDuration: 1ms and rode the coverage gap)
  if (prop === 'animationDuration' || prop === 'animationDelay') return DURATION_RE.test(value) ? `${prop}:${value}` : null;
  if (prop === 'animationTimingFunction') return EASING_RE.test(value) ? `${prop}:${value}` : null;
  return null;
}

// the Gate-4 family extension's frozen debt: probe-corpus occurrences
// that predate the extension (the pinned tier-2 block has no entry for
// them — the extension itself is what makes them visible). EXPLICIT
// and count-bounded, never a silent pass: the same literal anywhere
// else, or a count above these numbers, is RED. When a ledger entry's
// literal migrates to a token, DELETE the entry — a stale entry
// re-opens the slot it froze. Gate-5 made that law MECHANICAL: the
// reverse check reds any entry whose literal no longer exists in the
// current source (a fully-migrated file must have its section
// emptied; a retired FILE sleeps — no file, no debt). The Gate-5
// animation-slot extension froze press-button's five animation
// literals below (measured 2026-09-16, same census as the scan).
const TIER2_GRANDFATHER = {
  'apps/www/src/lib/__probe__/stylex-corpus/code-card.stylex.ts': {
    'lineHeight:1.6': 1,
    'transitionDuration:150ms': 2,
    'transitionTimingFunction:ease-out': 2,
  },
  'apps/www/src/lib/__probe__/stylex-corpus/demo.stylex.ts': {
    'fontWeight:600': 1,
    'lineHeight:1.6': 1,
  },
  'apps/www/src/lib/__probe__/stylex-corpus/popover.stylex.ts': {
    'fontWeight:500': 1,
    'transition:translate 150ms ease-out, box-shadow 150ms ease-out, background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out': 1,
    'transitionDuration:150ms': 1,
    'transitionTimingFunction:ease-out': 1,
  },
  'apps/www/src/lib/__probe__/stylex-corpus/press-button.stylex.ts': {
    'fontWeight:500': 1,
    'transition:translate 150ms ease-out, box-shadow 150ms ease-out, background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out': 1,
    'animationDuration:800ms': 1,
    'animationTimingFunction:steps(1)': 1,
    'animationDelay:200ms': 1,
    'animationDelay:400ms': 1,
    'animationDelay:600ms': 1,
  },
  'apps/www/src/lib/__probe__/stylex-corpus/prose.stylex.ts': {
    'lineHeight:1.6': 1,
  },
  'apps/www/src/lib/__probe__/stylex-corpus/range.stylex.ts': {
    'fontWeight:700': 1,
  },
  'apps/www/src/lib/__probe__/stylex-corpus/switch.stylex.ts': {
    'boxShadow:0 0 0 1px var(--jx-border) inset': 1,
    'boxShadow:0 0 0 1px var(--jx-primary) inset': 1,
  },
};

// a stylex channel source, post-Gate-4: EITHER the runtime itself
// (@stylexjs/* — the engine seam, stylex.create/.attrs/… namespaces)
// OR an authored atom module — a `.stylex` import that (a) resolves
// into a transform root (apps/www/src/lib | registry/files) AND
// (b) AST-verifies as a real atom module: a @stylexjs import plus a
// TOP-LEVEL authoring call (stylex.create / defineVars / createTheme —
// create is the gate's minimum bar; defineVars/createTheme because the
// tokens three-copy IS a transform-root stylex module). The bare
// filename suffix was a spoofable channel (an evil.stylex.ts dynamic
// class producer rode it); now the module must PROVE itself, and
// anything else is an unregistered producer.
const STYLEX_RUNTIME_SOURCE_RE = /^@stylexjs\//;
const STYLEX_SUFFIX_RE = /\.stylex(?:\.[cm]?[jt]s)?$/;
const STYLEX_TRANSFORM_ROOTS = ['apps/www/src/lib/', 'registry/files/'];
const STYLEX_AUTHORING_CALLS = new Set(['create', 'defineVars', 'createTheme']);
const STYLEX_MODULE_CACHE = new Map(); // `${root}::${rel}::${mtime}::${size}` → boolean (mutation-safe across pin/check in one process)

// resolve a `.stylex` import specifier (as written at the import site)
// against the importing file → repo-relative path inside a transform
// root, or null. `$lib/` is the svelte alias for apps/www/src/lib.
function resolveStylexSource(root, importerRel, source) {
  let base = null;
  if (source.startsWith('$lib/')) base = `apps/www/src/lib/${source.slice('$lib/'.length)}`;
  else if (source.startsWith('./') || source.startsWith('../')) base = posix.normalize(posix.join(posix.dirname(importerRel), source));
  else return null; // bare specifier — only the runtime arm can carry it
  if (!STYLEX_SUFFIX_RE.test(base)) return null;
  for (const cand of [base, `${base}.ts`, `${base}.js`, `${base}.mjs`, `${base}.cjs`]) {
    if (STYLEX_TRANSFORM_ROOTS.some((zone) => cand.startsWith(zone)) && existsSync(join(root, cand))) return cand;
  }
  return null;
}

// AST-verify an authored atom module: a @stylexjs import binding a
// local name, and a top-level statement whose root expression is an
// authoring call on that name (const/export const/export default —
// the `export const styles = stylex.create({...})` corpus shape).
function stylexModuleVerified(root, rel) {
  let stat;
  try { stat = statSync(join(root, rel)); } catch { return false; }
  const key = `${root}::${rel}::${stat.mtimeMs}::${stat.size}`;
  const cached = STYLEX_MODULE_CACHE.get(key);
  if (cached !== undefined) return cached;
  let verified = false;
  try {
    const src = readFileSync(join(root, rel), 'utf8');
    const sf = ts.createSourceFile(rel, src, ts.ScriptTarget.Latest, true, /\.(?:m|c)?js$/.test(rel) ? ts.ScriptKind.JS : ts.ScriptKind.TS);
    const stylexNames = new Set();
    for (const stmt of sf.statements) {
      if (!ts.isImportDeclaration(stmt) || !stmt.importClause || !STYLEX_RUNTIME_SOURCE_RE.test(stmt.moduleSpecifier.text)) continue;
      const clause = stmt.importClause;
      if (clause.name) stylexNames.add(clause.name.text);
      const bindings = clause.namedBindings;
      if (!bindings) continue;
      if (ts.isNamespaceImport(bindings)) stylexNames.add(bindings.name.text);
      else if (ts.isNamedImports(bindings)) for (const el of bindings.elements) stylexNames.add(el.name.text);
    }
    if (stylexNames.size) {
      const isAuthoringCall = (n) => {
        if (!n || !ts.isCallExpression(n)) return false;
        const e = n.expression;
        if (ts.isPropertyAccessExpression(e)) return ts.isIdentifier(e.expression) && stylexNames.has(e.expression.text) && STYLEX_AUTHORING_CALLS.has(e.name.text);
        return ts.isIdentifier(e) && STYLEX_AUTHORING_CALLS.has(e.text) && stylexNames.has(e.text); // import { create } from '@stylexjs/stylex'
      };
      const unwrap = (e) => {
        let c = e;
        while (c && (ts.isAsExpression(c) || ts.isSatisfiesExpression(c) || ts.isTypeAssertionExpression(c) || ts.isParenthesizedExpression(c) || ts.isNonNullExpression(c))) c = c.expression;
        return c;
      };
      outer: for (const stmt of sf.statements) {
        const exprs = [];
        if (ts.isVariableStatement(stmt)) for (const d of stmt.declarationList.declarations) exprs.push(d.initializer);
        else if (ts.isExpressionStatement(stmt) || ts.isExportAssignment(stmt)) exprs.push(stmt.expression);
        for (const e of exprs) if (isAuthoringCall(unwrap(e))) { verified = true; break outer; }
      }
    }
  } catch { verified = false; }
  STYLEX_MODULE_CACHE.set(key, verified);
  return verified;
}

// Gate-5: per-EXPORT classification of an authored .stylex module —
// the module-level bar (a top-level authoring call SOMEWHERE) let a
// legal module smuggle arbitrary producers as extra exports (the
// Codex bypass-4 attack: `export const evil = (x) => ...` + a route
// consumer rode the module's exemption wholesale). A `.stylex`
// module's exports are on the stylex lane ONLY as (a) a direct
// authoring-call result (stylex.create / defineVars / createTheme,
// wraps unwrapped) or (b) a STYLEX_MODULE_HELPERS-registered joiner.
// Everything else — function, string constant, re-export, destructured
// export — is 'rogue': using it at a class position is an unregistered
// producer. The registry is the authority pattern (same as
// SEMANTIC_RULES): registering a helper means naming its nature here.
//
// EMPTY by the Wave-1 joiner ruling (tailwindless one-shot,
// 2026-09-17): a .stylex.ts module's only legal exports are
// stylex.create results — the cx joiner lives INSIDE each consuming
// component (the separator serialize law, string-passthrough
// superset form). The machinery + selftests stay for future
// deliberate exceptions; the timeline-docs pilot registration (the
// one entry this map ever held) retired with the unification pass.
const STYLEX_MODULE_HELPERS = {};
const STYLEX_EXPORT_CACHE = new Map(); // `${root}::${rel}::${mtime}::${size}` → Map(name → 'stylex'|'helper'|'rogue') | null

// classify every export of a transform-root .stylex module (null when
// the module fails the Gate-4 bar). Note: `export default` classifies
// under 'default'; a default-IMPORT binding resolves there via its
// importKind, so a rogue default export cannot hide either.
function stylexExportClasses(root, rel) {
  let stat;
  try { stat = statSync(join(root, rel)); } catch { return null; }
  const key = `${root}::${rel}::${stat.mtimeMs}::${stat.size}`;
  const cached = STYLEX_EXPORT_CACHE.get(key);
  if (cached !== undefined) return cached;
  let classes = null;
  if (stylexModuleVerified(root, rel)) {
    try {
      const src = readFileSync(join(root, rel), 'utf8');
      const sf = ts.createSourceFile(rel, src, ts.ScriptTarget.Latest, true, /\.(?:m|c)?js$/.test(rel) ? ts.ScriptKind.JS : ts.ScriptKind.TS);
      const stylexNames = new Set();
      for (const stmt of sf.statements) {
        if (!ts.isImportDeclaration(stmt) || !stmt.importClause || !STYLEX_RUNTIME_SOURCE_RE.test(stmt.moduleSpecifier.text)) continue;
        const clause = stmt.importClause;
        if (clause.name) stylexNames.add(clause.name.text);
        const bindings = clause.namedBindings;
        if (!bindings) continue;
        if (ts.isNamespaceImport(bindings)) stylexNames.add(bindings.name.text);
        else if (ts.isNamedImports(bindings)) for (const el of bindings.elements) stylexNames.add(el.name.text);
      }
      const isAuthoringCall = (n) => {
        if (!n || !ts.isCallExpression(n)) return false;
        const e = n.expression;
        if (ts.isPropertyAccessExpression(e)) return ts.isIdentifier(e.expression) && stylexNames.has(e.expression.text) && STYLEX_AUTHORING_CALLS.has(e.name.text);
        return ts.isIdentifier(e) && STYLEX_AUTHORING_CALLS.has(e.text) && stylexNames.has(e.text);
      };
      const unwrap = (e) => {
        let c = e;
        while (c && (ts.isAsExpression(c) || ts.isSatisfiesExpression(c) || ts.isTypeAssertionExpression(c) || ts.isParenthesizedExpression(c) || ts.isNonNullExpression(c))) c = c.expression;
        return c;
      };
      const helperNames = STYLEX_MODULE_HELPERS[rel] ?? {};
      const isFn = (n) => !!n && (ts.isArrowFunction(n) || ts.isFunctionExpression(n) || ts.isFunctionDeclaration(n));
      classes = new Map();
      const record = (name, node) => {
        if (!name) return;
        const init = unwrap(node);
        if (isAuthoringCall(init)) classes.set(name, 'stylex');
        else if (helperNames[name] && isFn(init)) classes.set(name, 'helper');
        else classes.set(name, 'rogue');
      };
      const hasExport = (stmt) => (stmt.modifiers ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      for (const stmt of sf.statements) {
        if (ts.isVariableStatement(stmt)) {
          if (!hasExport(stmt)) continue;
          for (const d of stmt.declarationList.declarations) {
            if (ts.isIdentifier(d.name)) record(d.name.text, d.initializer);
            else if (ts.isObjectBindingPattern(d.name) || ts.isArrayBindingPattern(d.name)) {
              for (const el of d.name.elements) if (el && ts.isIdentifier(el.name)) record(el.name.text, null); // destructured export — no single initializer: rogue
            }
          }
        } else if (ts.isFunctionDeclaration(stmt) && stmt.name && hasExport(stmt)) {
          record(stmt.name.text, stmt);
        } else if (ts.isClassDeclaration(stmt) && stmt.name && hasExport(stmt)) {
          record(stmt.name.text, null);
        } else if (ts.isExportAssignment(stmt)) {
          record('default', stmt.expression);
        } else if (ts.isExportDeclaration(stmt) && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
          for (const el of stmt.exportClause.elements) record(el.name.text, null); // re-export — unresolvable here: rogue
        }
      }
    } catch { classes = null; }
  }
  STYLEX_EXPORT_CACHE.set(key, classes);
  return classes;
}

// registered semantic rules (lane-2 composites — tailwindless-site
// task 3.3): recurring composite clusters authored in a sheet with
// owner + selector family + declaration scope recorded. A class name
// listed here is NOT a utility identity: the extractor exempts it
// (the spec's resolution order — atom vocabulary, REGISTERED
// semantic/producer identities, then the file's allowlist), and
// --pin writes the registry into the instance's semantics[] block.
// An unregistered lookalike stays red (it simply counts as a new
// identity). Growth of this list is a deliberate act: name the
// owner sheet, the selector family, and the declaration scope.
const SEMANTIC_RULES = [
  {
    id: 'pill',
    class: 'pill',
    owner: 'apps/www/src/lib/site/docs-tables.css',
    selector: ':where(.pill) — the catalog pill chip',
    scope: 'inline-flex chip: ground/border/ink tint recipe, radius, measure',
    registeredAt: '2026-09-17 (pre-existing site rule; registered by tailwindless-site P0 task 3.3)',
  },
  {
    id: 'tl-shell',
    class: 'tl-shell',
    owner: 'apps/www/src/lib/site/timeline-docs.css',
    selector: '.tl-shell — the docs page shell',
    scope: 'measure + rhythm: max-width, centered, padding-inline/block steps; registered media seams sm(40rem)/lg(64rem) re-pin the inline step',
    registeredAt: '2026-09-17 (tailwindless-site P0 pilot, task 3.3)',
  },
  {
    id: 'tl-eyebrow',
    class: 'tl-eyebrow',
    owner: 'apps/www/src/lib/site/timeline-docs.css',
    selector: '.tl-eyebrow — the canvas demo label voice (span)',
    scope: 'typography role: font-nav, primary ink, label size, uppercase, label tracking',
    registeredAt: '2026-09-17 (tailwindless-site P0 pilot, task 3.3)',
  },
  {
    id: 'tl-body',
    class: 'tl-body',
    owner: 'apps/www/src/lib/site/timeline-docs.css',
    selector: '.tl-body — the demo body voice (p, ul)',
    scope: 'typography role: small size + muted ink',
    registeredAt: '2026-09-17 (tailwindless-site P0 pilot, task 3.3)',
  },
  {
    id: 'tl-col',
    class: 'tl-col',
    owner: 'apps/www/src/lib/site/timeline-docs.css',
    selector: '.tl-col — the demo column (label over stage)',
    scope: 'layout: flex column with the 8px label-to-stage gap',
    registeredAt: '2026-09-17 (tailwindless-site P0 pilot, task 3.3)',
  },
  {
    id: 'tl-frame',
    class: 'tl-frame',
    owner: 'apps/www/src/lib/site/timeline-docs.css',
    selector: '.tl-frame — the bordered demo frame',
    scope: 'box: hairline-weight solid border on the border color role (padding composed as atoms)',
    registeredAt: '2026-09-17 (tailwindless-site P0 pilot, task 3.3)',
  },
  {
    id: 'tl-grid-3',
    class: 'tl-grid-3',
    owner: 'apps/www/src/lib/site/timeline-docs.css',
    selector: '.tl-grid-3 — the three-up demo grid',
    scope: 'layout: grid, 24px gutter; registered media seam min-1100px flips to 3 equal tracks (breakpoint-parity law: viewport seam stays a viewport media rule)',
    registeredAt: '2026-09-17 (tailwindless-site P0 pilot, task 3.3)',
  },
  {
    id: 'tl-grid-matrix',
    class: 'tl-grid-matrix',
    owner: 'apps/www/src/lib/site/timeline-docs.css',
    selector: '.tl-grid-matrix — the geometry matrix grid',
    scope: 'layout: grid, 24px gutter; registered media seams min-900px (2 tracks) and min-1300px (3 tracks)',
    registeredAt: '2026-09-17 (tailwindless-site P0 pilot, task 3.3)',
  },
  {
    id: 'tl-ctl',
    class: 'tl-ctl',
    classes: ['tl-ctl', 'tl-ctl--primary'], // the --primary accent is the family's BEM modifier
    owner: 'apps/www/src/lib/site/timeline-docs.css',
    selector: '.tl-ctl (+ .tl-ctl--primary accent) — the stepper control button',
    scope: 'control: radius/border/background/padding + the control-label voice; hover seams are NATIVE pseudos (outline variant → muted ground, primary variant → 0.9 opacity)',
    registeredAt: '2026-09-17 (tailwindless-site P0 pilot, task 3.3)',
  },
  // ── the W2 mass registration (2026-09-18) ────────────────────────────
  // The RESIDUAL batch proved the ui zone holds ZERO real Tailwind
  // utilities — every surviving identity is a css-law hook. These
  // entries are DERIVED, not hand-typed: a selector index over every
  // css file + svelte <style> block (lib + routes) resolved each
  // pinned hook identity to its owning law sheet; one entry per
  // owner. The derivation is reproducible (css selector index × the
  // pinned identities). Unregistered names left in the census are
  // TRUE utilities (routes zone — Wave 3's food) or already-deleted
  // orphans (cleared at this re-pin).
  {
    id: 'folder-css-probe-4',
    classes: ["jx-probe", "jx-probe-box", "jx-probe-frame", "jx-probe-lane"],
    owner: 'apps/www/src/lib/__probe__/folder-css-probe.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'code-block-1',
    classes: ["prompt"],
    owner: 'apps/www/src/lib/code-block.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'hue-popover-5',
    classes: ["jx-hue-content", "jx-hue-label", "jx-hue-play", "jx-hue-range", "jx-hue-trigger"],
    owner: 'apps/www/src/lib/components/hue-popover.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'overview-card-1',
    classes: ["jx-card-link"],
    owner: 'apps/www/src/lib/overview-card.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'playground-2',
    classes: ["jx-play-help", "jx-play-seg"],
    owner: 'apps/www/src/lib/playground/playground.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'docs-tables-1',
    classes: ["dim"],
    owner: 'apps/www/src/lib/site/docs-tables.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'token-lab-3',
    classes: ["hue-slider", "swatch", "swatch-chip"],
    owner: 'apps/www/src/lib/site/token-lab.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'a11y-table-1',
    classes: ["jx-a11y-heading"],
    owner: 'apps/www/src/lib/ui/a11y-table/a11y-table.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'accordion-item-2',
    classes: ["jx-acc-item", "jx-acc-summary"],
    owner: 'apps/www/src/lib/ui/accordion/accordion-item.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'accordion-1',
    classes: ["jx-accordion"],
    owner: 'apps/www/src/lib/ui/accordion/accordion.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'alert-1',
    classes: ["jx-alert-icon"],
    owner: 'apps/www/src/lib/ui/alert/alert.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'breadcrumb-1',
    classes: ["jx-bc-link"],
    owner: 'apps/www/src/lib/ui/breadcrumb/breadcrumb.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'card-7',
    classes: ["jx-card-end-action-slot", "jx-card-foot-cluster", "jx-card-foot-end", "jx-card-foot-grid", "jx-card-foot-start", "jx-card-head-content", "jx-card-head-face"],
    owner: 'apps/www/src/lib/ui/card/card.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'carousel-1',
    classes: ["jx-carousel-track"],
    owner: 'apps/www/src/lib/ui/carousel/carousel.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'cascader-1',
    classes: ["jx-cascader-select"],
    owner: 'apps/www/src/lib/ui/cascader/cascader.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'chart-8',
    classes: ["jx-chart-area", "jx-chart-glyphs", "jx-chart-grid", "jx-chart-mark", "jx-chart-path", "jx-chart-seg", "jx-chart-table", "jx-chart-track"],
    owner: 'apps/www/src/lib/ui/chart/chart.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'checkbox-1',
    classes: ["jx-check-lane"],
    owner: 'apps/www/src/lib/ui/checkbox/checkbox.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'code-card-2',
    classes: ["copied", "jx-code-card"],
    owner: 'apps/www/src/lib/ui/code-card/code-card.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'color-picker-4',
    classes: ["jx-color-picker-panel", "jx-color-picker-sv", "jx-color-picker-swatches", "jx-color-picker-trigger"],
    owner: 'apps/www/src/lib/ui/color-picker/color-picker.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'combobox-7',
    classes: ["jx-combobox-check", "jx-combobox-chevron", "jx-combobox-option", "jx-combobox-panel", "jx-combobox-shell", "jx-combobox-toggle", "jx-combobox-x-glyph"],
    owner: 'apps/www/src/lib/ui/combobox/combobox.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'command-1',
    classes: ["jx-command"],
    owner: 'apps/www/src/lib/ui/command/command.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'component-canvas-13',
    classes: ["jx-canvas-chevron", "jx-canvas-code-drawer", "jx-canvas-code-panels", "jx-canvas-code-toggle", "jx-canvas-code-view", "jx-canvas-copy-usage", "jx-canvas-dock-collapse", "jx-canvas-head-text", "jx-canvas-install", "jx-canvas-scroll", "jx-canvas-stage-row", "jx-canvas-tree", "jx-item"],
    owner: 'apps/www/src/lib/ui/component-canvas/component-canvas.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'date-picker-9',
    classes: ["jx-date-active", "jx-date-chevron", "jx-date-day", "jx-date-fill", "jx-date-grid", "jx-date-nav-btn", "jx-date-off", "jx-date-panel", "jx-date-trigger"],
    owner: 'apps/www/src/lib/ui/date-picker/date-picker.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'docs-pager-10',
    classes: ["jx-docs-pager", "jx-docs-pager-direction", "jx-docs-pager-label", "jx-docs-pager-next", "jx-docs-pager-related", "jx-docs-pager-title", "jx-docs-pager-wrap", "jx-dp-chip", "jx-dp-ico", "jx-dp-qual"],
    owner: 'apps/www/src/lib/ui/docs-pager.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'docs-sections-nav-1',
    classes: ["jx-dsn"],
    owner: 'apps/www/src/lib/ui/docs-sections-nav.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'docs-sections-nav-23',
    classes: ["jx-dsn-bar", "jx-dsn-bar-label", "jx-dsn-bar-row", "jx-dsn-bar-search", "jx-dsn-clear", "jx-dsn-count", "jx-dsn-current", "jx-dsn-empty", "jx-dsn-expand", "jx-dsn-expand-head", "jx-dsn-group", "jx-dsn-group-label", "jx-dsn-head", "jx-dsn-input", "jx-dsn-link", "jx-dsn-link-row", "jx-dsn-link-title", "jx-dsn-list", "jx-dsn-rail", "jx-dsn-search", "jx-dsn-sub", "jx-dsn-title", "jx-dsn-toggle"],
    owner: 'apps/www/src/lib/ui/docs-sections-nav.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'dropdown-menu-6',
    classes: ["jx-menu", "jx-menu-anchor", "jx-menu-caret", "jx-menu-item", "jx-menu-item-destructive", "jx-menu-trigger"],
    owner: 'apps/www/src/lib/ui/dropdown-menu/dropdown-menu.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'file-input-10',
    classes: ["jx-file", "jx-file-clear", "jx-file-icon", "jx-file-over", "jx-file-remove", "jx-file-row", "jx-file-trigger", "jx-file-zone", "jx-file-zone-glyph", "jx-file-zone-title"],
    owner: 'apps/www/src/lib/ui/file-input/file-input.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'float-button-1',
    classes: ["jx-fab-menu"],
    owner: 'apps/www/src/lib/ui/float-button/float-button.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'hero-section-1',
    classes: ["jx-hero-step"],
    owner: 'apps/www/src/lib/ui/hero-section/hero-section.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'input-otp-2',
    classes: ["jx-otp-complete", "jx-otp-slot"],
    owner: 'apps/www/src/lib/ui/input-otp/input-otp.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'input-14',
    classes: ["jx-clearable", "jx-floating", "jx-floating-label", "jx-html-clear", "jx-html-control-lane", "jx-html-control-shell", "jx-html-select", "jx-input-prefix-icon-button", "jx-input-reveal", "jx-input-suffix-icon-button", "jx-invalid", "jx-number-shell", "jx-picker-overlay", "jx-picker-panel"],
    owner: 'apps/www/src/lib/ui/input/input.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'item-6',
    classes: ["jx-item-field-description", "jx-item-field-error", "jx-item-field-icon", "jx-item-field-label", "jx-item-group", "jx-item-group-label"],
    owner: 'apps/www/src/lib/ui/list-item/item.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'markdown-2',
    classes: ["jx-pure", "no-jx-pure"],
    owner: 'apps/www/src/lib/ui/markdown/markdown.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'math-block-1',
    classes: ["scrollport"],
    owner: 'apps/www/src/lib/ui/math-block/math-block.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'menubar-3',
    classes: ["jx-menubar-menu-item", "jx-menubar-panel", "jx-menubar-trigger"],
    owner: 'apps/www/src/lib/ui/menubar/menubar.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'mermaid-3',
    classes: ["jx-mermaid", "jx-mermaid-copy", "jx-mermaid-zoom-btn"],
    owner: 'apps/www/src/lib/ui/mermaid/mermaid.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'number-input-3',
    classes: ["jx-num", "jx-num-btn", "jx-num-input"],
    owner: 'apps/www/src/lib/ui/number-input/number-input.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'pattern-cta-1',
    classes: ["jx-pattern-cta"],
    owner: 'apps/www/src/lib/ui/pattern-cta/pattern-cta.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'pattern-faq-3',
    classes: ["jx-man-label", "jx-man-leader", "jx-man-row"],
    owner: 'apps/www/src/lib/ui/pattern-faq/pattern-faq.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'pattern-hero-set-1',
    classes: ["jx-hero-marquee-track"],
    owner: 'apps/www/src/lib/ui/pattern-hero-set/pattern-hero-set.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'pattern-login-1',
    classes: ["jx-pattern-login"],
    owner: 'apps/www/src/lib/ui/pattern-login/pattern-login.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'popconfirm-1',
    classes: ["jx-pc"],
    owner: 'apps/www/src/lib/ui/popconfirm/popconfirm.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'popover-1',
    classes: ["jx-surface"],
    owner: 'apps/www/src/lib/ui/popover/popover.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'press-button-1',
    classes: ["jx-press-spin-frames"],
    owner: 'apps/www/src/lib/ui/press-button/press-button.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'progressive-blur-2',
    classes: ["jx-pblur", "jx-pblur-layer"],
    owner: 'apps/www/src/lib/ui/progressive-blur/progressive-blur.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'range-3',
    classes: ["jx-field", "jx-range-tick", "jx-slider-ticks"],
    owner: 'apps/www/src/lib/ui/range/range.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'scroll-area-4',
    classes: ["jx-scroll-thumb", "jx-scroll-track", "x", "y"],
    owner: 'apps/www/src/lib/ui/scroll-area/scroll-area.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'scroll-run-1',
    classes: ["jx-scroll-host"],
    owner: 'apps/www/src/lib/ui/scroll-run/scroll-run.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'search-palette-1',
    classes: ["jx-search-heading"],
    owner: 'apps/www/src/lib/ui/search-palette.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'search-palette-1',
    classes: ["jx-flight"],
    owner: 'apps/www/src/lib/ui/search-palette.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'select-5',
    classes: ["jx-sel-chevron", "jx-sel-list", "jx-sel-option", "jx-sel-panel", "jx-sel-trigger"],
    owner: 'apps/www/src/lib/ui/select/select.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'sheet-2',
    classes: ["closing", "jx-sheet"],
    owner: 'apps/www/src/lib/ui/sheet/sheet.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'spin-1',
    classes: ["jx-spin-frame"],
    owner: 'apps/www/src/lib/ui/spin/spin.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'tabs-trigger-2',
    classes: ["jx-tabs-horizontal", "jx-tabs-run"],
    owner: 'apps/www/src/lib/ui/tabs/tabs-trigger.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'tags-input-6',
    classes: ["jx-tags-flash", "jx-tags-panel", "jx-tags-remove", "jx-tags-shell", "jx-tags-suggestion", "jx-tags-tag"],
    owner: 'apps/www/src/lib/ui/tags-input/tags-input.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'terminal-card-2',
    classes: ["jx-out", "jx-out-shown"],
    owner: 'apps/www/src/lib/ui/terminal-card/terminal-card.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'terminal-footer-1',
    classes: ["jx-footer-ghost"],
    owner: 'apps/www/src/lib/ui/terminal-footer/terminal-footer.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'terminal-header-7',
    classes: ["jx-bar", "jx-caret", "jx-group", "jx-light", "jx-nav", "jx-pop", "jx-sub-link"],
    owner: 'apps/www/src/lib/ui/terminal-header/terminal-header.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'toast-4',
    classes: ["jx-press", "jx-toast", "jx-toast-leaving", "paused"],
    owner: 'apps/www/src/lib/ui/toast/toast.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'toc-10',
    classes: ["jx-cursor", "jx-spine", "jx-spine-fill", "jx-toc", "jx-toc-aside", "jx-toc-desktop", "jx-toc-mobile", "jx-toc-title", "jx-toggle", "jx-viewport"],
    owner: 'apps/www/src/lib/ui/toc/toc.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'toggle-group-1',
    classes: ["jx-tgroup-item"],
    owner: 'apps/www/src/lib/ui/toggle-group/toggle-group.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'tooltip-1',
    classes: ["jx-tip-shadow"],
    owner: 'apps/www/src/lib/ui/tooltip/tooltip.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'tour-3',
    classes: ["jx-tour", "jx-tour-hole", "jx-tour-hole-anchored"],
    owner: 'apps/www/src/lib/ui/tour/tour.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'transfer-5',
    classes: ["jx-tr-move", "jx-tr-movers", "jx-tr-row", "jx-tr-search", "jx-transfer"],
    owner: 'apps/www/src/lib/ui/transfer/transfer.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'tree-view-9',
    classes: ["jx-tree", "jx-tree-caret", "jx-tree-check", "jx-tree-group", "jx-tree-lines", "jx-tree-row", "jx-tree-suffix", "jx-tree-typeicon", "selected"],
    owner: 'apps/www/src/lib/ui/tree-view/tree-view.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'website-scaffold-8',
    classes: ["jx-chrome-slot", "jx-float-slot", "jx-scaffold-header", "jx-shell", "jx-shell-body", "jx-shell-host", "jx-skip-link", "jx-top-layer"],
    owner: 'apps/www/src/lib/ui/website-scaffold/website-scaffold.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+layout-1',
    classes: ["jx-logo-breath"],
    owner: 'apps/www/src/routes/+layout.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-1',
    classes: ["bp-stage"],
    owner: 'apps/www/src/routes/blueprints.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-1',
    classes: ["jx-anchor-demo-aside"],
    owner: 'apps/www/src/routes/docs/components/anchor.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-1',
    classes: ["jx-grid-hint"],
    owner: 'apps/www/src/routes/docs/components/card-grid.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-2',
    classes: ["jx-demo-num", "jx-demo-slide"],
    owner: 'apps/www/src/routes/docs/components/carousel.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-3',
    classes: ["desc-card", "desc-card-head", "desc-frame-rig"],
    owner: 'apps/www/src/routes/docs/components/descriptions.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-2',
    classes: ["jx-fab-menu-item", "jx-fab-stage"],
    owner: 'apps/www/src/routes/docs/components/float-button.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'doc-link-1',
    classes: ["doc-link-glyph"],
    owner: 'apps/www/src/routes/docs/components/markdown.html/doc-link.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-1',
    classes: ["jx-demo-nav-link"],
    owner: 'apps/www/src/routes/docs/components/navigation-menu.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-5',
    classes: ["jx-try-cell", "jx-try-grid", "jx-try-on", "pop-row", "pop-row-destructive"],
    owner: 'apps/www/src/routes/docs/components/popover.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-1',
    classes: ["jx-float-diagram"],
    owner: 'apps/www/src/routes/docs/components/scaffold-float.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-5',
    classes: ["jx-log", "jx-log-line", "jx-matrix-doc", "jx-meta-item", "jx-meta-rail"],
    owner: 'apps/www/src/routes/docs/components/scroll-area.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-1',
    classes: ["jx-vrow"],
    owner: 'apps/www/src/routes/docs/components/scroll-virtual.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-10',
    classes: ["badge", "doc-link", "frame-rig", "meter", "meter-fill", "meter-value", "prio", "who", "who-host", "who-name"],
    owner: 'apps/www/src/routes/docs/components/table.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-8',
    classes: ["jx-tour-demo-grid", "jx-tour-quadrant-grid", "tour-dot", "tour-dot-on", "tour-place-left", "tour-place-right", "tour-place-top", "tour-scroll-surface"],
    owner: 'apps/www/src/routes/docs/components/tour.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-2',
    classes: ["jx-demo-act", "jx-tree-pane"],
    owner: 'apps/www/src/routes/docs/components/tree-view.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-1',
    classes: ["jx-arch-diagram"],
    owner: 'apps/www/src/routes/docs/components/website-scaffold.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-23',
    classes: ["fx-band", "fx-color", "fx-color-input", "fx-color-token", "fx-colors", "fx-host", "fx-host-fill", "fx-host-pill", "fx-host-tile", "fx-stage", "fx-stage-band", "glass-band", "glass-band-bg", "glass-band-grid", "glass-band-text", "glass-band-text-track", "glass-box", "glass-chip", "glass-chrome", "glass-content", "glass-ink", "glass-live", "glass-meta"],
    owner: 'apps/www/src/routes/docs/effects.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-2',
    classes: ["demo-glyph", "jx-derivation-diagram"],
    owner: 'apps/www/src/routes/docs/icons.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-1',
    classes: ["jx-sample-index"],
    owner: 'apps/www/src/routes/docs/llms-txt.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-2',
    classes: ["jx-wm-layer", "jx-wm-stage"],
    owner: 'apps/www/src/routes/docs/recipes.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-6',
    classes: ["jx-inv-cmd", "jx-inv-docs", "jx-inv-name", "jx-invhead", "jx-invrow", "jx-invtable"],
    owner: 'apps/www/src/routes/docs/registry.html/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: '+page-1',
    classes: ["p-stage"],
    owner: 'apps/www/src/routes/prototypes/list-item-fusion/+page.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'fusion-7',
    classes: ["fusion", "fusion-context", "fusion-ladder", "fusion-narrow", "fusion-pane-mid", "fusion-pane-mid2", "p-ladder-caption"],
    owner: 'apps/www/src/routes/prototypes/list-item-fusion/lib/fusion.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'section-3',
    classes: ["p-section", "p-section-hint", "p-section-title"],
    owner: 'apps/www/src/routes/prototypes/list-item-fusion/lib/section.svelte',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'jixoai-9',
    classes: ["jx-clear-glyph", "jx-html-checkbox", "jx-html-input", "jx-html-radio", "jx-html-range", "jx-html-tgroup", "jx-surface-body", "jx-surface-shadow", "jx-waapi"],
    owner: 'registry/files/theme/jixoai.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'jx-pure-12',
    classes: ["jx-button", "jx-color-expand", "jx-color-shell", "jx-color-swatch", "jx-control", "jx-error", "jx-error-mark", "jx-label", "jx-slider", "jx-slotted", "jx-switch-lg", "jx-switch-sm"],
    owner: 'registry/files/theme/jx-pure.css',
    selector: 'derived — every class above appears as a selector in the owner sheet',
    scope: 'the owner sheet owns the hook paint laws (the W2 derivation)',
    registeredAt: '2026-09-18 (W2 mass registration, derived)',
  },
  {
    id: 'jx-hue-error',
    classes: ["jx-hue-error", "jx-hue-info", "jx-hue-success"],
    owner: 'registry/files/theme/jixoai.css',
    selector: 'manual entry — the STATUS injection vocabulary — engine-generated @utility family',
    scope: 'the STATUS injection vocabulary — engine-generated @utility family (jx-hue-primary/neutral/error/…); W4 converts the @utility to plain classes, the vocabulary stays',
    registeredAt: '2026-09-18 (W2 manual registration)',
  },
  {
    id: 'vscroll',
    classes: ["vscroll"],
    owner: 'apps/www/test/code-card.spec.ts',
    selector: 'manual entry — documented semantic hook, spec-consumed',
    scope: 'documented semantic hook, spec-consumed (the scroll affordance lane)',
    registeredAt: '2026-09-18 (W2 manual registration)',
  },
  {
    id: 'jx-tabs-vertical',
    classes: ["jx-tabs-vertical"],
    owner: 'apps/www/test/tabs-indicator.spec.ts',
    selector: 'manual entry — documented semantic hook, spec-consumed',
    scope: 'documented semantic hook, spec-consumed (the vertical posture stamp)',
    registeredAt: '2026-09-18 (W2 manual registration)',
  },
  {
    id: 'jx-tab-selected',
    classes: ["jx-tab-selected"],
    owner: 'apps/www/test/tabs-indicator.spec.ts',
    selector: 'manual entry — documented semantic hook, spec-consumed',
    scope: 'documented semantic hook, spec-consumed (selection stamp; paint moved to the inkSelected atom)',
    registeredAt: '2026-09-18 (W2 manual registration)',
  },
  {
    id: 'jx-canvas-output',
    classes: ["jx-canvas-output"],
    owner: 'apps/www/test/canvas-playground.spec.ts',
    selector: 'manual entry — documented semantic hook, spec-consumed',
    scope: 'documented semantic hook, spec-consumed (the playground output lane)',
    registeredAt: '2026-09-18 (W2 manual registration)',
  },
  {
    id: 'jx-sheet-',
    classes: ["jx-sheet-"],
    owner: 'apps/www/src/lib/ui/sheet/sheet.css',
    selector: 'manual entry — the static stem of the `jx-sheet-${side}` template block — sheet.css owns the .jx-sheet-{side}[open] laws',
    scope: 'the static stem of the `jx-sheet-${side}` template block — sheet.css owns the .jx-sheet-{side}[open] laws',
    registeredAt: '2026-09-18 (W2 manual registration)',
  },
  {
    id: 'docs-tables-laws',
    classes: ['data-table', 'table-scroll'],
    owner: 'apps/www/src/lib/site/docs-tables.css',
    selector: 'the :where(.data-table)/:where(.table-scroll) family — the W3-sweep derivation',
    scope: 'the docs tables sheet owns both (the pill precedent, same sheet)',
    registeredAt: '2026-09-18 (W3 final sweep)',
  },
  {
    id: 'w3-sweep-page-hooks',
    classes: ['demo-cell', 'caret', 'row-selected', 'odd', 'active'],
    owner: 'apps/www/src/routes/docs/components/table.html/+page.svelte + scroll-virtual.html + scroll-area.html',
    selector: 'manual entry — page <style> keys + the CardGrid demo-grid semantic marker',
    scope: 'demo-cell is the CardGrid demo marker paired with data-no-subgrid (no css owner by design); caret/row-selected key the table page styles; odd/active key the scroll pages',
    registeredAt: '2026-09-18 (W3 final sweep)',
  },
  {
    id: 'w3-page-hooks',
    classes: ['jx-ext-ico', 'jx-ico-18', 'input-fg-hi'],
    owner: 'apps/www/src/routes/+layout.svelte (the first two) + apps/www/src/routes/docs/components/input.html/+page.svelte',
    selector: 'manual entry — W3 page-scoped <style> keys',
    scope: 'page <style> keyed hooks minted by the W3 batches (the svg-size lanes and the foreground !important escape — the W2 derivation pattern applied to the wave its own pages created)',
    registeredAt: '2026-09-18 (W3 integration)',
  },
  {
    id: 'dark-scope',
    classes: ['dark'],
    owner: 'registry/files/theme/jixoai.css',
    selector: 'manual entry — the theme dark-scope stamp',
    scope: 'terminal surfaces force the dark scope locally (the bar is always dark — component-canvas, terminal-card, terminal-header stamp class=dark; the sheet owns the .dark block)',
    registeredAt: '2026-09-18 (W2 manual registration — the ui zone closer)',
  },
  {
    id: 'jx-range',
    classes: ["jx-range"],
    owner: 'apps/www/src/lib/ui/range/range.css',
    selector: 'manual entry — the family stem',
    scope: 'the family stem (the mount rides data-jx-range; range.css owns the .jx-range-tick ladder)',
    registeredAt: '2026-09-18 (W2 manual registration)',
  },
];
const SEMANTIC_CLASS_NAMES = new Set(SEMANTIC_RULES.flatMap((r) => r.classes ?? [r.class]));

// ── the monotonic budget ratchet (Gate-5, bypass-2) ─────────────────
// The pin IS the budget — but the pin lives in a JSON file an
// attacker can rewrite and canonicalize: Codex's round-5 attack
// raised a pinned identity count 1→999 and stayed GREEN. These
// script-embedded ceilings bound the PINNED totals (authority mode,
// same as SEMANTIC_RULES): equal is legal (a fresh pin), less is
// migration progress (lower them at the next pin), MORE IS RED.
// Raising a budget now requires editing THIS file — the gate source —
// which is review-visible. Values = the 2026-09-17 pin, measured
// 2026-09-16 (totalsOf over the pinned instance; forms = the
// resolveTextStyle() formsByFile census, 21 forms × the two mirror
// sides).
const RATCHET = {
  // ONE deliberate carve (2026-09-19, the FOUC round, Owner design):
  // boot-splash carries 6 HARDCODED head-carried classes — the
  // zero-css-file law DEMANDS them (the splash must paint before any
  // stylesheet; its vocabulary rides the HTML itself). The carve is
  // ui-zone only, sized to exactly the family's six identities,
  // review-visible here per the gate-source law. Everything else
  // stays ZERO: the migration is complete — any OTHER class identity
  // anywhere is red unless atoms, tokens, registered semantics, or
  // registered producers own it
  files: 1,
  identities: 6,
  occurrences: 6,
  zones: { routes: 0, 'site-libs': 0, ui: 6 },
  forms: 42,
};
const RATCHET_ZONE_KEYS = ['routes', 'site-libs', 'ui'];

// ── canonical JSON (sorted keys, 2-space indent, trailing newline) ──
function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = canonicalize(value[key]);
    return out;
  }
  return value;
}
const canonicalJson = (value) => JSON.stringify(canonicalize(value), null, 2) + '\n';
const sha256 = (text) => createHash('sha256').update(text).digest('hex');

// ── file enumeration (tracked + untracked; gitignored paths dropped) ─
function walkDir(dir, base, prefix = '') {
  const out = [];
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.svelte-kit' || entry.name === 'dist') continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walkDir(join(dir, entry.name), base, rel));
    else out.push(rel);
  }
  return out;
}

function gitIgnored(root, paths) {
  if (!paths.length) return new Set();
  const res = spawnSync('git', ['-C', root, 'check-ignore', '--stdin'], {
    input: paths.join('\n'),
    maxBuffer: 64 * 1024 * 1024,
  });
  if (res.status !== null && res.status > 1) return new Set(); // not a repo / git unavailable → no filtering
  return new Set((res.stdout?.toString() ?? '').split('\n').filter(Boolean));
}

function scanSources(root) {
  const zones = ['apps/www/src', 'registry/files'];
  const all = [];
  for (const zone of zones) {
    const abs = join(root, zone);
    if (!existsSync(abs)) continue;
    for (const rel of walkDir(abs, zone)) {
      if (!/\.(svelte|ts|js|mjs)$/.test(rel)) continue;
      all.push(`${zone}/${rel}`);
    }
  }
  const ignored = gitIgnored(root, all);
  return all.filter((p) => !ignored.has(p)).sort();
}

// ── mirror canonicalization ─────────────────────────────────────────
function mirrorOf(root, appsRel) {
  const candidates = [];
  if (appsRel.startsWith('apps/www/src/lib/ui/')) {
    candidates.push(appsRel.replace(/^apps\/www\/src\/lib\/ui\//, 'registry/files/ui/'));
  } else if (appsRel.startsWith('apps/www/src/lib/')) {
    const rest = appsRel.slice('apps/www/src/lib/'.length);
    candidates.push(`registry/files/lib/${rest}`, `registry/files/theme/${rest}`);
  }
  return candidates.find((c) => existsSync(join(root, c))) ?? null;
}
function zoneOf(canonicalPath) {
  if (canonicalPath.startsWith('apps/www/src/routes/')) return 'routes';
  if (canonicalPath.startsWith('apps/www/src/lib/ui/') || canonicalPath.startsWith('registry/files/ui/')) return 'ui';
  if (canonicalPath.startsWith('apps/www/src/lib/') || /^registry\/files\/(?:lib|theme)\//.test(canonicalPath)) return 'site-libs';
  return 'other';
}

// ════════════════════════════════════════════════════════════════════
// The dual-flavor expression core (svelte scripts/markup are ESTree —
// acorn TS-ESTree nodes carry .type; standalone files parsed by the
// typescript package carry numeric .kind)
// ════════════════════════════════════════════════════════════════════
const isTsFlavor = (n) => n != null && typeof n.kind === 'number';
const nodeType = (n) =>
  isTsFlavor(n)
    ? {
        Call: ts.isCallExpression(n) ? 'Call' : null,
        Ident: ts.isIdentifier(n) ? 'Ident' : null,
        Str: ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) ? 'Str' : null,
        Tpl: ts.isTemplateExpression(n) ? 'Tpl' : null,
        Cond: ts.isConditionalExpression(n) ? 'Cond' : null,
        Log: ts.isBinaryExpression(n) && ['&&', '||', '??'].includes(OP_BY_KIND.get(n.operatorToken.kind)) ? 'Log' : null,
        Bin: ts.isBinaryExpression(n) ? 'Bin' : null,
        Arr: ts.isArrayLiteralExpression(n) ? 'Arr' : null,
        Obj: ts.isObjectLiteralExpression(n) ? 'Obj' : null,
        Mem: ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n) ? 'Mem' : null,
        Arrow: ts.isArrowFunction(n) || ts.isFunctionExpression(n) ? 'Arrow' : null,
        Wrap: ts.isAsExpression(n) || ts.isSatisfiesExpression(n) || ts.isNonNullExpression(n) || ts.isTypeAssertionExpression(n) || ts.isParenthesizedExpression(n) ? 'Wrap' : null,
        Lit: ts.isLiteralExpression(n) ? 'Lit' : null,
      }
    : {
        Call: n.type === 'CallExpression' ? 'Call' : null,
        Ident: n.type === 'Identifier' ? 'Ident' : null,
        Str: n.type === 'Literal' && typeof n.value === 'string' ? 'Str' : null,
        Tpl: n.type === 'TemplateLiteral' ? 'Tpl' : null,
        Cond: n.type === 'ConditionalExpression' ? 'Cond' : null,
        Log: n.type === 'LogicalExpression' ? 'Log' : null,
        Bin: n.type === 'BinaryExpression' ? 'Bin' : null,
        Arr: n.type === 'ArrayExpression' ? 'Arr' : null,
        Obj: n.type === 'ObjectExpression' ? 'Obj' : null,
        Mem: n.type === 'MemberExpression' ? 'Mem' : null,
        Arrow: n.type === 'ArrowFunctionExpression' || n.type === 'FunctionExpression' ? 'Arrow' : null,
        Wrap: ['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression', 'TSTypeAssertion', 'ParenthesizedExpression'].includes(n.type) ? 'Wrap' : null,
        Lit: n.type === 'Literal' ? 'Lit' : null,
      };

const calleeOf = (n) => (isTsFlavor(n) ? n.expression : n.callee);
// binary/logical operator text for both flavors (TS carries a token .kind)
const OP_BY_KIND = new Map(
  Object.entries({
    AmpersandAmpersandToken: '&&',
    BarBarToken: '||',
    QuestionQuestionToken: '??',
    PlusToken: '+',
    ExclamationEqualsEqualsToken: '!==',
    EqualsEqualsEqualsToken: '===',
  }).map(([k, v]) => [ts.SyntaxKind[k], v]),
);
function operatorOf(n) {
  if (isTsFlavor(n)) return OP_BY_KIND.get(n.operatorToken?.kind) ?? `kind:${n.operatorToken?.kind}`;
  return n.operator;
}
const argsOf = (n) => n.arguments ?? [];
function calleeName(n) {
  const callee = calleeOf(n);
  if (!callee) return null;
  const t = nodeType(callee);
  if (t.Ident) return isTsFlavor(callee) ? callee.text : callee.name;
  if (t.Mem) return isTsFlavor(callee) ? callee.name?.text ?? null : callee.property?.name ?? null;
  return null;
}

// string literal + template chunks (both flavors)
function stringOf(n) {
  const t = nodeType(n);
  if (t.Str) return isTsFlavor(n) ? n.text : n.value;
  return undefined;
}
function templateParts(n) {
  if (isTsFlavor(n)) {
    if (ts.isTemplateExpression(n)) {
      const texts = [n.head.text];
      const exprs = [];
      for (const span of n.templateSpans) { exprs.push(span.expression); texts.push(span.literal.text); }
      return { texts, exprs };
    }
    return null;
  }
  if (n.type === 'TemplateLiteral') {
    return { texts: n.quasis.map((q) => q.value.cooked), exprs: n.expressions };
  }
  return null;
}

// ════════════════════════════════════════════════════════════════════
// Per-file extraction
// ════════════════════════════════════════════════════════════════════
class FileExtraction {
  constructor(rel, root) {
    this.rel = rel;
    this.root = root; // extraction root (the real tree or a selftest sandbox)
    this.identities = new Map(); // token → count
    this.violations = []; // {kind, detail}
    this.seenSites = new Set(); // AST nodes already counted (source-site counting)
    this.bindings = new Map(); // script-level name → binding
    this.externalNames = new Set(); // function params of verified producers
  }

  addTokens(str) {
    for (const token of String(str).split(/\s+/)) {
      if (!token) continue;
      // registered semantic class names resolve against the
      // semantics[] registry, not the utility identity ratchet
      if (SEMANTIC_CLASS_NAMES.has(token)) continue;
      this.identities.set(token, (this.identities.get(token) ?? 0) + 1);
    }
  }

  red(detail, node) {
    const where = node && !isTsFlavor(node) && typeof node.start === 'number' ? `@${node.start}` : '';
    this.violations.push({ kind: 'unregistered-producer', detail: `${this.rel}${where}: ${detail}` });
  }

  // ── binding collection (scripts, ESTree TS-ESTree) ───────────────
  collectScriptBindings(program, flavorTs = false) {
    const visit = (n) => {
      if (!n || typeof n !== 'object') return;
      if (Array.isArray(n)) { n.forEach(visit); return; }
      if (!flavorTs && typeof n.type === 'string') {
        if (n.type === 'VariableDeclaration') {
          const isProps = n.declarations.length === 1 && this.callNameOf(n.declarations[0].init) === '$props';
          for (const d of n.declarations) this.bindPattern(d.id, d.init, isProps ? 'prop' : 'local');
        } else if (n.type === 'FunctionDeclaration' && n.id) {
          this.bindings.set(n.id.name, { kind: 'local', node: n, fn: true });
        } else if (n.type === 'ImportDeclaration') {
          for (const spec of n.specifiers ?? []) {
            const name = spec.local?.name ?? spec.imported?.name;
            if (!name) continue;
            // Gate-5: importKind/importedName record WHAT the binding
            // binds — the stylex channel is verified per EXPORT, so a
            // rename (`import { evil as ok }`) must resolve to the
            // module's ACTUAL export name, and namespaces/defaults
            // have their own rules
            const importKind = spec.type === 'ImportNamespaceSpecifier' ? 'namespace' : spec.type === 'ImportDefaultSpecifier' ? 'default' : 'named';
            this.bindings.set(name, { kind: 'import', source: n.source?.value, importKind, importedName: spec.imported?.name ?? name });
          }
        }
        // EVERY function's parameters are dynamic inputs (a param is
        // never a statically-known class source) — file-wide, so
        // nested callbacks inherit it too
        if (n.type === 'ArrowFunctionExpression' || n.type === 'FunctionExpression' || n.type === 'FunctionDeclaration') {
          for (const p of n.params ?? []) {
            const pt = nodeType(p);
            if (pt?.Ident) this.externalNames.add(p.name);
            else if (p.type === 'AssignmentPattern' && p.left?.type === 'Identifier') this.externalNames.add(p.left.name);
            else if (p.type === 'RestElement' && p.argument?.type === 'Identifier') this.externalNames.add(p.argument.name);
            else if (p.type === 'ObjectPattern') for (const pp of p.properties ?? []) { const nm = pp.value?.name ?? pp.key?.name; if (nm) this.externalNames.add(nm); }
          }
        }
      }
      for (const k of Object.keys(n)) {
        if (['start', 'end', 'loc', 'range', 'parent', 'leadingComments', 'trailingComments'].includes(k)) continue;
        const v = n[k];
        if (v && typeof v === 'object') visit(v);
      }
    };
    visit(program);
  }

  callNameOf(init) {
    if (!init || (isTsFlavor(init) ? !ts.isCallExpression(init) : init.type !== 'CallExpression')) return null;
    const callee = calleeOf(init);
    const t = nodeType(callee);
    if (t?.Ident) return isTsFlavor(callee) ? callee.text : callee.name;
    return null;
  }

  bindPattern(pattern, init, kind) {
    if (!pattern) return;
    const unwrap = (p) => {
      const t = nodeType(p);
      if (t.Ident) return [isTsFlavor(p) ? p.text : p.name, null];
      return [null, p];
    };
    if (kind === 'prop') {
      const walkPat = (p) => {
        const t = nodeType(p);
        if (t.Ident) { this.bindings.set(isTsFlavor(p) ? p.text : p.name, { kind: 'prop' }); return; }
        if (p.type === 'ObjectPattern' || ts.isObjectBindingPattern?.(p)) {
          for (const prop of p.properties ?? []) {
            const target = prop.value ?? prop.initializer ?? prop.name;
            if (prop.type === 'RestElement' || ts.isBindingElement(prop) && prop.dotDotDotToken) { if (target) walkPat(target); continue; }
            walkPat(target);
          }
        } else if (p.type === 'AssignmentPattern' || ts.isBindingElement?.(p)) {
          walkPat(p.left ?? p.name);
        }
      };
      walkPat(pattern);
      return;
    }
    const [name] = unwrap(pattern);
    if (name) this.bindings.set(name, { kind, node: init });
  }

  // ── stylex seam detection ────────────────────────────────────────
  // Gate-4: the runtime arm (@stylexjs/*) is always the engine; an
  // authored module arm must resolve into a transform root AND
  // AST-verify (a @stylexjs import + a top-level authoring call) —
  // the `.stylex` suffix alone is not a channel.
  // Gate-5: module verification alone is still too coarse — a legal
  // create-bearing module could smuggle rogue exports. The authored
  // arm is now verified per EXPORT: this import is channel-legal only
  // when it binds an authoring-call result or a HELPERS-registered
  // joiner (namespace imports require EVERY export legal; default
  // imports resolve to the 'default' export).
  isStylexChannelImport(name, binding) {
    if (binding?.kind !== 'import' || typeof binding.source !== 'string') return false;
    if (STYLEX_RUNTIME_SOURCE_RE.test(binding.source)) return true; // the engine seam — module-level by nature
    const resolved = resolveStylexSource(this.root, this.rel, binding.source);
    if (resolved === null) return false;
    const classes = stylexExportClasses(this.root, resolved);
    if (classes === null) return false;
    if (binding.importKind === 'namespace') {
      for (const cls of classes.values()) if (cls === 'rogue') return false;
      return true;
    }
    const exportName = binding.importKind === 'default' ? 'default' : binding.importedName ?? name;
    const cls = classes.get(exportName);
    return cls === 'stylex' || cls === 'helper';
  }
  // red-note for the smuggled-export shape: the module IS a verified
  // atom module, but THIS export is not on the stylex lane
  stylexRogueNote(name, binding) {
    if (binding?.kind !== 'import' || typeof binding.source !== 'string' || STYLEX_RUNTIME_SOURCE_RE.test(binding.source)) return '';
    const resolved = resolveStylexSource(this.root, this.rel, binding.source);
    if (resolved === null) return '';
    const classes = stylexExportClasses(this.root, resolved);
    if (classes === null) return '';
    const exportName = binding.importKind === 'default' ? 'default' : binding.importedName ?? name;
    const rogue = binding.importKind === 'namespace'
      ? [...classes.values()].includes('rogue')
      : classes.get(exportName) === 'rogue';
    return rogue ? ` — verified stylex module '${binding.source}', but export \`${exportName}\` is neither stylex.create output nor a registered helper (the channel is per export, not per module)` : '';
  }
  isStylexNamespaceIdent(nameNode) {
    const t = nodeType(nameNode);
    if (!t?.Ident) return false;
    const name = isTsFlavor(nameNode) ? nameNode.text : nameNode.name;
    return this.isStylexChannelImport(name, this.bindings.get(name));
  }
  // does the expression chain root at a stylex namespace (stylex.create /
  // stylex.attrs / …) or a local binding initialized from one?
  isStylexSite(node, depth = 0) {
    if (!node || depth > 12) return false;
    const t = nodeType(node);
    if (t.Mem) return this.isStylexSite(isTsFlavor(node) ? node.expression : node.object, depth + 1);
    if (t.Call) {
      const callee = calleeOf(node);
      if (this.isStylexSite(callee, depth + 1)) return true;
      const ct = nodeType(callee);
      if (ct?.Ident) {
        const name = isTsFlavor(callee) ? callee.text : callee.name;
        const binding = this.bindings.get(name);
        // local wrapper (const sx = () => stylex.attrs(...).class)
        if (binding?.kind === 'local' && this.isStylexSite(binding.node?.body ?? binding.node, depth + 1)) return true;
      }
      return false;
    }
    if (t.Ident) {
      const name = isTsFlavor(node) ? node.text : node.name;
      const binding = this.bindings.get(name);
      if (this.isStylexChannelImport(name, binding)) return true;
      // stylex.create binding: const s = stylex.create({...}) → member over it is a seam
      if (binding?.kind === 'local' && this.callNameOf(binding.node) != null) {
        const init = binding.node;
        const callee = isTsFlavor(init) ? init.expression : init.callee;
        if (this.isStylexSite(callee, depth + 1)) return true;
      }
      if (binding?.kind === 'local' && this.isStylexSite(binding.node, depth + 1)) return true;
      return false;
    }
    if (t.Arrow) {
      const body = isTsFlavor(node) ? node.body : node.body;
      return this.isStylexSite(body, depth + 1);
    }
    if (t.Wrap) return this.isStylexSite(node.expression, depth + 1);
    return false;
  }

  // ── value-position extraction ────────────────────────────────────
  valueOf(node, scopes = [], depth = 0) {
    if (!node || depth > 40) return;
    if (this.seenSites.has(node)) return;
    const t = nodeType(node);
    if (t.Wrap) { this.valueOf(node.expression, scopes, depth + 1); return; }
    if (t.Str) {
      const s = stringOf(node);
      this.seenSites.add(node);
      this.addTokens(s);
      return;
    }
    if (t.Lit && !t.Str) return; // numbers/booleans/null — not classes
    if (t.Tpl) {
      const tpl = templateParts(node);
      if (tpl) {
        this.seenSites.add(node);
        for (const text of tpl.texts) this.addTokens(text);
        for (const expr of tpl.exprs) this.valueOf(expr, scopes, depth + 1);
      }
      return;
    }
    if (t.Cond) {
      if (isTsFlavor(node)) {
        this.valueOf(node.whenTrue, scopes, depth + 1);
        this.valueOf(node.whenFalse, scopes, depth + 1);
      } else {
        this.valueOf(node.consequent, scopes, depth + 1);
        this.valueOf(node.alternate, scopes, depth + 1);
      }
      return;
    }
    if (t.Log) {
      const op = operatorOf(node);
      this.valueOf(node.right, scopes, depth + 1);
      if (op !== '&&') this.valueOf(node.left, scopes, depth + 1);
      return;
    }
    if (t.Bin) {
      const op = operatorOf(node);
      if (op === '+') {
        this.valueOf(node.left, scopes, depth + 1);
        this.valueOf(node.right, scopes, depth + 1);
      }
      return; // comparison/arith operands are conditions, never class values
    }
    if (t.Arr) {
      for (const el of node.elements ?? []) {
        if (el && (el.type === 'SpreadElement' || ts.isSpreadElement?.(el))) this.valueOf(isTsFlavor(el) ? el.expression : el.argument, scopes, depth + 1);
        else this.valueOf(el, scopes, depth + 1);
      }
      return;
    }
    if (t.Obj) {
      for (const prop of node.properties ?? []) {
        if (prop.type === 'SpreadElement' || prop.type === 'SpreadProperty' || ts.isSpreadAssignment?.(prop)) continue;
        const value = isTsFlavor(prop) ? prop.initializer : prop.value;
        if (value) this.valueOf(value, scopes, depth + 1); // object KEYS are conditions (clsx form)
      }
      return;
    }
    if (t.Ident) {
      const name = isTsFlavor(node) ? node.text : node.name;
      this.resolveIdentifier(name, node, scopes, depth);
      return;
    }
    if (t.Mem) { this.resolveMember(node, scopes, depth); return; }
    if (t.Call) { this.resolveCall(node, scopes, depth); return; }
    if (t.Arrow) { this.verifyProducerFn(node, node, scopes, depth); return; } // inline callback returning class fragments
    if (node.type === 'UnaryExpression' || node.type === 'AwaitExpression' || isTsFlavor(node)) return; // void x / await x — cannot yield a class string here today
    this.red(`unregistered dynamic class producer (expression \`${describeExpr(node)}\`) — route it through cn()/clsx() or register it in producers[]`, node);
  }

  resolveIdentifier(name, node, scopes, depth) {
    if (GLOBAL_VALUE_NAMES.has(name)) return;
    if (this.externalNames.has(name)) return; // function parameter (any depth) — dynamic input
    // each-scope bindings (markup)
    for (let i = scopes.length - 1; i >= 0; i--) {
      const hit = scopes[i].get?.(name);
      if (hit) {
        if (hit.kind === 'eachElement') { this.eachValues(hit, null, scopes, depth); return; }
        if (hit.kind === 'external') return;
      }
    }
    const binding = this.bindings.get(name);
    if (!binding) {
      this.red(`unregistered dynamic class producer (unresolved identifier \`${name}\` at a class position)`, node);
      return;
    }
    if (binding.kind === 'prop') {
      if (binding.defaultNode) this.valueOf(binding.defaultNode, scopes, depth + 1);
      return; // caller-supplied class channel — counted in the caller's file
    }
    if (binding.kind === 'import') {
      if (this.isStylexChannelImport(name, binding)) return; // stylex lane — the destination
      this.red(`unregistered dynamic class producer (imported value \`${name}\` from '${binding.source}' at a class position)${this.stylexRogueNote(name, binding)} — register the producer or compose through cn()/clsx()`, node);
      return;
    }
    // local binding
    const init = binding.node;
    if (init == null) return;
    const t = nodeType(init);
    if (t.Arrow || (binding.fn && init.body)) { this.verifyProducerFn(init, node, scopes, depth); return; }
    if (this.callNameOf(init) === '$derived') {
      const arg = argsOf(init)[0];
      const at = nodeType(arg);
      if (at?.Arrow) this.verifyProducerFn(arg, node, scopes, depth);
      else this.valueOf(arg, scopes, depth + 1);
      return;
    }
    if (nodeType(init).Call && this.isStylexSite(init)) return;
    this.valueOf(init, scopes, depth + 1);
  }

  // a local function used as a class producer: legal iff every return
  // path is statically accounted (literals / registered seams / props);
  // its return literals count ONCE at the definition (source-site law)
  verifyProducerFn(fn, site, scopes, depth) {
    if (this.seenSites.has(fn)) return;
    this.seenSites.add(fn);
    const params = new Set();
    for (const p of fn.params ?? []) {
      const t = nodeType(p);
      if (t.Ident) params.add(isTsFlavor(p) ? p.text : p.name);
    }
    const savedExternal = new Set(this.externalNames);
    for (const p of params) this.externalNames.add(p);
    const returns = [];
    const collectReturns = (n) => {
      if (!n || typeof n !== 'object') return;
      if (Array.isArray(n)) { n.forEach(collectReturns); return; }
      if (isTsFlavor(n) ? ts.isReturnStatement(n) : n.type === 'ReturnStatement') {
        returns.push(isTsFlavor(n) ? n.expression : n.argument);
      }
      for (const k of Object.keys(n)) {
        if (['start', 'end', 'loc', 'range', 'parent'].includes(k)) continue;
        const v = n[k];
        if (v && typeof v === 'object') collectReturns(v);
      }
    };
    const body = fn.body;
    const bt = nodeType(body);
    if (bt?.Obj) { // concise object body — a class composition value
      this.valueOf(body, scopes, depth + 1);
    } else if (bt?.Tpl || bt?.Str || bt?.Call || bt?.Cond || bt?.Log || bt?.Mem || bt?.Ident || bt?.Arr) {
      this.valueOf(body, scopes, depth + 1); // concise expression body
    } else {
      collectReturns(body);
      for (const ret of returns) this.valueOf(ret, scopes, depth + 1);
    }
    for (const p of params) this.externalNames.delete(p);
    void savedExternal;
    void site;
  }

  resolveCall(node, scopes, depth) {
    const callee = calleeOf(node);
    const name = calleeName(node);
    if (this.isStylexSite(callee)) return; // stylex seam (sx wrapper / stylex.*)

    // member callees first (property-name match would misfire)
    const ct = nodeType(callee);
    if (ct?.Mem) {
      const object = isTsFlavor(callee) ? callee.expression : callee.object;
      const method = isTsFlavor(callee) ? callee.name?.text : callee.property?.name;
      // svelte rune: $derived.by(fn)
      if (nodeType(object)?.Ident && (isTsFlavor(object) ? object.text : object.name) === '$derived' && method === 'by') {
        const arg = argsOf(node)[0];
        if (nodeType(arg)?.Arrow) this.verifyProducerFn(arg, node, scopes, depth);
        else this.valueOf(arg, scopes, depth + 1);
        return;
      }
      if (this.isStylexSite(object)) return;
      if (nodeType(object)?.Ident && GLOBAL_UTILITY_OBJECTS.has(isTsFlavor(object) ? object.text : object.name)) {
        for (const arg of argsOf(node)) this.valueOf(arg, scopes, depth + 1);
        return;
      }
      if (method && STRING_METHODS.has(method)) {
        this.valueOf(object, scopes, depth + 1); // the receiver carries the identities
        for (const arg of argsOf(node)) if (nodeType(arg)?.Str) this.valueOf(arg, scopes, depth + 1);
        return;
      }
      // any other member call is a producer question → fall through to red
      this.red(`unregistered dynamic class producer (call to \`.${method ?? '?'}()\` on \`${describeExpr(object)}\` at a class position) — route it through cn()/clsx() or register it in producers[]`, node);
      return;
    }

    if (name === 'cn' || name === 'clsx') {
      for (const arg of argsOf(node)) this.valueOf(arg, scopes, depth + 1);
      return;
    }
    if (REGISTERED_PRODUCER_CALLS.has(name)) {
      // module+name match: the import source must be the producer's module
      const binding = this.bindings.get(name);
      const source = binding?.source ?? '';
      if (!binding || binding.kind === 'import' ? REGISTERED_PRODUCER_MODULES[name].test(source) : true) return; // emissions frozen in producers[].legal
      this.red(`registered producer name \`${name}\` imported from unexpected module '${source}' — expected ${REGISTERED_PRODUCER_MODULES[name]}`, node);
      return;
    }
    if (name === '$derived') {
      const arg = argsOf(node)[0];
      const at = nodeType(arg);
      if (at?.Arrow) this.verifyProducerFn(arg, node, scopes, depth);
      else this.valueOf(arg, scopes, depth + 1);
      return;
    }
    if (name === '$props') return;
    if (GLOBAL_UTILITY_OBJECTS.has(name)) { for (const arg of argsOf(node)) this.valueOf(arg, scopes, depth + 1); return; }
    if (name) {
      const binding = this.bindings.get(name);
      if (binding?.kind === 'local') {
        const init = binding.node;
        const t = nodeType(init);
        if (t.Arrow || (binding.fn && init.body)) { this.verifyProducerFn(init, node, scopes, depth); return; }
        if (t.Call && this.isStylexSite(init)) return;
      }
      if (binding?.kind === 'import' && this.isStylexChannelImport(name, binding)) return;
      if (binding?.kind === 'prop') return;
      this.red(`unregistered dynamic class producer (call to \`${name}\`${binding?.kind === 'import' ? ` imported from '${binding.source}'` : ''} at a class position)${binding?.kind === 'import' ? this.stylexRogueNote(name, binding) : ''} — route it through cn()/clsx() or register it in producers[]`, node);
      return;
    }
    this.red(`unregistered dynamic class producer (call \`${describeExpr(node)}\` at a class position)`, node);
  }

  // member access: property-aware descent over resolved structures so
  // `link.cls` collects ONLY the cls values of the literal array
  resolveMember(node, scopes, depth) {
    if (this.seenSites.has(node)) return;
    const keys = [];
    let cursor = node;
    while (nodeType(cursor)?.Mem) {
      if (isTsFlavor(cursor)) {
        if (ts.isPropertyAccessExpression(cursor)) { keys.push({ computed: false, key: cursor.name.text }); cursor = cursor.expression; }
        else { keys.push({ computed: true }); cursor = cursor.argumentExpression; }
      } else {
        if (cursor.computed) { keys.push({ computed: true }); cursor = cursor.object; }
        else { keys.push({ computed: false, key: cursor.property?.name }); cursor = cursor.object; }
      }
    }
    keys.reverse();
    // root: identifier (or chain root)
    const t = nodeType(cursor);
    if (t?.Ident) {
      const name = isTsFlavor(cursor) ? cursor.text : cursor.name;
      // each-scope member (link.cls over {#each chain as link})
      for (let i = scopes.length - 1; i >= 0; i--) {
        const hit = scopes[i].get?.(name);
        if (hit?.kind === 'eachElement') { this.eachValues(hit, keys, scopes, depth); return; }
        if (hit?.kind === 'external') return;
      }
      const binding = this.bindings.get(name);
      if (!binding) { this.red(`unregistered dynamic class producer (unresolved \`${name}.${keys.map((k) => k.key ?? '[]').join('.')}\` at a class position)`, node); return; }
      if (binding.kind === 'prop') return; // props.x — caller data
      if (binding.kind === 'import') {
        if (this.isStylexChannelImport(name, binding)) return;
        this.red(`unregistered dynamic class producer (imported \`${name}\` at a class position)${this.stylexRogueNote(name, binding)}`, node);
        return;
      }
      let init = binding.node;
      if (this.callNameOf(init) === '$derived') init = argsOf(init)[0] ?? null;
      if (init && this.isStylexSite(init)) return;
      this.descendStructure(init, keys, 0, scopes, depth, node);
      return;
    }
    if (this.isStylexSite(cursor)) return;
    // d.shape inside `d.shape === 'pill'` never reaches here (=== shields);
    // any other structural root we cannot see is a producer question
    const rootBindingName = describeExpr(cursor);
    if (t?.Call) { this.resolveCall(cursor, scopes, depth); return; }
    this.red(`unregistered dynamic class producer (member chain \`${rootBindingName}\` at a class position)`, node);
  }

  descendStructure(node, keys, ki, scopes, depth, site) {
    if (!node) return;
    if (this.seenSites.has(node)) return;
    const t = nodeType(node);
    if (t.Wrap) { this.descendStructure(node.expression, keys, ki, scopes, depth, site); return; }
    if (t.Arr) {
      for (const el of node.elements ?? []) this.descendStructure(el, keys, ki, scopes, depth, site);
      return;
    }
    if (t.Obj) {
      const key = keys[ki];
      if (key && !key.computed && typeof key.key === 'string') {
        for (const prop of node.properties ?? []) {
          const propName = isTsFlavor(prop)
            ? (prop.name && ts.isIdentifier(prop.name) ? prop.name.text : prop.name?.text)
            : (prop.key?.type === 'Identifier' ? prop.key.name : prop.key?.value);
          if (propName === key.key) {
            const value = isTsFlavor(prop) ? prop.initializer : prop.value;
            if (ki + 1 < keys.length) this.descendStructure(value, keys, ki + 1, scopes, depth, site);
            else this.valueOf(value, scopes, depth + 1);
            return;
          }
        }
        return; // key absent (dynamic union) — nothing static
      }
      // computed access → union of all values at this depth
      for (const prop of node.properties ?? []) {
        const value = isTsFlavor(prop) ? prop.initializer : prop.value;
        if (!value) continue;
        if (ki + 1 < keys.length) this.descendStructure(value, keys, ki + 1, scopes, depth, site);
        else this.valueOf(value, scopes, depth + 1);
      }
      return;
    }
    if (t.Ident) { this.resolveIdentifier(isTsFlavor(node) ? node.text : node.name, node, scopes, depth); return; }
    if (t.Mem) { this.resolveMember(node, scopes, depth); return; }
    if (t.Call) { this.resolveCall(node, scopes, depth); return; }
    this.valueOf(node, scopes, depth + 1);
    void site;
  }

  // {#each expr as pattern} over a literal array
  eachValues(hit, keys, scopes, depth) {
    let arrayNode = hit.arrayNode;
    if (nodeType(arrayNode)?.Ident) {
      const name = isTsFlavor(arrayNode) ? arrayNode.text : arrayNode.name;
      const binding = this.bindings.get(name);
      if (binding?.kind === 'local') {
        arrayNode = binding.node;
        if (this.callNameOf(arrayNode) === '$derived') arrayNode = argsOf(arrayNode)[0] ?? null;
      } else if (binding?.kind === 'prop' || binding?.kind === 'import') return; // dynamic iterable — external
      else if (!binding) return; // unresolvable iterable — nothing static to count (no producer claim)
    }
    const t = nodeType(arrayNode);
    if (t?.Wrap) arrayNode = arrayNode.expression;
    if (!nodeType(arrayNode)?.Arr) return; // dynamic iterable
    const elements = arrayNode.elements ?? [];
    if (hit.pattern === 'arrayPattern') {
      const idx = hit.index;
      for (const el of elements) {
        const et = nodeType(el);
        if (et?.Arr) {
          const value = (el.elements ?? [])[idx];
          if (keys?.length) this.descendStructure(value, keys, 0, scopes, depth, el);
          else this.valueOf(value, scopes, depth + 1);
        } else this.valueOf(el, scopes, depth + 1);
      }
    } else if (hit.pattern === 'objectField') {
      for (const el of elements) {
        if (!nodeType(el)?.Obj) { this.valueOf(el, scopes, depth + 1); continue; }
        const prop = (el.properties ?? []).find((pp) => (pp.key?.name ?? pp.key?.value) === hit.field);
        const value = prop?.value;
        if (value == null) continue;
        if (keys?.length) this.descendStructure(value, keys, 0, scopes, depth, el);
        else this.valueOf(value, scopes, depth + 1);
      }
    } else {
      for (const el of elements) {
        if (keys?.length) this.descendStructure(el, keys, 0, scopes, depth, el);
        else this.valueOf(el, scopes, depth + 1);
      }
    }
  }

  // ── phase 1: script cn()/clsx() call sites (ESTree programs) ─────
  scanScriptForSeamCalls(program) {
    const calls = [];
    const visit = (n) => {
      if (!n || typeof n !== 'object') return;
      if (Array.isArray(n)) { n.forEach(visit); return; }
      if (n.type === 'CallExpression') {
        const name = calleeName(n);
        if (name === 'cn' || name === 'clsx') calls.push(n);
      }
      for (const k of Object.keys(n)) {
        if (['start', 'end', 'loc', 'range', 'parent', 'leadingComments', 'trailingComments'].includes(k)) continue;
        const v = n[k];
        if (v && typeof v === 'object') visit(v);
      }
    };
    visit(program);
    for (const call of calls) {
      for (const arg of call.arguments ?? []) this.valueOf(arg, [], 0);
    }
  }

  // ── phase 1b: standalone .ts (typescript-package flavor) ─────────
  scanTsProgram(program) {
    const visit = (n) => {
      if (!n) return;
      if (ts.isVariableStatement(n)) {
        for (const d of n.declarationList.declarations) {
          const isProps = this.callNameOfTs(d.initializer) === '$props';
          this.bindTsPattern(d.name, d.initializer, isProps ? 'prop' : 'local');
        }
      } else if (ts.isFunctionDeclaration(n) && n.name) {
        this.bindings.set(n.name.text, { kind: 'local', node: n, fn: true });
      }
      if (ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n)) {
        for (const p of n.parameters ?? []) {
          const name = p.name;
          if (ts.isIdentifier(name)) this.externalNames.add(name.text);
          else if (ts.isObjectBindingPattern(name)) for (const el of name.elements) if (ts.isIdentifier(el.name)) this.externalNames.add(el.name.text);
          else if (ts.isArrayBindingPattern(name)) for (const el of name.elements) if (el && ts.isIdentifier(el.name)) this.externalNames.add(el.name.text);
        }
      }
      if (ts.isImportDeclaration(n) && n.importClause) {
        const source = n.moduleSpecifier.text;
        const named = n.importClause.namedBindings;
        if (named && ts.isNamespaceImport(named)) this.bindings.set(named.name.text, { kind: 'import', source, importKind: 'namespace' });
        if (named && ts.isNamedImports(named)) for (const el of named.elements) this.bindings.set(el.name.text, { kind: 'import', source, importKind: 'named', importedName: el.propertyName?.text ?? el.name.text });
        if (n.importClause.name) this.bindings.set(n.importClause.name.text, { kind: 'import', source, importKind: 'default', importedName: 'default' });
      }
      ts.forEachChild(n, visit);
    };
    visit(program);
    const calls = [];
    const collect = (n) => {
      if (!n) return;
      if (ts.isCallExpression(n)) {
        const e = n.expression;
        const name = ts.isIdentifier(e) ? e.text : ts.isPropertyAccessExpression(e) ? e.name.text : null;
        if (name === 'cn' || name === 'clsx') calls.push(n);
      }
      ts.forEachChild(n, collect);
    };
    collect(program);
    for (const call of calls) for (const arg of call.arguments) this.valueOf(arg, [], 0);
  }

  callNameOfTs(init) {
    if (!init || !ts.isCallExpression(init)) return null;
    return ts.isIdentifier(init.expression) ? init.expression.text : null;
  }

  bindTsPattern(name, init, kind) {
    if (kind === 'prop') {
      const walk = (p) => {
        if (ts.isIdentifier(p)) { this.bindings.set(p.text, { kind: 'prop' }); return; }
        if (ts.isObjectBindingPattern(p)) for (const el of p.elements) walk(el.name);
        else if (ts.isArrayBindingPattern(p)) for (const el of p.elements) if (el) walk(el.name);
      };
      walk(name);
      return;
    }
    if (ts.isIdentifier(name)) this.bindings.set(name.text, { kind, node: init });
  }

  // ── phase 2: svelte markup walk ──────────────────────────────────
  walkMarkup(node, scopes) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { for (const n of node) this.walkMarkup(n, scopes); return; }

    if (node.type === 'EachBlock') {
      const inner = [...scopes, new Map()];
      const ctx = node.context;
      // resolve pattern kind
      const t = nodeType(ctx);
      if (t?.Ident) {
        inner[inner.length - 1].set(ctx.name, { kind: 'eachElement', arrayNode: node.expression, pattern: 'element' });
      } else if (ctx?.type === 'ArrayPattern') {
        ctx.elements.forEach((el, i) => {
          if (el?.type === 'Identifier') inner[inner.length - 1].set(el.name, { kind: 'eachElement', arrayNode: node.expression, pattern: 'arrayPattern', index: i });
        });
      } else if (ctx?.type === 'ObjectPattern') {
        // {#each rows as { item, i, collapsedY }} — object destructure:
        // each bound name accesses its field on the (possibly dynamic) row
        for (const prop of ctx.properties ?? []) {
          const key = prop.key?.name ?? prop.key?.value;
          const valueName = prop.value?.name ?? prop.key?.name;
          if (valueName) inner[inner.length - 1].set(valueName, { kind: 'eachElement', arrayNode: node.expression, pattern: 'objectField', field: key ?? valueName });
        }
      }
      this.walkMarkup(node.children, inner);
      if (node.else) this.walkMarkup(node.else, scopes);
      return;
    }
    if (node.type === 'ConstTag' && node.declaration) {
      const scopes2 = [...scopes, new Map()];
      for (const d of node.declaration.declarations ?? []) {
        if (d.id?.type === 'Identifier') scopes2[scopes2.length - 1].set(d.id.name, { kind: 'eachElement', arrayNode: d.init, pattern: 'element' });
      }
      this.walkMarkup(node.children ?? [], scopes2); // const tags have no children; kept for shape
      return;
    }
    if (node.type === 'Attribute' && node.name === 'class') {
      for (const part of node.value ?? []) {
        if (part.type === 'Text') this.addTokens(part.data);
        else if (part.type === 'MustacheTag') this.valueOf(part.expression, scopes, 0);
      }
      return;
    }
    if (node.type === 'Class') {
      if (node.name) this.addTokens(node.name);
      return; // the expression is the CONDITION, not a class value
    }
    if ((node.type === 'Element' || node.type === 'Component' || node.type === 'SvelteComponent') && Array.isArray(node.attributes)) {
      const blacklisted = DOC_PROP_BLACKLIST[node.name];
      for (const attr of node.attributes) {
        if (attr.type === 'Attribute' && blacklisted?.includes(attr.name)) continue; // doc-sample props: the recorded exclusion
        this.walkMarkup(attr, scopes);
      }
      this.walkMarkup(node.children, scopes);
      return;
    }
    // generic traversal (Fragment/IfBlock/Snippet/Text/MustacheTag/…)
    for (const k of ['children', 'else', 'pending', 'then', 'catch', 'value']) {
      if (node[k]) this.walkMarkup(node[k], scopes);
    }
  }
}

function describeExpr(node) {
  if (!node) return '<dynamic>';
  const t = nodeType(node);
  if (t?.Ident) return isTsFlavor(node) ? node.text : node.name;
  if (t?.Str) return stringOf(node) ?? '';
  if (t?.Call) return `${describeExpr(calleeOf(node))}(…)`;
  if (t?.Mem) return `${describeExpr(isTsFlavor(node) ? node.expression : node.object)}.${isTsFlavor(node) ? node.name?.text ?? '[]' : node.property?.name ?? '[]'}`;
  return node.type ? node.type.toLowerCase() : '<dynamic>';
}

// ════════════════════════════════════════════════════════════════════
// Global extraction (all files → canonical entries)
// ════════════════════════════════════════════════════════════════════
function extractFile(root, rel) {
  const src = readFileSync(join(root, rel), 'utf8');
  const fx = new FileExtraction(rel, root);
  if (rel.endsWith('.svelte')) {
    const ast = svelteParse(src, { filename: rel });
    for (const script of [ast.module, ast.instance]) {
      if (script?.content) fx.collectScriptBindings(script.content, false);
    }
    for (const script of [ast.module, ast.instance]) {
      if (script?.content) fx.scanScriptForSeamCalls(script.content);
    }
    fx.walkMarkup(ast.html, []);
  } else {
    const kind = rel.endsWith('.js') || rel.endsWith('.mjs') ? ts.ScriptKind.JS : ts.ScriptKind.TS;
    const program = ts.createSourceFile(rel, src, ts.ScriptTarget.Latest, true, kind);
    fx.scanTsProgram(program);
  }
  return fx;
}

function extractAll(root) {
  const entries = new Map(); // canonical path → {zone, identities Map, notes[]}
  const violations = [];
  const sides = new Map(); // canonical → [maps]
  for (const rel of scanSources(root)) {
    let fx;
    try { fx = extractFile(root, rel); } catch (e) {
      violations.push({ kind: 'parse-error', detail: `${rel}: ${e.message}` });
      continue;
    }
    violations.push(...fx.violations);
    if (fx.identities.size === 0) continue;
    const canonical = rel.startsWith('apps/www/src/') ? mirrorOf(root, rel) ?? rel : rel;
    if (!sides.has(canonical)) sides.set(canonical, []);
    sides.get(canonical).push(fx.identities);
  }
  for (const [canonical, maps] of sides) {
    const merged = new Map();
    for (const map of maps) {
      for (const [tok, count] of map) merged.set(tok, Math.max(merged.get(tok) ?? 0, count));
    }
    entries.set(canonical, { zone: zoneOf(canonical), identities: merged });
  }
  return { entries, violations };
}

// ── producer: resolveTextStyle emission forms (source scan) ────────
function resolveTextStyleForms(root) {
  const rels = [TEXT_STYLE_REL];
  if (existsSync(join(root, TEXT_STYLE_MIRROR_REL))) rels.push(TEXT_STYLE_MIRROR_REL);
  const perFile = [];
  for (const rel of rels) {
    const src = readFileSync(join(root, rel), 'utf8');
    const program = ts.createSourceFile(rel, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const forms = new Set();
    const unwrapTs = (e) => {
      let cur = e;
      while (cur && (ts.isAsExpression(cur) || ts.isSatisfiesExpression(cur) || ts.isTypeAssertionExpression(cur) || ts.isParenthesizedExpression(cur))) cur = cur.expression;
      return cur;
    };
    const formOf = (arg) => {
      const e = unwrapTs(arg);
      if (!e) return;
      if (ts.isStringLiteral(e)) { forms.add(e.text); return; }
      if (ts.isTemplateExpression(e)) {
        const head = e.head.text;
        const tail = e.templateSpans.at(-1)?.literal.text ?? '';
        forms.add(`${head}…${tail}`);
        return;
      }
      if (ts.isBinaryExpression(e) && OP_BY_KIND.get(e.operatorToken.kind) === '??') { formOf(e.left); formOf(e.right); }
    };
    const visit = (n) => {
      if (!n) return;
      // named maps (NAMED_WEIGHTS / NAMED_TRACKING — `as const` unwrapped): every string value
      if (ts.isVariableDeclaration(n) && /WEIGHTS|TRACKING/.test(n.name.getText?.() ?? '')) {
        const obj = unwrapTs(n.initializer);
        if (obj && ts.isObjectLiteralExpression(obj)) {
          for (const prop of obj.properties) {
            if (ts.isPropertyAssignment(prop) && ts.isStringLiteral(prop.initializer)) forms.add(prop.initializer.text);
          }
        }
      }
      if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'push' && n.arguments.length === 1) {
        formOf(n.arguments[0]);
      }
      ts.forEachChild(n, visit);
    };
    visit(program);
    perFile.push({ rel, forms: [...forms].sort() });
  }
  return perFile;
}

const RESOLVE_TEXT_STYLE_LEGAL = [
  '[font-family:…]', '[font-size:…]', 'font-[…]', 'font-black', 'font-bold', 'font-extrabold', 'font-extralight',
  'font-light', 'font-medium', 'font-normal', 'font-semibold', 'font-thin', 'italic', 'leading-[…]',
  'tracking-[…]', 'tracking-normal', 'tracking-tight', 'tracking-tighter', 'tracking-wide', 'tracking-wider', 'tracking-widest',
];

// ── @utility freeze ─────────────────────────────────────────────────
function jxCssUtilities(root) {
  const rels = [JX_CSS_REL];
  if (existsSync(join(root, JX_CSS_MIRROR_REL))) rels.push(JX_CSS_MIRROR_REL);
  const names = new Set();
  const perFile = [];
  for (const rel of rels) {
    const src = readFileSync(join(root, rel), 'utf8');
    const found = [...src.matchAll(/^@utility\s+([\w-]+)/gm)].map((m) => m[1]);
    perFile.push({ rel, names: found });
    for (const n of found) names.add(n);
  }
  const sorted = [...names].sort();
  return { count: sorted.length, names: sorted, hash: sha256(sorted.join('\n')), perFile };
}

// ── .stylex.ts tier-2 literal census ────────────────────────────────
function stylexTier2Literals(root) {
  const out = new Map(); // rel → Map('prop:value' → count)
  for (const rel of scanSources(root)) {
    if (!/\.stylex\.[cm]?[jt]s$/.test(rel)) continue;
    const src = readFileSync(join(root, rel), 'utf8');
    const program = ts.createSourceFile(rel, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const fileMap = new Map();
    const inCreate = [];
    const visit = (n) => {
      if (!n) return;
      if (ts.isCallExpression(n)) {
        const e = n.expression;
        const isCreate = (ts.isIdentifier(e) && e.text === 'create') || (ts.isPropertyAccessExpression(e) && e.name.text === 'create');
        if (isCreate) {
          for (const arg of n.arguments) { inCreate.push(arg); visit(arg); inCreate.pop(); }
          ts.forEachChild(n, visit);
          return;
        }
      }
      // string AND numeric literals: the tier-2 families' shapes are
      // text shapes ('600' and 600 are the same theme slot)
      if (inCreate.length && ts.isPropertyAssignment(n) && (ts.isStringLiteral(n.initializer) || ts.isNumericLiteral(n.initializer))) {
        // Gate-5: quoted property keys ('fontWeight': '550') parse to
        // the SAME prop text as identifier keys — the quoted-key form
        // was a coverage hole (getText() kept the quotes)
        const prop = ts.isIdentifier(n.name)
          ? n.name.text
          : ts.isStringLiteral(n.name) || ts.isNoSubstitutionTemplateLiteral(n.name)
            ? n.name.text
            : n.name.getText?.() ?? '';
        const key = tier2KeyOf(prop, n.initializer.text);
        if (key) fileMap.set(key, (fileMap.get(key) ?? 0) + 1);
      }
      ts.forEachChild(n, visit);
    };
    visit(program);
    if (fileMap.size) out.set(rel, fileMap);
  }
  return out;
}

// ════════════════════════════════════════════════════════════════════
// pin / check
// ════════════════════════════════════════════════════════════════════
function producersBlock(root, pinnedAt = null) {
  const formsByFile = resolveTextStyleForms(root);
  const producers = [
    {
      id: 'cn()',
      module: 'apps/www/src/lib/utils.ts (mirror registry/files/lib/utils.ts)',
      legal: ['<passthrough — cn() emits only what callers pass; its legal set IS the pinned global identity union, counted per file at every call site>'],
      retiresAt: 'P2 (cn() seam retirement)',
    },
    {
      id: 'clsx()',
      module: 'clsx package, via cn() and (rare) direct call sites',
      legal: ['<passthrough — same contract as cn()>'],
      retiresAt: 'P2',
    },
    {
      id: 'resolveTextStyle()',
      module: `${TEXT_STYLE_REL} (mirror ${TEXT_STYLE_MIRROR_REL})`,
      legal: RESOLVE_TEXT_STYLE_LEGAL,
      retiresAt: 'P3 (the bracket emissions leading-[…]/font-[…]/tracking-[…]/[font-family:…]/[font-size:…] retire with P3; named forms migrate to token steps)',
      formsByFile,
    },
    {
      id: 'stylex runtime seam',
      module: '@stylexjs/stylex namespace imports (stylex.create / stylex.attrs(...).class, incl. local sx wrappers)',
      legal: ['<stylex atom classnames — engine-generated hash names, pattern-exempt: the destination lane, not Tailwind identities>'],
      retiresAt: 'never (destination mechanism)',
    },
  ];
  void pinnedAt;
  return producers;
}

// ── the structural contract (Gate-4 anti-tamper) ────────────────────
// The allowlist has two tamper classes, and --check names the one it
// caught. The FILE-LEVEL IDENTITY BUDGET (files[]) is source-derived —
// the gate re-extracts and ratchets it. The STRUCTURAL CONTRACT
// (producers[]/semantics[]) is the registration metadata that decides
// what counts as legal; Gate-4 proved a canonically re-serialized edit
// of those blocks sailed through the format check, so the contract is
// re-derived from THIS script (producersBlock's constant fields +
// SEMANTIC_RULES) and deep-compared against the pinned copy — a pinned
// value can only match by BEING the script's value. formsByFile is
// stripped from both sides here: it is a source census (budget class),
// not contract — but since Gate-5 the census has its OWN ratchet in
// check() (deep per-file compare + the RATCHET.forms budget), so the
// strip no longer means "invisible".
function stripCensusFields(p) {
  const rest = { ...p };
  delete rest.formsByFile;
  return rest;
}
function contractProducers(root) {
  return producersBlock(root).map(stripCensusFields);
}
function contractViolations(root, pinned) {
  const diffs = [];
  const preview = (v) => {
    if (v === undefined) return 'undefined';
    const s = typeof v === 'string' ? v : JSON.stringify(v);
    return `'${s.length > 60 ? `${s.slice(0, 57)}…` : s}'`;
  };
  const walk = (where, contract, pinnedValue) => {
    if (Array.isArray(contract) || Array.isArray(pinnedValue)) {
      if (!Array.isArray(contract) || !Array.isArray(pinnedValue)) {
        diffs.push(`${where}: pinned ${preview(pinnedValue)} is not the contract's array`);
        return;
      }
      if (pinnedValue.length !== contract.length) {
        diffs.push(`${where}: pinned ${pinnedValue.length} ${pinnedValue.length === 1 ? 'entry' : 'entries'} ≠ contract ${contract.length} (${pinnedValue.length > contract.length ? 'injected' : 'deleted'} registration)`);
      }
      for (let i = 0; i < Math.min(contract.length, pinnedValue.length); i++) walk(`${where}[${i}]`, contract[i], pinnedValue[i]);
      return;
    }
    if (contract !== null && typeof contract === 'object') {
      if (pinnedValue === null || typeof pinnedValue !== 'object' || Array.isArray(pinnedValue)) {
        diffs.push(`${where}: pinned ${preview(pinnedValue)} is not the contract's object`);
        return;
      }
      for (const k of Object.keys(contract)) {
        if (!(k in pinnedValue)) diffs.push(`${where}.${k}: DELETED from pinned (contract field missing)`);
        else walk(`${where}.${k}`, contract[k], pinnedValue[k]);
      }
      for (const k of Object.keys(pinnedValue)) if (!(k in contract)) diffs.push(`${where}.${k}: INJECTED into pinned (no such contract field)`);
      return;
    }
    if (contract !== pinnedValue) diffs.push(`${where}: value tampered — pinned ${preview(pinnedValue)} ≠ contract ${preview(contract)}`);
  };
  walk('producers', contractProducers(root), Array.isArray(pinned.producers) ? pinned.producers.map(stripCensusFields) : (pinned.producers ?? []));
  walk('semantics', SEMANTIC_RULES, Array.isArray(pinned.semantics) ? pinned.semantics : (pinned.semantics ?? []));
  return diffs.map((d) => `allowlist CONTRACT tampered: ${d} — producers[]/semantics[] are script-defined (single writer --pin; an intentional registry change is made IN THE SCRIPT, then re-pinned)`);
}

function buildInstance(root, pinnedAt) {
  const { entries, violations } = extractAll(root);
  const files = [...entries.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([path, { zone, identities }]) => ({
      path,
      zone,
      identities: Object.fromEntries([...identities.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))),
    }));
  const tier2 = stylexTier2Literals(root);
  const tier2Files = {};
  for (const [rel, map] of [...tier2.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    tier2Files[rel] = Object.fromEntries([...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)));
  }
  return {
    instance: {
      version: 1,
      pinnedAt,
      generator: GENERATOR,
      files,
      producers: producersBlock(root),
      semantics: SEMANTIC_RULES, // the registered lane-2 composites (exempt at extraction; the registry above is the single source)
      exclusions: {
        codeFences: [
          'CodeBlock `code` prop (component-name blacklist — never a class position)',
          'backtick usage/demo strings assigned to consts and passed as content/code/files props in docs pages',
          'ComponentCanvas tree-file content values (sample code, not runtime markup)',
        ],
        astBoundary:
          'Svelte AST class=/class: attributes (Text chunks + positional string-literal fragments of expressions, each-scope bindings resolved) + TS AST string literals inside cn()/clsx() calls and template compositions + REGISTERED producers (cn(), clsx(), resolveTextStyle(), stylex runtime seam) at class positions; everything else (plain string vars, imported helpers, props) is producer territory — props are caller-supplied (counted in the caller file), unregistered producers are red',
      },
      jxCssUtilities: jxCssUtilities(root),
      stylexTier2Literals: tier2Files,
    },
    violations,
  };
}

function pin(root, allowlistPath, pinnedAt) {
  const { instance, violations } = buildInstance(root, pinnedAt);
  const blocking = violations.filter((v) => v.kind === 'unregistered-producer' || v.kind === 'parse-error');
  if (blocking.length) {
    console.error(`[tailwindless] ✗ --pin refused: ${blocking.length} unaccounted site(s) — a pin must freeze a fully accounted tree`);
    for (const v of blocking) console.error(`  RED ${v.detail}`);
    process.exit(1);
  }
  mkdirSync(dirname(allowlistPath), { recursive: true });
  writeFileSync(allowlistPath, canonicalJson(instance));
  const totals = totalsOf(instance);
  console.log(`[tailwindless] pinned ${totals.files} files · ${totals.identities} identities · ${totals.occurrences} occurrences (routes ${totals.zones.routes} / site-libs ${totals.zones['site-libs']} / ui ${totals.zones.ui}) → ${relative(root, allowlistPath)}`);
}

function totalsOf(instance) {
  let occurrences = 0;
  let identities = 0;
  const zones = { routes: 0, 'site-libs': 0, ui: 0, other: 0 };
  const zoneFiles = { routes: 0, 'site-libs': 0, ui: 0, other: 0 };
  for (const f of instance.files ?? []) {
    const n = Object.values(f.identities).reduce((a, b) => a + b, 0);
    occurrences += n;
    identities += Object.keys(f.identities).length;
    zones[f.zone] += n;
    zoneFiles[f.zone] += 1;
  }
  return { files: instance.files.length, identities, occurrences, zones, zoneFiles };
}

function check(root, allowlistPath) {
  const raw = readFileSync(allowlistPath, 'utf8');
  const pinned = JSON.parse(raw);
  const red = [];
  // single-writer law: the file must BE the canonical serialization
  if (raw !== canonicalJson(pinned)) {
    red.push('allowlist is not the canonical serialization — hand edits are forbidden (single writer: `node scripts/verify-tailwindless.mjs --pin`)');
  }
  if (pinned.generator !== GENERATOR) red.push(`allowlist generator mismatch: ${pinned.generator}`);
  if (pinned.version !== 1) red.push(`allowlist version != 1`);

  // structural contract (Gate-4): producers[]/semantics[] must BE the
  // script-defined registry — a canonically re-serialized edit of the
  // pinned copy is not a legitimate state of the allowlist
  red.push(...contractViolations(root, pinned));

  // Gate-5 monotonic ratchet (bypass-2): the pinned budget itself is
  // bounded by the script's RATCHET constants — raising counts inside
  // files[] and canonicalizing (the Codex attack: an identity 1→999,
  // occurrences 25024→26022, GREEN) now trips the ceiling. The only
  // way to lift one is editing this script (review-visible).
  const rt = totalsOf(pinned);
  const budgetOver = [];
  if (rt.files > RATCHET.files) budgetOver.push(`files ${rt.files} > ${RATCHET.files} (net-new unretired file entries)`);
  if (rt.identities > RATCHET.identities) budgetOver.push(`identities ${rt.identities} > ${RATCHET.identities}`);
  if (rt.occurrences > RATCHET.occurrences) budgetOver.push(`occurrences ${rt.occurrences} > ${RATCHET.occurrences}`);
  for (const z of RATCHET_ZONE_KEYS) if ((rt.zones[z] ?? 0) > RATCHET.zones[z]) budgetOver.push(`zone ${z} ${rt.zones[z]} > ${RATCHET.zones[z]}`);
  for (const over of budgetOver) {
    red.push(`pinned budget RAISED above the script ratchet: ${over} — the RATCHET constants live in scripts/verify-tailwindless.mjs; lifting a ceiling is a gate-source change (review-visible), never an allowlist edit`);
  }

  // re-extract
  const { entries, violations } = extractAll(root);
  for (const v of violations) red.push(v.detail);
  const pinnedFiles = new Map((pinned.files ?? []).map((f) => [f.path, f.identities ?? {}]));

  for (const [path, { identities }] of [...entries.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const pinnedIdents = pinnedFiles.get(path);
    if (!pinnedIdents) {
      const idents = [...identities.keys()].sort();
      red.push(`${path}: file has ${idents.length} class identit${idents.length === 1 ? 'y' : 'ies'} but is NOT pinned (new class-bearing file) — e.g. ${idents.slice(0, 4).map((i) => `'${i}'`).join(', ')}`);
      continue;
    }
    const added = [];
    for (const [tok, count] of identities) {
      const pc = pinnedIdents[tok];
      if (pc === undefined) added.push(tok);
      else if (count > pc) red.push(`${path}: identity '${tok}' count grew ${pc} → ${count}`);
    }
    for (const tok of added.slice(0, 8)) red.push(`${path}: NEW identity '${tok}' (not in the pinned set)`);
    if (added.length > 8) red.push(`${path}: …and ${added.length - 8} more new identities`);
    const removed = Object.keys(pinnedIdents).filter((tok) => !identities.has(tok));
    if (added.length && removed.length) {
      red.push(`${path}: EQUAL-COUNT IDENTITY SWAP — +[${added.slice(0, 4).join(', ')}] −[${removed.slice(0, 4).join(', ')}] (a swap is growth, not migration)`);
    }
    // removals are legal (migration direction)
  }

  // producer: resolveTextStyle source forms
  const rtsPinned = (pinned.producers ?? []).find((p) => p.id === 'resolveTextStyle()');
  if (rtsPinned) {
    for (const { rel, forms } of resolveTextStyleForms(root)) {
      for (const form of forms) {
        if (!rtsPinned.legal.includes(form)) red.push(`${rel}: producer resolveTextStyle() emission form '${form}' is outside its pinned legal set (unregistered producer growth)`);
      }
    }
  } else {
    red.push('producers[] lost the resolveTextStyle() registration');
  }

  // Gate-5 (bypass-3): formsByFile was stripped as "census" and never
  // compared — a canonical rewrite to evil-only stayed GREEN. The
  // census is now deep-compared per file: the current rel set must be
  // ⊆ the pinned rels, no current form may be missing from its pinned
  // file's list, and the pinned forms total rides the RATCHET (census
  // padding is a budget raise). Form/rel removal stays legal — that
  // is the migration direction (monotonic decrease).
  const pinnedFormsByFile = rtsPinned?.formsByFile;
  if (!Array.isArray(pinnedFormsByFile)) {
    red.push('producers[] lost the resolveTextStyle() formsByFile census — the census is ratcheted, not strippable (Gate-5)');
  } else {
    const currentFormsByFile = resolveTextStyleForms(root);
    const pinnedFormsRels = new Set(pinnedFormsByFile.map((e) => e.rel));
    const pinnedFormsTotal = pinnedFormsByFile.reduce((a, e) => a + (Array.isArray(e.forms) ? e.forms.length : 0), 0);
    if (pinnedFormsTotal > RATCHET.forms) red.push(`formsByFile census budget RAISED: ${pinnedFormsTotal} forms > ratchet ${RATCHET.forms} — padding the census is a budget raise (RATCHET lives in the script)`);
    for (const { rel, forms } of currentFormsByFile) {
      if (!pinnedFormsRels.has(rel)) red.push(`${rel}: producer census file is NEW against the pinned formsByFile (bypass-3: the census no longer strips away)`);
      const pinnedFormsSet = new Set(pinnedFormsByFile.find((e) => e.rel === rel)?.forms ?? []);
      for (const form of forms) {
        if (!pinnedFormsSet.has(form)) red.push(`${rel}: producer census form '${form}' is NEW against the pinned formsByFile (bypass-3: the census no longer strips away)`);
      }
    }
  }

  // @utility freeze (growth red; removal legal)
  const pinnedUtils = pinned.jxCssUtilities;
  if (pinnedUtils) {
    const current = jxCssUtilities(root);
    if (current.count > pinnedUtils.count || current.names.some((n) => !pinnedUtils.names.includes(n))) {
      const added = current.names.filter((n) => !pinnedUtils.names.includes(n));
      red.push(`@utility sheet GREW: ${pinnedUtils.count} → ${current.count}${added.length ? ` (added: ${added.map((n) => `'${n}'`).join(', ')})` : ''} — the jx @utility grammar is frozen`);
    }
  } else {
    red.push('allowlist lost the jxCssUtilities freeze');
  }

  // PFINAL negative (tailwindless one-shot W4-r2, the spec's frozen
  // post-engine layer statement): the utilities tier DIED with the
  // engine — no repo css prelude may mention it again. A stale
  // utilities-tier statement re-registers a layer nothing of ours
  // emits into, re-coupling the kernel to a consumer engine's tier.
  for (const tree of ['apps/www/src', 'registry/files']) {
    for (const rel of walkDir(join(root, tree), tree)) {
      if (!rel.endsWith('.css')) continue;
      const text = readFileSync(join(root, tree, rel), 'utf8');
      const hit = text.match(/^@layer [^;{]*\butilities\b[;{]/m);
      if (hit) red.push(`${tree}/${rel}: stale utilities-tier layer statement ('${hit[0].trim()}') — the tier died with the engine (PFINAL); the canonical prelude ends at components(.stylex.*)`);
    }
  }

  // PFINAL enclave (W4-r3): the design-tool studio is the ONE frozen
  // Tailwind-consumer css (spec: "keeps the engine fan-in BY DESIGN");
  // the ONLY @import 'tailwindcss' allowed anywhere in repo css is
  // that exact file — a second one is a new engine coupling.
  {
    const ENCLAVE = 'packages/design-tool/src/studio/studio-static.css';
    for (const tree of ['apps/www/src', 'registry/files', 'packages']) {
      for (const rel of walkDir(join(root, tree), tree)) {
        if (!rel.endsWith('.css')) continue;
        const p = `${tree}/${rel}`;
        if (p === ENCLAVE) continue;
        const text = readFileSync(join(root, p), 'utf8');
        if (/^@import\s+['"]tailwindcss['"]/m.test(text)) {
          red.push(`${p}: @import 'tailwindcss' outside the frozen design-tool enclave (${ENCLAVE}) — the engine died everywhere else (PFINAL)`);
        }
      }
    }
  }

  // .stylex.ts tier-2 literals (growth red; removal legal). Baseline =
  // the pinned block ∪ the explicit Gate-4 grandfather ledger, taking
  // the max per key (the ledger only backfills pre-extension keys).
  const pinnedTier2 = pinned.stylexTier2Literals ?? {};
  const currentTier2 = stylexTier2Literals(root);
  for (const [rel, map] of currentTier2) {
    const grandfather = TIER2_GRANDFATHER[rel] ?? {};
    const pinnedMap = { ...grandfather, ...(pinnedTier2[rel] ?? {}) };
    for (const [k, c] of Object.entries(grandfather)) if ((pinnedMap[k] ?? 0) < c) pinnedMap[k] = c;
    for (const [key, count] of map) {
      const pc = pinnedMap[key];
      if (pc === undefined) red.push(`${rel}: stylex tier-2 literal '${key}' is NEW (theme-able slot, token-bound only — promote the value to a token step)`);
      else if (count > pc) red.push(`${rel}: stylex tier-2 literal '${key}' count grew ${pc} → ${count}`);
    }
  }
  // Gate-5 (bypass-5), the REVERSE ledger check: a grandfather entry
  // whose literal no longer exists in the source is STALE — the
  // migration happened; leaving the entry in place re-opens the slot
  // it froze. A retired FILE sleeps (no file, no debt), but a live
  // file with a fully-migrated literal must have its entry deleted.
  for (const [rel, entries] of Object.entries(TIER2_GRANDFATHER)) {
    if (!existsSync(join(root, rel))) continue;
    const live = currentTier2.get(rel);
    for (const key of Object.keys(entries)) {
      if (!live?.has(key)) red.push(`${rel}: stale ledger entry '${key}' — the literal migrated, delete the entry (TIER2_GRANDFATHER in scripts/verify-tailwindless.mjs; a stale entry re-opens the slot it froze)`);
    }
  }

  if (red.length) {
    console.error(`[tailwindless] ✗ RED — ${red.length} violation(s):`);
    for (const line of red) console.error(`  ✗ ${line}`);
    return { ok: false, red };
  }
  const totals = totalsOf(pinned);
  console.log(`[tailwindless] ✓ GREEN — ${entries.size} class-bearing files against the pin (pinned ${totals.files} files · ${totals.identities} identities · ${totals.occurrences} occurrences); no growth, no new identities, no unregistered producers, contract intact (producers/semantics = script-defined), @utility freeze ${pinned.jxCssUtilities.count}, tier-2 literals ${Object.keys(pinnedTier2).length} file(s)`);
  // Gate-5: pinned < ratchet means the migration moved — surface the
  // headroom so the constants get lowered at the next pin (a ratchet
  // that never ratchets down is just a ceiling)
  const headroom = [];
  if (rt.files < RATCHET.files) headroom.push(`files ${RATCHET.files}→${rt.files}`);
  if (rt.identities < RATCHET.identities) headroom.push(`identities ${RATCHET.identities}→${rt.identities}`);
  if (rt.occurrences < RATCHET.occurrences) headroom.push(`occurrences ${RATCHET.occurrences}→${rt.occurrences}`);
  for (const z of RATCHET_ZONE_KEYS) if ((rt.zones[z] ?? 0) < RATCHET.zones[z]) headroom.push(`${z} ${RATCHET.zones[z]}→${rt.zones[z]}`);
  if (Array.isArray(pinnedFormsByFile)) {
    const formsTotal = pinnedFormsByFile.reduce((a, e) => a + (Array.isArray(e.forms) ? e.forms.length : 0), 0);
    if (formsTotal < RATCHET.forms) headroom.push(`forms ${RATCHET.forms}→${formsTotal}`);
  }
  if (headroom.length) console.log(`[tailwindless] ratchet headroom (migration progressed — lower the RATCHET constants at the next pin): ${headroom.join(', ')}`);
  return { ok: true, red: [] };
}

// ════════════════════════════════════════════════════════════════════
// selftest — negative fixtures in a throwaway sandbox
// ════════════════════════════════════════════════════════════════════
const FIXTURE_DEMO_PAGE = `<script lang="ts">
  import { cn } from '$lib/utils';
  import { resolveTextStyle } from '$lib/text-style.svelte';
  let active = $state(false);
  const label = 'text-xs font-mono';
  const variants = {
    fill: 'bg-(--jx-fill) border-(color:--jx-fill)',
    tonal: 'bg-[color-mix(in_oklab,var(--jx-tonal)_12%,transparent)]',
  } as const;
</script>

<div class="flex items-center gap-2 border border-border px-3 py-2">
  <span class={label}>static via const</span>
  <span class={cn('inline-flex', active && 'font-bold', variants[active ? 'fill' : 'tonal'], 'text-xs')}
    >cn composition</span>
  <span class={active ? 'text-primary' : 'text-muted-foreground'}
    >ternary</span>
  <span class={\`leading-5 \${active ? 'tracking-wide' : ''}\`}>template</span>
  <span class={resolveTextStyle({ weight: 'bold', italic: true })}>registered producer</span>
</div>
`;

const FIXTURE_WG = `<script lang="ts">
  import { cn } from '$lib/utils';
  let { class: className = '' } = $props();
</script>

<button class={cn('border border-border px-2', className)}>wg</button>
`;

const FIXTURE_STYLEX = `import * as stylex from '@stylexjs/stylex';
import { tokens } from './tokens.stylex';

export const styles = stylex.create({
  shell: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-gap'],
    paddingInline: tokens['--jx-inset'],
  },
  label: { fontSize: tokens['--jx-text-secondary'] },
});
`;

const JX_CSS_7 = [
  '@utility jx-hue-primary { --jx-tonal: var(--primary); }',
  '@utility jx-hue-neutral { --jx-tonal: var(--muted-foreground); }',
  '@utility jx-hue-error { --jx-tonal: var(--error); }',
  '@utility jx-hue-success { --jx-tonal: var(--success); }',
  '@utility jx-hue-warning { --jx-tonal: var(--warning); }',
  '@utility jx-hue-info { --jx-tonal: var(--info); }',
  '@utility jx-pair-destructive { --jx-pair: var(--destructive); }',
].join('\n');

function buildSandbox() {
  const sandbox = mkdtempSync(join(tmpdir(), 'twl-selftest-'));
  const p = (rel) => join(sandbox, rel);
  const w = (rel, text) => { mkdirSync(dirname(p(rel)), { recursive: true }); writeFileSync(p(rel), text); };
  w('apps/www/src/routes/demo.html/+page.svelte', FIXTURE_DEMO_PAGE);
  w('apps/www/src/lib/ui/wg/wg.svelte', FIXTURE_WG);
  mkdirSync(dirname(p('registry/files/ui/wg/wg.svelte')), { recursive: true });
  cpSync(p('apps/www/src/lib/ui/wg/wg.svelte'), p('registry/files/ui/wg/wg.svelte'));
  cpSync(join(REAL_ROOT, TEXT_STYLE_REL), p(TEXT_STYLE_REL));
  mkdirSync(dirname(p(TEXT_STYLE_MIRROR_REL)), { recursive: true });
  cpSync(join(REAL_ROOT, TEXT_STYLE_REL), p(TEXT_STYLE_MIRROR_REL));
  w('apps/www/src/lib/jixoai.css', JX_CSS_7 + '\n');
  mkdirSync(dirname(p(JX_CSS_MIRROR_REL)), { recursive: true });
  cpSync(p('apps/www/src/lib/jixoai.css'), p(JX_CSS_MIRROR_REL));
  w('apps/www/src/lib/wg.stylex.ts', FIXTURE_STYLEX);
  return { sandbox, p, w };
}

function selftest() {
  const cases = [];
  // each case gets a FRESH sandbox + baseline pin, mutates, checks,
  // and is removed — mutations can never bleed across cases (a case
  // may mutate SCRIPT state too — the ledger — and then must return a
  // restore function, called before the sandbox goes down)
  const runCase = (name, mutate, expect) => {
    const { sandbox, p } = buildSandbox();
    const allowlist = join(sandbox, 'allowlist.json');
    let cleanup;
    try {
      pin(sandbox, allowlist, '2026-09-17');
      cleanup = mutate(p);
      const { ok, red } = check(sandbox, allowlist);
      const hit = red.filter((line) => expect.test(line));
      cases.push({ name, triggered: !ok && hit.length > 0, evidence: hit.slice(0, 2) });
    } finally {
      if (typeof cleanup === 'function') cleanup();
      rmSync(sandbox, { recursive: true, force: true });
    }
  };

  runCase(
    '(a) new utility added to a pinned class',
    (p) => {
      const file = p('apps/www/src/routes/demo.html/+page.svelte');
      const before = readFileSync(file, 'utf8');
      writeFileSync(file, before.replace('class="flex items-center gap-2', 'class="flex mt-98 items-center gap-2'));
    },
    /NEW identity 'mt-98'/,
  );

  runCase(
    '(b) equal-count identity swap (a pinned identity replaced by a fresh one)',
    (p) => {
      const file = p('apps/www/src/routes/demo.html/+page.svelte');
      const before = readFileSync(file, 'utf8');
      // 'tracking-wide' occurs exactly once (the template ternary) — swapping
      // it for 'tracking-wider' is +1 new / −1 old: an equal-count swap
      writeFileSync(file, before.replace("'tracking-wide'", "'tracking-wider'"));
    },
    /EQUAL-COUNT IDENTITY SWAP/,
  );

  runCase(
    '(c) unregistered producer at a class position',
    (p) => {
      const file = p('apps/www/src/routes/rogue.html/+page.svelte');
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, `<script lang="ts">
  // a helper imported from elsewhere building class strings — NOT registered
  import { tw } from '$lib/rogue-helper';
</script>

<div class={tw('p-4')}>rogue producer</div>
`);
    },
    /unregistered dynamic class producer.*'rogue-helper'|unregistered dynamic class producer \(call to `tw`/,
  );

  runCase(
    '(d) tier-2 literal in a .stylex.ts',
    (p) => {
      const file = p('apps/www/src/lib/wg.stylex.ts');
      const before = readFileSync(file, 'utf8');
      writeFileSync(file, before.replace("display: 'flex',", "display: 'flex',\n    padding: '9px',"));
    },
    /tier-2 literal 'padding:9px'/,
  );

  runCase(
    '(e) @utility growth in jixoai.css',
    (p) => {
      const file = p('apps/www/src/lib/jixoai.css');
      const before = readFileSync(file, 'utf8');
      writeFileSync(file, before + '@utility jx-hue-extra { --jx-tonal: var(--extra); }\n');
    },
    /@utility sheet GREW/,
  );

  runCase(
    '(f) hand-edited allowlist (non-canonical serialization)',
    (p) => {
      const allowlist = join(p(''), 'allowlist.json');
      const parsed = JSON.parse(readFileSync(allowlist, 'utf8'));
      writeFileSync(allowlist, JSON.stringify(parsed, null, 4) + '\n'); // wrong indent + unsorted keys
    },
    /not the canonical serialization/,
  );

  runCase(
    '(g) canonically-serialized allowlist with tampered contract fields (producers[].legal / semantics[].scope)',
    (p) => {
      const allowlist = join(p(''), 'allowlist.json');
      const parsed = JSON.parse(readFileSync(allowlist, 'utf8'));
      // the Gate-4 attack: edit the contract CONTENT, re-serialize
      // canonically — the format check passes; only the deep compare
      // against the script's own definitions can catch it
      parsed.producers[0].legal = ['<passthrough — TAMPERED: any class goes>'];
      parsed.semantics[0].scope = 'tampered scope — anything goes';
      writeFileSync(allowlist, canonicalJson(parsed));
    },
    /allowlist CONTRACT tampered: (producers\[\d+\]\.legal|semantics\[\d+\]\.scope)/,
  );

  runCase(
    '(h) spoofed .stylex.ts channel — a dynamic producer hiding behind the suffix (no stylex.create)',
    (p) => {
      const rogue = p('apps/www/src/lib/rogue.stylex.ts');
      mkdirSync(dirname(rogue), { recursive: true });
      writeFileSync(rogue, `// NO @stylexjs import, NO top-level stylex.create — the suffix
// alone is not a stylex channel (the Gate-4 spoof)
export const evil = (extra: string) => \`shadow-xl blur-sm \${extra}\`;
`);
      const page = p('apps/www/src/routes/rogue-stylex.html/+page.svelte');
      mkdirSync(dirname(page), { recursive: true });
      writeFileSync(page, `<script lang="ts">
  import { evil } from '$lib/rogue.stylex';
</script>

<div class={evil('p-4')}>spoofed stylex channel</div>
`);
    },
    /unregistered dynamic class producer \(call to `evil` imported from '\$lib\/rogue\.stylex'/,
  );

  runCase(
    '(i) fontWeight string literal planted in a legal .stylex.ts (theme slot — token-bound only)',
    (p) => {
      const file = p('apps/www/src/lib/wg.stylex.ts');
      const before = readFileSync(file, 'utf8');
      writeFileSync(file, before.replace("label: { fontSize: tokens['--jx-text-secondary'] },", "label: { fontSize: tokens['--jx-text-secondary'], fontWeight: '600' },"));
    },
    /tier-2 literal 'fontWeight:600'/,
  );

  runCase(
    '(j) rogue export smuggled through a LEGAL stylex module (the channel is per export, not per module)',
    (p) => {
      // the Gate-5 bypass-4 attack: the module KEEPS its legal
      // stylex.create — the module-level verification passes — and
      // smuggles an arbitrary producer as one extra export
      const file = p('apps/www/src/lib/wg.stylex.ts');
      writeFileSync(file, readFileSync(file, 'utf8') + `\nexport const evil = (extra: string) => \`shadow-xl blur-sm \${extra}\`;\n`);
      const page = p('apps/www/src/routes/rogue-export.html/+page.svelte');
      mkdirSync(dirname(page), { recursive: true });
      writeFileSync(page, `<script lang="ts">
  import { evil } from '$lib/wg.stylex';
</script>

<div class={evil('p-4')}>rogue export in a verified module</div>
`);
    },
    /export `evil` is neither stylex\.create output nor a registered helper/,
  );

  runCase(
    '(k) animationDuration planted in a legal .stylex.ts (tier-2 animation-family coverage)',
    (p) => {
      // the Gate-5 bypass-5 attack: 1ms in an uncovered family sailed
      // through — animationDuration/animationDelay/animationTimingFunction
      // are tier-2 slots now
      const file = p('apps/www/src/lib/wg.stylex.ts');
      const before = readFileSync(file, 'utf8');
      writeFileSync(file, before.replace("label: { fontSize: tokens['--jx-text-secondary'] },", "label: { fontSize: tokens['--jx-text-secondary'], animationDuration: '1ms' },"));
    },
    /tier-2 literal 'animationDuration:1ms'/,
  );

  runCase(
    '(l) grandfather ledger entry deleted while its literal still has stock',
    (p) => {
      // the probe-corpus file appears AFTER the pin — the ledger is its
      // only coverage (the real tree's state: the pin predates the
      // family extension). Deleting the still-needed entry un-covers
      // the literal → NEW. The ledger mutation is SCRIPT state: restore.
      const rel = 'apps/www/src/lib/__probe__/stylex-corpus/code-card.stylex.ts';
      const file = p(rel);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, `import * as stylex from '@stylexjs/stylex';

export const codeCardStyles = stylex.create({
  card: {
    lineHeight: '1.6',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease-out',
  },
});
`);
      delete TIER2_GRANDFATHER[rel]['lineHeight:1.6'];
      return () => { TIER2_GRANDFATHER[rel]['lineHeight:1.6'] = 1; };
    },
    /tier-2 literal 'lineHeight:1\.6' is NEW/,
  );

  runCase(
    '(m) source retired a ledger literal but the ledger entry stays (stale-entry reverse check)',
    (p) => {
      // lineHeight:1.6 migrated to a token; the OTHER ledger literals
      // remain — the stale entry must go red until deleted
      const rel = 'apps/www/src/lib/__probe__/stylex-corpus/code-card.stylex.ts';
      const file = p(rel);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, `import * as stylex from '@stylexjs/stylex';

export const codeCardStyles = stylex.create({
  card: {
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease-out',
  },
});
`);
    },
    /stale ledger entry 'lineHeight:1\.6'/,
  );

  console.log(`\n[tailwindless] selftest — ${cases.length} negative fixtures:`);
  let failed = 0;
  for (const c of cases) {
    const mark = c.triggered ? '✓ RED triggered' : '✗ DID NOT TRIGGER';
    if (!c.triggered) failed++;
    console.log(`  ${mark} — ${c.name}`);
    if (c.triggered && c.evidence[0]) console.log(`      ${c.evidence[0]}`);
  }
  if (failed) {
    console.error(`[tailwindless] ✗ selftest FAILED — ${failed} fixture(s) did not go red`);
    process.exit(1);
  }
  console.log('[tailwindless] ✓ selftest GREEN — every negative fixture went red');
}

// ── CLI ─────────────────────────────────────────────────────────────
const mode = process.argv[2];
const root = REAL_ROOT;
if (mode === '--pin') {
  pin(root, join(root, ALLOWLIST_REL), '2026-09-17');
} else if (mode === '--check') {
  const allowlistPath = allowlistPathFor(root);
  if (!existsSync(allowlistPath)) {
    console.error(`[tailwindless] ✗ allowlist missing: ${ALLOWLIST_REL} (archive fallback ${ALLOWLIST_ARCHIVE_REL} absent too) — run --pin first`);
    process.exit(1);
  }
  const { ok } = check(root, allowlistPath);
  if (!ok) process.exit(1);
} else if (mode === '--selftest') {
  selftest();
} else {
  console.error('usage: node scripts/verify-tailwindless.mjs --pin | --check | --selftest');
  process.exit(2);
}
