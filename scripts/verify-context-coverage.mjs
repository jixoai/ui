#!/usr/bin/env node
// verify-context-coverage — the Defaults context coverage gate
// (context-defaults-economy task 1.4, design.md「门禁合同 —
// verify:context」, 2026-09-03).
//
// Inputs (all deterministic, in-repo):
//   <root>/registry.json                        item → family folder map
//   <root>/registry/files/**                    canonical tree ONLY (the
//                                               apps/www/src/lib mirror is
//                                               never scanned — the byte-
//                                               mirror law makes it
//                                               redundant)
//   <root>/scripts/context-coverage.config.json versioned vocabulary v1 +
//                                               frozen availability mirror
//   <root>/scripts/context-coverage.exemptions.json  the five-kind whitelist
//
// Assertions (design numbering):
//   A1  existence — a vocabulary-hit style prop ⇒ the family ships a
//       <family>-defaults.svelte.ts whose slots cover it (or a prop-level
//       exemption entry; kind `provider` NEVER exempts these).
//   A2  slot legality (AST) — every slot value is a registered factory
//       call (defineLiteralSlot/definePaintSlot/defineOpenSlot/
//       absentSlot/densitySlot), either INLINE or via a same-file
//       exported slot constant resolved one hop (slot-values-first
//       D3: the member Identifier → `export const <name> =
//       <factory>(…)`, never recursive); the explicit-type-argument
//       assertion holds ONLY for absentSlot and defineOpenSlot (no
//       values tuple to infer from — typeArguments.length>0 plus the
//       =never compile-time second lock; the values-inference
//       factories need no type argument); definePaintSlot takes
//       exactly (values-array, own); defineAxisSlot appears ONLY
//       under registry/files/lib/**.
//   A3  family contract — consumer files declare resolve presence
//       (`XxxDefaults.resolve(`), no banned bypass channels
//       (resolveDensity / getDensityContext / axis-key getContext direct);
//       a bare-ExpressionStatement resolve call is an empty call
//       (assignment / return / spread / template call sites accepted);
//       kind:provider files confine legacy helpers to provider-call
//       argument subtrees or $derived initializer subtrees.
//   A4  availability consistency — a definePaintSlot family's values
//       tuple (first argument, inline literal array, AST direct read)
//       ⊆ PaintVariant and values/own ≡ the frozen availability
//       table. The family union IS the values tuple now (the
//       same-folder-union extraction ceiling is retired — no second
//       fact source can drift).
//   A5  lib→ui reverse dependency — registry/files/lib/** never imports
//       registry/files/ui/** (static import graph).
//   A6  exemptions explicit — entries match something real and carry a
//       non-empty reason (stale / empty-reason / expired / invalid fail).
//
// Output: human list (default) or --json machine report; exit 0 GREEN /
// 1 RED. `--scope=pilot` restricts the family-scoped assertions to the
// config's pilotFamilies subset (A5, the defineAxisSlot boundary and A6
// schema validation stay on — tree laws, not family laws). `--root=<dir>`
// points the gate at an alternate tree (the fixture self-test); the
// svelte/typescript compilers ALWAYS resolve from the real repo's
// apps/www (the jx-inventory precedent).
//
// Static-decidability boundary (declared, not hidden, per spec):
// per-prop dataflow beyond these clauses belongs to code review.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// ── dependency resolution (repo root ships neither dep) ────────────
const realRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const wwwRequire = createRequire(join(realRoot, 'apps/www/package.json'));
const ts = wwwRequire('typescript');
const svelteCompiler = wwwRequire('svelte/compiler');

// ── CLI ────────────────────────────────────────────────────────────
const rootArg = process.argv.find((a) => a.startsWith('--root='))?.slice(7);
const root = resolve(rootArg ?? realRoot);
const jsonMode = process.argv.includes('--json');
const pilotMode = process.argv.includes('--scope=pilot');

const die = (msg) => {
  console.error(`[verify-context] ${msg}`);
  process.exit(1);
};

// ── inputs ─────────────────────────────────────────────────────────
const configPath = join(root, 'scripts/context-coverage.config.json');
const exemptionsPath = join(root, 'scripts/context-coverage.exemptions.json');
for (const p of [join(root, 'registry.json'), configPath, exemptionsPath]) {
  if (!existsSync(p)) die(`missing input: ${relative(root, p)}`);
}
const config = JSON.parse(readFileSync(configPath, 'utf8'));
if (config.version !== 1) die(`unknown config version ${config.version} — this engine speaks v1 only`);
const VOCAB = new Set(config.vocabulary);
const PAINT_UNION = new Set(config.paintVariantUnion);
const FROZEN = config.frozenAvailability ?? {};
const PILOT = new Set(config.pilotFamilies ?? []);
const FACTORIES = config.slotFactories;
const LEGACY = new Set(config.legacyHelpers);
const AXIS_KEYS = new Set(config.axisContextKeys);
const PROVIDER_PREFIX = config.providerCallPrefix ?? 'provide';
const DEFAULTS_FACTORY = config.defaultsObjectFactory ?? 'defineComponentDefaults';
const AXIS_CONSTRUCTOR = config.axisSlotConstructor ?? 'defineAxisSlot';

