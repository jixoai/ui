#!/usr/bin/env node
// verify-stylex-authoring — the authoring law's teeth
// (stylex-kernel-phase0 P0.5; spec deltas: component-authoring MODIFIED
// "styling posture" + css-architecture ADDED "the canonical layer law";
// design §4).
//
// THE LAW ENFORCED (the spec's forbidden list, nothing more):
//
//   1. FACTORY CALLS — a function value inside stylex.create()
//      (`dyn: (w) => ({ width: `${w}px` })`) — the typed-dynamic idiom
//      the research's trilogy proved silently breaks; the sanctioned
//      dynamic path is the CSS-var seam (atoms consume var(--jx-*),
//      components compute the vars).
//   2. VARS-KEYS — a `vars:` key inside stylex.create() — the
//      createTheme-style override idiom; same ruling (§4.2).
//   3. SHORTHANDS — the properties the PINNED ENGINE REJECTS (throws)
//      under our styleResolution ('property-specificity'): the
//      background/border/all/animation family + their logical-side
//      aliases, extracted from
//      packages/vite-plugin/node_modules/@stylexjs/babel-plugin's own
//      throwing table (18 names — the derivation is asserted against
//      the installed pin at gate runtime, so an engine bump that moves
//      the list fails HERE loudly instead of silently narrowing).
//      margin/padding/inset/gap/flex/overflow/textDecoration and every
//      other engine-ACCEPTED shorthand are LAWFUL (Gate-2 P1-3: the
//      engine passes them through to the compiled css as standard CSS
//      — browsers expand shorthand at parse time; the dogfood corpus
//      carries them as-is). The law's line is the ENGINE's line: what
//      throw mode rejects is forbidden, what it accepts is legal.
//
//   Plus the canonical layer law on the ledger's .css files (the
//   spec's scenarios): every stylex-touched folder sheet opens with
//   the EXACT canonical FULL statement; an engine-output css (compiled
//   atom class selectors) may never sit in a hand-authored sheet —
//   the plugin owns engine statements.
//
// SCAN SCOPE = the migration ledger (research/migration-ledger.json,
// read repo-ROOT-relative — the P0.6 ruling): the stylex-touched trees
// ONLY. Legacy trees (~147 sheets on the old four-layer form) are
// NEVER scanned — no mass-failure, no silent exemption (the spec's
// transitional-scoping clause).
//
// ALWAYS-ON TEETH (the popover-probe negative-control precedent —
// proven every run, not once):
//   - each forbidden pattern planted in a sandbox module FAILS the
//     scan naming file + pattern;
//   - a planted shorthand additionally FAILS THE REAL ENGINE (the
//     babel transform under the kernel pins throws — the
//     propertyValidationMode:'throw' receipt, P0.5's first row);
//   - a ledger sheet with a varied layer statement FAILS; a legal one
//     passes.
//
// Usage (from repo root): node scripts/verify-stylex-authoring.mjs

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const die = (msg) => {
  console.error(`\n✗ verify:stylex-authoring FAILED — ${msg}`);
  process.exit(1);
};

// ── the shorthand blacklist, DERIVED from the installed pin ─────────
// (the babel-plugin's throwing table under styleResolution
// 'property-specificity' — the exact set our build's throw mode
// rejects; a pin bump that changes the table fails this derivation)
const pluginRequire = createRequire(join(root, 'packages/vite-plugin/package.json'));
const babelPluginPath = pluginRequire.resolve('@stylexjs/babel-plugin');
const babelPluginSrc = readFileSync(babelPluginPath, 'utf8');
function deriveThrowingShorthands() {
  // `const shorthands = { … name: _value => { throw new Error(…) } … }`
  const tableStart = babelPluginSrc.indexOf('const shorthands = {');
  if (tableStart < 0) throw new Error('authoring: cannot locate the babel-plugin shorthand table (pin drift)');
  const table = babelPluginSrc.slice(tableStart, babelPluginSrc.indexOf('\n};', tableStart));
  const direct = [...table.matchAll(/^\s{2}([A-Za-z]+):\s*_?(?:value|rawValue)?\s*=>\s*\{/gm)].map((m) => m[1]);
  // the alias table maps alias names onto the same throwing functions
  const aliasStart = babelPluginSrc.indexOf('const aliases = {', tableStart);
  const aliasTable = babelPluginSrc.slice(aliasStart, babelPluginSrc.indexOf('\n};', aliasStart));
  const aliases = [...aliasTable.matchAll(/^\s{2}([A-Za-z]+):\s*shorthands\.[A-Za-z]+,/gm)].map((m) => m[1]);
  return [...new Set([...direct, ...aliases])];
}
const THROWING_SHORTHANDS = deriveThrowingShorthands();
const SHORTHAND_RE = new RegExp(`(?:^|[^\\w-])(?:${THROWING_SHORTHANDS.join('|')})\\s*:`, 'g');

// the canonical layer law — from the BUILT plugin dist (single source)
const { canonicalLayerStatement, maxStylexPriority, parseCanonicalStatement } = await import(
  pathToFileURL(join(root, 'packages/vite-plugin/dist/stylex/layer-law.js')).href
);

// ── the scanners ─────────────────────────────────────────────────────

/** strip line + block comments (the corpus documents its law in prose — comments are not code) */
function stripComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(m.length - p1.length));
}