const exemptionsDoc = JSON.parse(readFileSync(exemptionsPath, 'utf8'));
const exemptions = Array.isArray(exemptionsDoc) ? exemptionsDoc : (exemptionsDoc.entries ?? []);
const PROP_KINDS = new Set(['bindable', 'passthrough', 'no-style', 'roadmap']);
const ALL_KINDS = new Set([...PROP_KINDS, 'provider']);

const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'));
const items = registry.items ?? registry;
const uiItems = items.filter((i) => i.type === 'registry:ui');
if (!uiItems.length) die('registry.json carries no registry:ui items');

// ── findings ───────────────────────────────────────────────────────
const findings = [];
const finding = (rule, fields) => {
  findings.push({
    rule,
    family: fields.family ?? null,
    file: fields.file ?? null,
    line: fields.line ?? null,
    prop: fields.prop ?? null,
    message: fields.message,
  });
};

// legacy-channel census (the 弃用协议 retirement feed): every
// occurrence of a legacy helper / axis-key read in the scanned ui tree,
// split into total vs banned-outside-provider-subtrees
const census = {};

// ── small helpers ──────────────────────────────────────────────────
const pascal = (name) => name.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('');
const lineAt = (text, idx) => text.slice(0, Math.max(0, idx ?? 0)).split('\n').length;
const rel = (p) => relative(root, p);
const walkFiles = (dir, out = []) => {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walkFiles(p, out);
    else out.push(p);
  }
  return out;
};

/** split a .svelte source into script blocks with absolute offsets
 *  (the component-metadata-gen regex, extended to report positions) */
function splitScripts(source) {
  const blocks = [];
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(source))) {
    const codeStart = m.index + m[0].indexOf('>') + 1;
    blocks.push({
      kind: /\bmodule\b/.test(m[1]) ? 'module' : 'instance',
      code: m[2],
      start: codeStart,
    });
  }
  return blocks;
}

const parseTs = (code) =>
  ts.createSourceFile('x.ts', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

/** walker over the TS AST; ancestors are raw TS nodes, nearest-first */
function visitTs(sf, onNode) {
  const walk = (node, anc) => {
    onNode(node, anc);
    ts.forEachChild(node, (child) => walk(child, [node, ...anc]));
  };
  walk(sf, []);
}

/** walker over the svelte template AST + embedded ESTree expression
 *  nodes; ancestors are raw nodes, nearest-first */
function visitTemplate(node, onNode, anc = []) {
  if (Array.isArray(node)) {
    for (const n of node) visitTemplate(n, onNode, anc);
    return;
  }
  if (node === null || typeof node !== 'object' || typeof node.type !== 'string') return;
  onNode(node, anc);
  for (const key of Object.keys(node)) {
    if (key === 'parent' || key === 'loc') continue;
    visitTemplate(node[key], onNode, [node, ...anc]);
  }
}

/** is `node` the NAME of its declaring parent (never a use site)? */
function isDeclarationName(node, parent) {
  if (!parent) return false;
  return (
    (ts.isVariableDeclaration(parent) && parent.name === node) ||
    (ts.isBindingElement(parent) && parent.name === node) ||
    (ts.isParameter(parent) && parent.name === node) ||
    ((ts.isFunctionDeclaration(parent) || ts.isFunctionExpression(parent)) && parent.name === node) ||
    ((ts.isTypeAliasDeclaration(parent) || ts.isInterfaceDeclaration(parent)) && parent.name === node) ||
    (ts.isImportSpecifier(parent) && (parent.name === node || parent.propertyName === node)) ||
    (ts.isImportEqualsDeclaration(parent) && parent.name === node)
  );
}

/** callee display name for a call node (TS or ESTree shape) */
function calleeName(callNode, isTs) {
  const e = isTs ? callNode.expression : callNode.callee;
  if (!e) return null;
  if (isTs) {
    if (ts.isIdentifier(e)) return e.text;
    if (ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.expression) && ts.isIdentifier(e.name))
      return `${e.expression.text}.${e.name.text}`;
    return null;
  }
  if (e.type === 'Identifier') return e.name;
  if (e.type === 'MemberExpression' && e.object?.type === 'Identifier')
    return `${e.object.name}.${e.property?.name}`;
  return null;
}

/** the frozen provider static boundary (design X3-5/X4-3): the
 *  occurrence is legal iff some ancestor call is a provider
 *  (provideXxx(…)) or a $derived(…) / $derived.by(…) initializer */
function insideReactiveDeclaration(anc) {
  for (const a of anc) {
    const isTs = !!a.__ts;
    const isCall = isTs ? ts.isCallExpression(a.node) : a.type === 'CallExpression';
    if (!isCall) continue;
    const name = calleeName(isTs ? a.node : a, isTs);
    if (name === '$derived' || name === '$derived.by') return true;
    if (
      name &&
      name.length > PROVIDER_PREFIX.length &&
      name.startsWith(PROVIDER_PREFIX) &&
      /[A-Z]/.test(name[PROVIDER_PREFIX.length])
    ) return true;
  }
  return false;
}
const tsAnc = (nodes) => nodes.map((n) => ({ __ts: true, node: n, type: ts.SyntaxKind[n.kind] }));

// ── per-file model ─────────────────────────────────────────────────
function loadSvelte(absPath) {
  const raw = readFileSync(absPath, 'utf8');
  const out = { raw, svelteAst: null, blocks: [], error: null };
  try {
    out.svelteAst = svelteCompiler.parse(raw);
  } catch (e) {
    out.error = e.message.split('\n')[0]; // template scan skipped; scripts still scanned
  }
  for (const b of splitScripts(raw)) out.blocks.push({ ...b, sf: parseTs(b.code) });
  return out;
}

/** plain ts file → the same shape with one pseudo block (script scans) */
function loadTsAsBlock(absPath) {
  const raw = readFileSync(absPath, 'utf8');
  return { raw, svelteAst: null, blocks: [{ kind: 'module', code: raw, start: 0, sf: parseTs(raw) }], error: null };
}

/** vocabulary-hit props declared in a .svelte file (the $props() destructure) */
function extractVocabProps(loaded) {
  const hits = [];
  for (const block of loaded.blocks) {
    const sf = block.sf;
    for (const stmt of sf.statements) {
      if (!ts.isVariableStatement(stmt)) continue;
      for (const decl of stmt.declarationList.declarations) {
        const init = decl.initializer;
        if (!init || !ts.isCallExpression(init) || init.expression.getText(sf) !== '$props') continue;
        if (!decl.name || !ts.isObjectBindingPattern(decl.name)) continue;
        for (const el of decl.name.elements) {
          if (!ts.isBindingElement(el) || el.dotDotDotToken) continue;
          const key = (el.propertyName ?? el.name).getText(sf).replace(/^['"]|['"]$/g, '');
          if (VOCAB.has(key)) hits.push({ prop: key, line: lineAt(loaded.raw, block.start + el.getStart(sf)) });
        }
      }
    }
  }
  return hits;
}

// ── family map (path → family, for finding attribution) ────────────
const familyByPathPrefix = uiItems.map((i) => [`registry/files/ui/${i.name}/`, i.name]);
function familyOfFile(absPath) {
  const r = rel(absPath);
  for (const [prefix, name] of familyByPathPrefix) if (r.startsWith(prefix)) return name;
  return null;
}

// ── exemption model ────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const exemptionEntries = exemptions.map((e, idx) => {
  const entry = e && typeof e === 'object' ? e : {};
  return {
    ...entry,
    _idx: idx,
    _hit: false,
    _outOfScope: false,
    _invalid: (() => {
      if (!e || typeof e !== 'object') return 'entry is not an object';
      if (!ALL_KINDS.has(e.kind)) return `unknown kind '${e.kind}'`;
      if (e.kind !== 'provider' && !VOCAB.has(e.prop)) return `prop '${e.prop}' missing or not a vocabulary word`;
      if (e.kind === 'roadmap' && !e.targetAxis) return 'roadmap entry requires targetAxis';
      if (typeof e.path !== 'string' || !e.path.startsWith('registry/files/')) return `path '${e.path}' must be registry-relative`;
      return null;
    })(),
    _reasonEmpty: !(typeof entry.reason === 'string' && entry.reason.trim()),
    _expired: typeof entry.expiresAt === 'string' && entry.expiresAt < today,
  };
});
const applies = (e) => !e._invalid && !e._reasonEmpty && !e._expired;

/** valid, non-expired prop-level exemption for (file, prop)? marks hit */
function propExempted(filePath, propName) {
  for (const e of exemptionEntries) {
    if (e.kind === 'provider') continue;
    if (e.path === filePath && e.prop === propName) {
      e._hit = true; // matched — invalid/empty/expired still report, never apply
      return applies(e);
    }
  }
  return false;
}
/** provider entry for a file (marks hit on match) */
function providerEntryFor(filePath) {
  for (const e of exemptionEntries) {
    if (e.kind !== 'provider' || e.path !== filePath) continue;
    e._hit = true;
    if (applies(e)) return e;
    return null;
  }
  return null;
}