/** the balanced-brace argument text of every `stylex.create(`/`stylex.keyframes(` call */
function declarationScopes(code) {
  const scopes = [];
  const re = /stylex\.(?:create|keyframes)\s*\(/g;
  for (const m of code.matchAll(re)) {
    const open = code.indexOf('{', m.index + m[0].length - 1);
    if (open < 0) continue;
    let depth = 0;
    for (let i = open; i < code.length; i++) {
      if (code[i] === '{') depth++;
      else if (code[i] === '}') {
        depth--;
        if (depth === 0) {
          scopes.push(code.slice(open, i + 1));
          break;
        }
      }
    }
  }
  return scopes;
}

/**
 * Scan one module's text for the forbidden patterns.
 * Returns [{ file, pattern, detail }].
 */
function scanStylexModule(file, code) {
  const findings = [];
  const bare = stripComments(code);
  const scopes = declarationScopes(bare);
  if (scopes.length === 0) return findings; // not an atoms module (e.g. a pure defineVars table)
  for (const scope of scopes) {
    if (/=>/.test(scope)) findings.push({ file, pattern: 'factory', detail: 'a function value inside stylex.create()/keyframes() — dynamic values ride the CSS-var seam (atoms consume var(--jx-*), the component computes the vars)' });
    if (/(?:^|[,{\n])\s*(?:'vars'|"vars"|vars)\s*:/.test(scope)) findings.push({ file, pattern: 'vars-key', detail: 'a `vars:` key inside create() — build-time theme classes are outside the sanctioned dynamic idiom' });
    const shorthands = [...new Set([...scope.matchAll(SHORTHAND_RE)].map((m) => m[0].replace(/[^A-Za-z]/g, '')))];
    for (const name of shorthands) {
      findings.push({ file, pattern: 'shorthand', detail: `shorthand property \`${name}:\` — the pinned engine throws on it (spike §5.3); author the longhand expansion` });
    }
  }
  return findings;
}

/** the canonical layer statement check for a ledger .css sheet */
function scanSheet(file, css) {
  const findings = [];
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s+/, '');
  const parsed = parseCanonicalStatement(stripped);
  if (!parsed) {
    findings.push({
      file,
      pattern: 'canonical-statement',
      detail: `the sheet must open with the exact canonical statement (found: ${JSON.stringify(stripped.slice(0, 80))}…)`,
    });
  } else if (parsed.maxPriority < maxStylexPriority(stripped)) {
    findings.push({
      file,
      pattern: 'canonical-statement',
      detail: `the statement covers priority1..${parsed.maxPriority} but the sheet mentions stylex.priority${maxStylexPriority(stripped)} — every carried tier must be covered, utilities last`,
    });
  }
  // engine output never lives in a hand-authored sheet: a standalone
  // compiled-atom rule prelude (`.x10w6t97 {`) is the engine's emission
  // shape — the plugin owns it
  if (/\n\s*\.x[0-9a-z]{4,12}\s*\{/.test(css)) {
    findings.push({ file, pattern: 'hand-authored-engine-output', detail: 'compiled atom class selectors in a hand-authored sheet — engine-emitted css is the plugin\'s, never hand-written or pasted' });
  }
  return findings;
}

function scanLedgerFiles(entries) {
  // entries: [{ file (display path), path (absolute), code }]
  const findings = [];
  for (const e of entries) {
    if (e.file.endsWith('.stylex.ts')) findings.push(...scanStylexModule(e.file, e.code));
    else if (e.file.endsWith('.css')) findings.push(...scanSheet(e.file, e.code));
    else findings.push({ file: e.file, pattern: 'ledger-kind', detail: 'the ledger lists .stylex.ts modules and stylex-touched .css sheets — this entry is neither' });
  }
  return findings;
}

// ── main: the REAL ledger ────────────────────────────────────────────

console.log('━━ verify:stylex-authoring · the migration ledger (the stylex-touched trees) ━━━━━━━━━━━');
const ledgerPath = join(root, 'research/migration-ledger.json');
if (!existsSync(ledgerPath)) die('research/migration-ledger.json missing (P0.6 seeds it)');
const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'));
if (ledger.version !== 1) die(`unknown migration-ledger version ${ledger.version}`);
const realEntries = ledger.files.map((file) => {
  const abs = join(root, file);
  if (!existsSync(abs)) die(`ledger file missing: ${file}`);
  return { file, code: readFileSync(abs, 'utf8') };
});
const realFindings = scanLedgerFiles(realEntries);
for (const f of realFindings) console.log(`  FAIL  [${f.pattern}] ${f.file}: ${f.detail}`);
check(
  `the ${realEntries.length} ledger file(s) obey the authoring law`,
  realFindings.length === 0,
  realFindings.length === 0 ? `${realEntries.filter((e) => e.file.endsWith('.stylex.ts')).length} atoms module(s) + ${realEntries.filter((e) => e.file.endsWith('.css')).length} sheet(s) scanned` : `${realFindings.length} violation(s)`,
);
check(
  'the shorthand blacklist matches the installed engine pin (18 throwing names)',
  THROWING_SHORTHANDS.length === 18 && THROWING_SHORTHANDS.includes('background') && THROWING_SHORTHANDS.includes('borderInlineStart'),
  THROWING_SHORTHANDS.join(','),
);

// ── always-on teeth: planted defects ─────────────────────────────────

console.log('━━ verify:stylex-authoring · planted defects (the teeth) ━━━━━━━━━━━');
{
  const sandbox = join(root, '.agents/fixtures/stylex-authoring-selftest');
  rmSync(sandbox, { recursive: true, force: true });
  mkdirSync(sandbox, { recursive: true });
  const plant = (name, code) => {
    const file = join(sandbox, name);
    writeFileSync(file, code);
    return { file: name, path: file, code };
  };
  const prefix = (body) => `import * as stylex from '@stylexjs/stylex';\nexport const planted = stylex.create({\n${body}\n});\n`;

  const planted = [
    plant('factory.stylex.ts', prefix('  dyn: (w) => ({ width: `${w}px` }),')),
    plant('vars-key.stylex.ts', prefix("  theme: { vars: { '--x': 'red' }, color: 'red' },")),
    plant('shorthand.stylex.ts', prefix("  card: { background: 'red' },")),
  ];
  const findings = scanLedgerFiles(planted);
  for (const want of ['factory', 'vars-key', 'shorthand']) {
    const hit = findings.find((f) => f.pattern === want);
    check(`planted ${want} → gate names file + pattern`, !!hit, hit ? `${hit.file}: ${hit.detail.slice(0, 80)}…` : 'gate stayed GREEN (toothless!)');
  }

  // the legal corpus idioms must NOT trip the scanners (no false
  // positives on the sanctioned forms: engine-expandable shorthands,
  // var() seams, keyframes)
  const legal = plant(
    'legal.stylex.ts',
    [
      "import * as stylex from '@stylexjs/stylex';",
      "export const ok = stylex.create({",
      "  card: { margin: 0, padding: '16px', gap: '12px', flex: 'none', overflow: 'hidden', inset: 0, textDecoration: 'none' },",
      "  seam: { width: 'var(--jx-icon-size, 1rem)' },",
      '});',
      "const spin = stylex.keyframes({ '0%': { visibility: 'visible' } });",
      'export const marker = spin;',
      '',
    ].join('\n'),
  );
  const legalFindings = scanLedgerFiles([legal]);
  check('the sanctioned idioms pass (expandable shorthands, var() seams, keyframes)', legalFindings.length === 0, legalFindings.map((f) => f.pattern).join(',') || 'clean');

  // the throw-mode receipt: the REAL babel transform under the kernel
  // pins rejects the planted shorthand — the build-error teeth
  // (P0.5's first row: propertyValidationMode:'throw' is live)
  try {
    const babel = pluginRequire('@babel/core');
    const out = await babel.transformAsync(planted[2].code, {
      babelrc: false,
      filename: planted[2].path,
      presets: [],
      plugins: [
        [pluginRequire('@babel/plugin-syntax-typescript'), { isTSX: true }],
        [pluginRequire('@babel/plugin-syntax-jsx')],
        [
          pluginRequire('@stylexjs/babel-plugin'),
          {
            dev: false,
            runtimeInjection: false,
            debug: true,
            propertyValidationMode: 'throw',
            useCSSLayers: { before: ['properties', 'theme', 'base', 'components'], prefix: 'components.stylex', after: ['utilities'] },
            unstable_moduleResolution: { type: 'commonJS', rootDir: root },
          },
        ],
      ],
    });
    check('the pinned engine THROWS on the planted shorthand (propertyValidationMode throw is live)', false, `the transform unexpectedly succeeded (${out.code.length} bytes)`);
  } catch (e) {
    const message = String(e?.message ?? e);
    check(
      'the pinned engine THROWS on the planted shorthand (propertyValidationMode throw is live)',
      /background is not supported/.test(message),
      message.split('\n')[0].slice(0, 100),
    );
  }

  // the P1-3 acceptance pair (the law's line = the engine's line):
  // (a) an engine-ACCEPTED shorthand compiles through the REAL kernel
  //     pipeline and its declaration lands in the compiled css —
  //     margin/padding/gap/flex/overflow/inset/textDecoration are
  //     lawful authoring surface, not an exemption;
  // (b) covered above — a throw-table name fails the scan AND the
  //     engine itself.
  {
    const { compileItem } = await import('./lib/stylex-payload.mjs');
    const lawfulShorthand = plant(
      'shorthand-ok.stylex.ts',
      [
        "import * as stylex from '@stylexjs/stylex';",
        'export const ok = stylex.create({',
        "  card: { margin: 0, padding: '4px 8px', gap: '12px', flex: 'none', overflow: 'hidden', inset: 0, textDecoration: 'none' },",
        '});',
        '',
      ].join('\n'),
    );
    try {
      const { css } = await compileItem(root, [lawfulShorthand.path]);
      const decls = ['margin', 'padding', 'gap', 'flex', 'overflow', 'inset', 'text-decoration'];
      const landed = decls.filter((d) => new RegExp(`${d}(?:-[a-z]+)?\\s*:`).test(css));
      check(
        'an engine-accepted shorthand compiles and its declarations land in the css (P1-3a)',
        landed.length === decls.length,
        landed.length === decls.length ? `${landed.join(', ')} present` : `missing: ${decls.filter((d) => !landed.includes(d)).join(', ')}`,
      );
    } catch (e) {
      check('an engine-accepted shorthand compiles and its declarations land in the css (P1-3a)', false, String(e?.message ?? e).split('\n')[0].slice(0, 120));
    }
  }

  // the canonical-statement teeth on planted sheets (the lawful form
  // uses the canonical builder — tiers nested under components,
  // utilities last; the sheet form with zero tiers is legal, so the
  // varied plant must actually VARY: reordered layers)
  const varied = plant('varied.css', `@layer properties, theme, utilities, base, components;\n.x { color: red; }\n`);
  const shortStatement = plant(
    'short-statement.css',
    `${canonicalLayerStatement(3)}\n@layer stylex.priority4 { .x { color: red; } }\n`,
  );
  const lawful = plant('lawful.css', `${canonicalLayerStatement(3)}\n@layer components {\n  .x { color: red; }\n}\n`);
  const engineish = plant('engineish.css', `${canonicalLayerStatement(3)}\n.x10w6t97 { color: red; }\n`);
  const sheetFindings = scanLedgerFiles([varied, shortStatement, lawful, engineish]);
  check('a varied layer statement fails naming the file + divergence', sheetFindings.some((f) => f.file === 'varied.css' && f.pattern === 'canonical-statement'));
  check('a statement that stops short of the sheet’s carried tiers fails', sheetFindings.some((f) => f.file === 'short-statement.css' && f.pattern === 'canonical-statement'));
  check('a lawful sheet passes (no false positive on folder css)', !sheetFindings.some((f) => f.file === 'lawful.css'));
  check('a hand-pasted engine rule in a sheet fails', sheetFindings.some((f) => f.file === 'engineish.css' && f.pattern === 'hand-authored-engine-output'));
}

const failed = results.filter((r) => !r.ok);
console.log(failed.length === 0 ? '\n✓ verify:stylex-authoring GREEN — the authoring law holds on the migration surface' : `\n✗ verify:stylex-authoring FAILED — ${failed.length} failure(s)`);
process.exit(failed.length === 0 ? 0 : 1);