// ── banned-channel scan (assertion 3, bypass half) ─────────────────
function scanBannedChannels(absPath, loaded, providerFile) {
  const family = familyOfFile(absPath);
  const occurrences = [];
  const checkOccurrence = (name, line, anc, isTemplate) => {
    const banned = !(providerFile && insideReactiveDeclaration(anc));
    occurrences.push({ name, banned });
    if (banned) {
      finding('A3-banned-channel', {
        family,
        file: rel(absPath),
        line,
        message:
          `banned bypass channel '${name}'` +
          (providerFile
            ? ' — kind:provider file: legacy helpers live ONLY inside provider-call argument or $derived initializer subtrees'
            : '') +
          (isTemplate ? ' [template]' : ''),
      });
    }
    return banned;
  };

  for (const block of loaded.blocks) {
    const sf = block.sf;
    visitTs(sf, (node, anc) => {
      const parent = anc[0];
      if (ts.isIdentifier(node) && LEGACY.has(node.text) && !isDeclarationName(node, parent)) {
        checkOccurrence(node.text, lineAt(loaded.raw, block.start + node.getStart(sf)), tsAnc(anc), false);
      }
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'getContext' && node.arguments.length) {
        const arg = node.arguments[0];
        if (ts.isIdentifier(arg) && AXIS_KEYS.has(arg.text)) {
          checkOccurrence(`getContext(${arg.text})`, lineAt(loaded.raw, block.start + node.getStart(sf)), tsAnc(anc), false);
        }
      }
    });
  }
  if (loaded.svelteAst?.html) {
    visitTemplate(loaded.svelteAst.html, (node, anc) => {
      if (node.type === 'Identifier' && LEGACY.has(node.name)) {
        const parent = anc[0];
        if (parent?.type === 'MemberExpression' && parent.property === node && !parent.computed) return;
        checkOccurrence(node.name, lineAt(loaded.raw, node.start), anc, true);
      }
      if (node.type === 'CallExpression' && node.callee?.type === 'Identifier' && node.callee.name === 'getContext') {
        const arg = node.arguments?.[0];
        if (arg?.type === 'Identifier' && AXIS_KEYS.has(arg.name)) {
          checkOccurrence(`getContext(${arg.name})`, lineAt(loaded.raw, node.start), anc, true);
        }
      }
    });
  }
  return { occurrences };
}

// ── resolve-call scan (assertion 3, presence + empty-call halves) ──
function scanResolveCalls(loaded, defaultsName) {
  const calls = [];
  const onCall = (node, anc, line, isTemplate) => {
    let objName = null;
    let propName = null;
    if (isTemplate) {
      const callee = node.callee;
      if (callee?.type === 'MemberExpression') {
        if (callee.object?.type === 'Identifier') objName = callee.object.name;
        if (callee.property?.type === 'Identifier') propName = callee.property.name;
      }
    } else {
      const callee = node.expression; // TS CallExpression: .expression
      if (ts.isPropertyAccessExpression(callee)) {
        if (ts.isIdentifier(callee.expression)) objName = callee.expression.text;
        if (ts.isIdentifier(callee.name)) propName = callee.name.text;
      }
    }
    if (objName === defaultsName && propName === 'resolve') {
      let bare = false;
      if (!isTemplate) {
        const parent = anc[0];
        bare = !!parent && ts.isExpressionStatement(parent) && parent.expression === node;
      }
      calls.push({ line, bare, isTemplate });
    }
  };
  for (const block of loaded.blocks) {
    visitTs(block.sf, (node, anc) => {
      if (ts.isCallExpression(node)) {
        // normalize: build a callee view the shared matcher understands
        onCall(node, anc, lineAt(loaded.raw, block.start + node.getStart(block.sf)), false);
      }
    });
  }
  if (loaded.svelteAst?.html) {
    visitTemplate(loaded.svelteAst.html, (node, anc) => {
      if (node.type === 'CallExpression') onCall(node, anc, lineAt(loaded.raw, node.start), true);
    });
  }
  return calls;
}

// ── defineAxisSlot lib-only boundary (assertion 2, always on) ──────
function scanAxisConstructor(absPath, loaded) {
  if (rel(absPath).startsWith('registry/files/lib/')) return;
  const report = (line, what) =>
    finding('A2-define-axis-slot-outside-lib', {
      family: familyOfFile(absPath),
      file: rel(absPath),
      line,
      message: `defineAxisSlot is the lib-only cross-module construction protocol — ${what} outside registry/files/lib/** (canonical tree only; the mirror is never a constructor)`,
    });
  for (const block of loaded.blocks) {
    visitTs(block.sf, (node) => {
      if (ts.isIdentifier(node) && node.text === AXIS_CONSTRUCTOR) {
        report(lineAt(loaded.raw, block.start + node.getStart(block.sf)), 'identifier reference');
      }
    });
  }
  if (loaded.svelteAst?.html) {
    visitTemplate(loaded.svelteAst.html, (node) => {
      if (node.type === 'Identifier' && node.name === AXIS_CONSTRUCTOR) {
        report(lineAt(loaded.raw, node.start), 'template reference');
      }
    });
  }
}

// ── A5: lib→ui reverse dependency (always on) ──────────────────────
function importsOf(loaded) {
  const specs = new Set();
  const record = (s) => { if (typeof s === 'string') specs.add(s); };
  for (const block of loaded.blocks) {
    const sf = block.sf;
    for (const stmt of sf.statements) {
      if ((ts.isImportDeclaration(stmt) || ts.isExportDeclaration(stmt)) && stmt.moduleSpecifier &&
          ts.isStringLiteral(stmt.moduleSpecifier)) record(stmt.moduleSpecifier.text);
    }
    visitTs(sf, (node) => {
      if (ts.isCallExpression(node) && node.expression.getText(sf) === 'import' &&
          node.arguments.length && ts.isStringLiteral(node.arguments[0])) {
        record(node.arguments[0].text);
      }
    });
  }
  return specs;
}
const libDir = join(root, 'registry/files/lib');
const libFiles = existsSync(libDir)
  ? walkFiles(libDir).filter((f) => /\.(ts|svelte\.ts|svelte)$/.test(f))
  : [];
const libMirrorRoot = join(root, 'apps/www/src/lib');

// ── defaults-file analysis helpers (assertions 2 + 4) ──────────────
/** the named-slot-constant resolution (slot-values-first D3-A2): a
 *  defaults member may be an Identifier referencing a same-file
 *  `export const <name> = <factory>(…)` — ONE hop, never recursive.
 *  Returns the factory CallExpression, or undefined when the name
 *  carries no such declaration (a wrong-shape initializer of a
 *  matching name also resolves to undefined — the A2 factory check
 *  then reports it). */
function resolveNamedSlotCall(idName, sf) {
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    if (!stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== idName) continue;
      const init = decl.initializer;
      return init && ts.isCallExpression(init) && ts.isIdentifier(init.expression)
        ? init
        : undefined;
    }
  }
  return undefined;
}

/** the definePaintSlot values carrier: the FIRST argument, an inline
 *  array of string literals (AST direct read — the imported-tuple
 *  form is legal for literal-family slots only, never for paint) */
function inlineStringArray(node) {
  if (!node || !ts.isArrayLiteralExpression(node)) return null;
  const vals = node.elements.map((el) => (ts.isStringLiteral(el) ? el.text : null));
  return vals.every((v) => typeof v === 'string') ? vals : null;
}

// ── the family pass (A1/A2/A3/A4, scope-filtered) ──────────────────
const inScope = (family) => !pilotMode || PILOT.has(family);
const scopedFamilies = uiItems.map((i) => i.name).filter(inScope);
let consumerFileCount = 0;

for (const item of uiItems) {
  const family = item.name;
  const folderAbs = join(root, 'registry/files/ui', family);
  if (!existsSync(folderAbs)) die(`registry:ui item ${family} has no folder: registry/files/ui/${family}`);
  if (!inScope(family)) {
    // tree laws stay on in pilot scope: the defineAxisSlot lib-only
    // boundary is checked for EVERY family (the constructor protocol is
    // not a migration-wave concern)
    for (const f of walkFiles(folderAbs).filter((x) => /\.(svelte|ts)$/.test(x))) {
      scanAxisConstructor(f, f.endsWith('.svelte') ? loadSvelte(f) : loadTsAsBlock(f));
    }
    continue;
  }

  const files = walkFiles(folderAbs);
  const svelteFiles = files.filter((f) => f.endsWith('.svelte'));
  const codeFiles = files.filter((f) => /\.(ts|svelte\.ts)$/.test(f));
  const defaultsPath = join(folderAbs, `${family}-defaults.svelte.ts`);
  const defaultsName = `${pascal(family)}Defaults`;
  const hasDefaults = existsSync(defaultsPath);

  // load every family file once (svelte parse + TS script blocks)
  const loadedByFile = new Map();
  for (const f of [...svelteFiles, ...codeFiles]) {
    loadedByFile.set(f, f.endsWith('.svelte') ? loadSvelte(f) : loadTsAsBlock(f));
  }
  for (const [f, loaded] of loadedByFile) {
    if (f.endsWith('.svelte') && loaded.error) {
      finding('parse-error', { family, file: rel(f), message: `unparsable svelte: ${loaded.error} (fail-closed — template checks skipped, script checks ran)` });
    }
  }

  // ── the Defaults object + slot legality ──────────────────────────
  const defaultsSlots = new Map(); // slotName → {factory, line, call, sf}
  let defaultsInfo = null; // {sf, raw}
  if (hasDefaults) {
    const raw = readFileSync(defaultsPath, 'utf8');
    const sf = parseTs(raw);
    defaultsInfo = { sf, raw };
    let decl = null;
    for (const stmt of sf.statements) {
      if (!ts.isVariableStatement(stmt)) continue;
      for (const d of stmt.declarationList.declarations) {
        if (ts.isIdentifier(d.name) && d.name.text === defaultsName && d.initializer &&
            ts.isCallExpression(d.initializer) && d.initializer.expression.getText(sf) === DEFAULTS_FACTORY) decl = d;
      }
    }
    if (!decl) {
      finding('A1-malformed-defaults', {
        family, file: rel(defaultsPath),
        message: `no \`${defaultsName} = ${DEFAULTS_FACTORY}({ … })\` declaration — the family Defaults object is the single ambient contract`,
      });
    } else {
      const arg = decl.initializer.arguments[0];
      if (!arg || !ts.isObjectLiteralExpression(arg)) {
        finding('A1-malformed-defaults', {
          family, file: rel(defaultsPath),
          line: lineAt(raw, (arg ?? decl).getStart(sf)),
          message: `${DEFAULTS_FACTORY} expects one object literal of slots`,
        });
      } else {
        for (const prop of arg.properties) {
          if (!ts.isPropertyAssignment(prop)) {
            finding('A2-slot-not-factory-call', {
              family, file: rel(defaultsPath), line: lineAt(raw, prop.getStart(sf)),
              message: 'slots are named property assignments of registered factory calls (spread/other shapes are not slots)',
            });
            continue;
          }
          const slotName = prop.name.getText(sf).replace(/^['"]|['"]$/g, '');
          const value = prop.initializer;
          // slot-values-first D3-A2: the slot value is either an inline
          // factory call or an Identifier referencing a same-file
          // exported slot constant — resolved one hop, never recursive
          let call = null;
          if (ts.isCallExpression(value) && ts.isIdentifier(value.expression)) call = value;
          else if (ts.isIdentifier(value)) call = resolveNamedSlotCall(value.text, sf) ?? null;
          const factory = call ? call.expression.text : null;
          if (!factory || !FACTORIES[factory]) {
            finding('A2-slot-not-factory-call', {
              family, file: rel(defaultsPath), line: lineAt(raw, value.getStart(sf)), prop: slotName,
              message: `slot is not a registered slot-factory call (inline or via a same-file exported slot constant; registered: ${Object.keys(FACTORIES).join(', ')}) — bare functions/literals are rejected at AST level`,
            });
            continue;
          }
          const line = lineAt(raw, call.getStart(sf));
          defaultsSlots.set(slotName, { factory, line, call });
          const spec = FACTORIES[factory];
          if (spec.generic && !(call.typeArguments?.length > 0)) {
            finding('A2-missing-type-args', {
              family, file: rel(defaultsPath), line, prop: slotName,
              message: `${factory}<T>(…) must carry explicit type arguments — without them the slot's value domain is undecidable (absentSlot and defineOpenSlot have no values tuple to infer from; the =never default is the compile-time second lock)`,
            });
          }
          const argc = call.arguments.length;
          if (argc < spec.minArgs || argc > spec.maxArgs) {
            finding('A2-slot-arity', {
              family, file: rel(defaultsPath), line, prop: slotName,
              message: `${factory} expects ${spec.minArgs === spec.maxArgs ? spec.minArgs : `${spec.minArgs}–${spec.maxArgs}`} argument(s), got ${argc}`,
            });
          }
        }
      }
    }
  }

  // ── A1 coverage + A3 resolve presence/empty-call per consumer ────
  for (const f of svelteFiles) {
    const loaded = loadedByFile.get(f);
    const filePath = rel(f);
    const vocabHits = loaded.error ? [] : extractVocabProps(loaded);
    if (vocabHits.length) consumerFileCount += 1;
    const required = vocabHits.filter((h) => !propExempted(filePath, h.prop));
    if (!required.length) continue;

    if (!hasDefaults) {
      for (const h of required) {
        finding('A1-family-defaults-missing', {
          family, file: filePath, line: h.line, prop: h.prop,
          message: `style prop hits the pinned vocabulary but the family ships no Defaults contract (expected registry/files/ui/${family}/${family}-defaults.svelte.ts)`,
        });
      }
      continue;
    }
    for (const h of required) {
      if (!defaultsSlots.has(h.prop)) {
        finding('A1-slot-coverage', {
          family, file: filePath, line: h.line, prop: h.prop,
          message: `style prop has no slot in ${defaultsName} — coverage means EVERY style prop has a slot (axis, literal, or a declared exemption)`,
        });
      }
    }
    const calls = loaded.error ? [] : scanResolveCalls(loaded, defaultsName);
    if (!calls.length) {
      finding('A3-resolve-missing', {
        family, file: filePath, line: required[0].line,
        message: `consumer file declares style props but contains no \`${defaultsName}.resolve(\` call — the family Defaults is the single read point`,
      });
    }
    for (const c of calls.filter((c) => c.bare)) {
      finding('A3-resolve-empty-call', {
        family, file: filePath, line: c.line,
        message: `bare-statement \`${defaultsName}.resolve(…)\` — the resolved projection is discarded (assignment / return / spread / template call sites are the accepted forms)`,
      });
    }
  }

  // ── A4 availability consistency (definePaintSlot slots, family level)
  if (defaultsInfo && defaultsSlots.size) {
    const { sf: dSf, raw: dRaw } = defaultsInfo;
    for (const [slotName, slot] of defaultsSlots) {
      if (slot.factory !== 'definePaintSlot') continue;
      // values = FIRST argument (inline literal array, AST direct
      // read); own = SECOND argument — slot-values-first D3-A4. The
      // family union IS this tuple (the same-folder-union extraction
      // ceiling is retired: no second fact source can drift).
      const values = inlineStringArray(slot.call.arguments[0]);
      if (!values) {
        const valuesArg = slot.call.arguments[0];
        finding('A2-values-not-literal-array', {
          family, file: rel(defaultsPath),
          line: valuesArg ? lineAt(dRaw, valuesArg.getStart(dSf)) : slot.line, prop: slotName,
          message: 'definePaintSlot takes (values, own) where values is an inline array of string literals, not a reference or expression (the imported-tuple form is legal for literal-family slots only)',
        });
        continue;
      }
      const outsidePaint = values.filter((v) => !PAINT_UNION.has(v));
      if (outsidePaint.length) {
        finding('A4-union-not-subset', {
          family, file: rel(defaultsPath), line: slot.line, prop: slotName,
          message: `values tuple {${values.join(' | ')}} ⊄ PaintVariant — outside: ${outsidePaint.join(', ')} (the tuple IS the family union; the const-generic constraint is the compile-time lock, this is the gate's mirror)`,
        });
      }
      const row = FROZEN[family];
      if (!row) {
        finding('A4-not-in-frozen-table', {
          family, file: rel(defaultsPath), line: slot.line, prop: slotName,
          message: 'family not present in the frozen availability table (config frozenAvailability) — a paint family must be frozen before it ships a paint slot',
        });
        continue;
      }
      const missing = row.variants.filter((v) => !values.includes(v));
      const extra = values.filter((v) => !row.variants.includes(v));
      if (missing.length || extra.length) {
        finding('A4-values-mismatch', {
          family, file: rel(defaultsPath), line: slot.line, prop: slotName,
          message: `values ≢ frozen availability table — missing: [${missing.join(', ')}] extra: [${extra.join(', ')}] (frozen: [${row.variants.join(', ')}])`,
        });
      }
      const ownArg = slot.call.arguments[1];
      const ownText = ownArg && ts.isStringLiteral(ownArg) ? ownArg.text : null;
      if (ownText !== row.own) {
        finding('A4-own-mismatch', {
          family, file: rel(defaultsPath), line: slot.line, prop: slotName,
          message: `definePaintSlot own '${ownText}' ≢ frozen own '${row.own}' (the grammar default is frozen, not a local choice)`,
        });
      }
    }
  }

  // ── A3 bypass channels + A2 axis-constructor boundary (all files) ─
  for (const [f, loaded] of loadedByFile) {
    if (f.endsWith('.svelte') && loaded.error) {
      // scripts were still parsed — scan them; only the template is lost
    }
    const providerEntry = providerEntryFor(rel(f));
    const { occurrences } = scanBannedChannels(f, loaded, !!providerEntry);
    for (const o of occurrences) {
      census[o.name] ??= { total: 0, banned: 0, files: new Set() };
      census[o.name].total += 1;
      census[o.name].files.add(rel(f));
      if (o.banned) census[o.name].banned += 1;
    }
    if (providerEntry && occurrences.length) providerEntry._hit = true;
    scanAxisConstructor(f, loaded);
  }
}

// ── A5 pass (lib tree, always on) ──────────────────────────────────
for (const f of libFiles) {
  const loaded = f.endsWith('.svelte') ? loadSvelte(f) : loadTsAsBlock(f);
  const mirrorPath = join(root, rel(f).replace(/^registry\/files\/lib\//, 'apps/www/src/lib/'));
  const mirrorDir = dirname(mirrorPath);
  const relToLibRoot = (spec) => {
    if (spec.startsWith('$lib/ui/') || spec === '$lib/ui') return true;
    if (spec === '$lib' || spec.startsWith('$lib/')) return false;
    if (spec.startsWith('.')) {
      const resolved = resolve(mirrorDir, spec);
      const r = relative(libMirrorRoot, resolved);
      return r === 'ui' || r.startsWith('ui/');
    }
    return false; // bare npm specifiers never resolve into the tree
  };
  for (const spec of importsOf(loaded)) {
    if (relToLibRoot(spec)) {
      finding('A5-lib-to-ui', {
        file: rel(f),
        message: `registry/files/lib file imports the ui tree: '${spec}' — lib→ui reverse dependency is zero-tolerance (the value domain lives in the axis; families alias it)`,
      });
    }
  }
  scanAxisConstructor(f, loaded);
}

// ── A6 pass (exemptions explicit) ──────────────────────────────────
for (const e of exemptionEntries) {
  const label = `${e.kind ?? 'untyped'}${e.prop ? `#${e.prop}` : ''}`;
  if (e._invalid) {
    finding('A6-invalid-entry', { file: e.path ?? null, prop: e.prop ?? null, message: `${label}: ${e._invalid} — exemption not applied (fail-closed)` });
    continue;
  }
  if (e._reasonEmpty) {
    finding('A6-empty-reason', { file: e.path, prop: e.prop ?? null, message: `${label}: reason is empty — every exemption is explicit or it does not exist` });
    continue;
  }
  if (e._expired) {
    finding('A6-expired', { file: e.path, prop: e.prop ?? null, message: `${label}: expiresAt ${e.expiresAt} is past — renew with a fresh justification or drop the entry` });
    continue;
  }
  if (pilotMode) {
    const fam = familyByPathPrefix.find(([pre]) => e.path.startsWith(pre))?.[1];
    if (fam && !PILOT.has(fam)) { e._outOfScope = true; continue; }
  }
  if (!e._hit) {
    finding('A6-stale-exemption', {
      file: e.path, prop: e.prop ?? null,
      message: `${label}: matched nothing — whitelist entries must name a real vocabulary-hit prop or a real legacy-helper site`,
    });
  }
}

// ── census serialization (Sets → sorted arrays) ────────────────────
const censusOut = Object.fromEntries(
  Object.entries(census).map(([k, v]) => [k, { total: v.total, banned: v.banned, files: [...v.files].sort() }]),
);

// ── output ─────────────────────────────────────────────────────────
findings.sort((a, b) =>
  `${a.rule}\u0000${a.file ?? ''}\u0000${a.line ?? 0}\u0000${a.prop ?? ''}`
    .localeCompare(`${b.rule}\u0000${b.file ?? ''}\u0000${b.line ?? 0}\u0000${b.prop ?? ''}`));
const byRule = {};
for (const f of findings) byRule[f.rule] = (byRule[f.rule] ?? 0) + 1;
const ok = findings.length === 0;
const payload = {
  tool: 'verify-context-coverage',
  engine: 1,
  root: rootArg ? relative(realRoot, root) : '.',
  scope: pilotMode ? 'pilot' : 'full',
  configVersion: config.version,
  vocabulary: config.vocabulary,
  familiesTotal: uiItems.length,
  familiesChecked: scopedFamilies,
  consumerFiles: consumerFileCount,
  ok,
  summary: { findings: findings.length, byRule },
  findings,
  census: censusOut,
  exemptions: {
    total: exemptionEntries.length,
    hit: exemptionEntries.filter((e) => e._hit).length,
    outOfScope: exemptionEntries.filter((e) => e._outOfScope).length,
  },
};

if (jsonMode) {
  console.log(JSON.stringify(payload, null, 2));
  process.exit(ok ? 0 : 1);
}

const RULE_LABELS = {
  'parse-error': 'parse (fail-closed)',
  'A1-family-defaults-missing': 'A1 existence',
  'A1-slot-coverage': 'A1 coverage',
  'A1-malformed-defaults': 'A1 malformed',
  'A2-slot-not-factory-call': 'A2 slot legality',
  'A2-missing-type-args': 'A2 type arguments',
  'A2-slot-arity': 'A2 arity',
  'A2-values-not-literal-array': 'A2 values carrier',
  'A2-define-axis-slot-outside-lib': 'A2 axis-constructor boundary',
  'A3-resolve-missing': 'A3 resolve presence',
  'A3-resolve-empty-call': 'A3 empty call',
  'A3-banned-channel': 'A3 banned channels',
  'A4-union-not-subset': 'A4 availability',
  'A4-not-in-frozen-table': 'A4 availability',
  'A4-values-mismatch': 'A4 availability',
  'A4-own-mismatch': 'A4 availability',
  'A5-lib-to-ui': 'A5 lib→ui',
  'A6-invalid-entry': 'A6 exemptions',
  'A6-empty-reason': 'A6 exemptions',
  'A6-expired': 'A6 exemptions',
  'A6-stale-exemption': 'A6 exemptions',
};
let lastLabel = null;
for (const f of findings) {
  const label = RULE_LABELS[f.rule] ?? f.rule;
  if (label !== lastLabel) {
    console.error(`✗ ${label}`);
    lastLabel = label;
  }
  const where = [f.file, f.line].filter((x) => x !== null && x !== undefined).join(':');
  console.error(
    `    ${f.family ? `[${f.family}] ` : ''}${where ? `${where} — ` : ''}${f.prop ? `'${f.prop}' ` : ''}${f.message}`,
  );
}
const SECTION_RULES = {
  A1: ['A1-family-defaults-missing', 'A1-slot-coverage', 'A1-malformed-defaults'],
  A2: ['A2-slot-not-factory-call', 'A2-missing-type-args', 'A2-slot-arity', 'A2-values-not-literal-array', 'A2-define-axis-slot-outside-lib'],
  A3: ['A3-resolve-missing', 'A3-resolve-empty-call', 'A3-banned-channel'],
  A4: ['A4-union-not-subset', 'A4-not-in-frozen-table', 'A4-values-mismatch', 'A4-own-mismatch'],
  A5: ['A5-lib-to-ui'],
  A6: ['A6-invalid-entry', 'A6-empty-reason', 'A6-expired', 'A6-stale-exemption'],
};
for (const [name, rules] of Object.entries(SECTION_RULES)) {
  if (!rules.some((r) => byRule[r])) console.log(`✓ ${name} holds`);
}
console.error(`\n[verify-context] ${ok ? 'GREEN — context coverage holds' : `${findings.length} violation(s) — RED`}${pilotMode ? ' [scope: pilot]' : ''}`);
if (!ok) {
  console.error('[verify-context] machine report: node scripts/verify-context-coverage.mjs --json');
  process.exit(1);
}
